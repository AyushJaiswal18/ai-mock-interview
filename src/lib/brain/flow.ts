import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { AI_CONFIG } from "@/lib/constants";
import { addUserTurn, addAiTurn, getMessagesForModel } from "@/lib/brain/memory";
import { Interview } from "@/lib/models/interview";
import { loadJobContext } from "@/lib/brain/jdContext";

/* ── Models ─────────────────────────────────────────────────────────────── */

const qnaModel = new ChatOpenAI({
  modelName: AI_CONFIG.MODEL,
  temperature: 0.5,       // slightly warmer than 0.4 for natural tone
  maxTokens: 700,
  streaming: false,
});

const judgeModel = new ChatOpenAI({
  modelName: AI_CONFIG.MODEL,
  temperature: 0.0,
  maxTokens: 180,
  streaming: false,
});

/* ── System Prompt ──────────────────────────────────────────────────────── */

const SYSTEM_BASE = (
  name?: string,
  role?: string,
  stack?: string,
  jdText?: string,
  askedTopicsCSV?: string
) => `
You are ${AI_CONFIG.NAME}, a warm, encouraging technical interviewer.
Keep turns SHORT and voice-friendly.

Candidate: ${name || "the candidate"}
Role: ${role || "Software Engineer"}
Primary stack: ${stack || "Full-Stack"}

Hiring context (from recruiter JD):
${jdText || "—"}

Already asked topics: ${askedTopicsCSV || "(none)"}

Conversation style:
- Brief, human back-channels (e.g., “got it”, “thanks”, “okay”) before the question
- ONE clear question per turn, <= 20 words
- No multi-part questions, no lists, no code
- Encourage gently if they seem unsure (“take your time”)
- Use natural punctuation (commas, em dashes) to help TTS cadence
- Strongly align questions to JD; avoid repeating topics
`;

/* ── Helpers ────────────────────────────────────────────────────────────── */

function nextStage(curr: string, turn: number) {
  if (curr === "intro") return "warmup";
  if (curr === "warmup" && turn >= 2) return "core";
  if (curr === "core" && turn >= 6) return "followup";
  if (curr === "followup" && turn >= 8) return "wrap";
  return curr;
}

function toStr(res: any): string {
  const c = res?.content ?? res;
  if (typeof c === "string") return c;
  if (Array.isArray(c)) return c.map((p) => (typeof p === "string" ? p : p?.text || "")).join("");
  if (c && typeof c === "object") {
    if (typeof (c as any).text === "string") return (c as any).text;
    try { return JSON.stringify(c); } catch { /* ignore */ }
  }
  return String(c ?? "");
}

// Robust JSON extractor (handles stray text, code fences)
function safeParseTurnJSON(text: string): {
  ack?: string; question?: string; rubric?: string; topic_tag?: string;
} {
  // Try plain parse first
  try {
    const j = JSON.parse(text);
    return j;
  } catch {}

  // Try to find last {...} block
  const m = text.match(/\{[\s\S]*\}$/m);
  if (m) {
    try { return JSON.parse(m[0]); } catch {}
  }

  // Fallback: try older parser (QUESTION/RUBRIC) and synthesize
  const qMatch = text.match(/QUESTION:\s*([\s\S]*?)\nRUBRIC:/i);
  const rMatch = text.match(/RUBRIC:\s*([\s\S]*)$/i);
  const question = (qMatch?.[1] || "").replace(/\s+/g, " ").trim();
  const rubric = (rMatch?.[1] || "").replace(/\s+/g, " ").trim();
  return { ack: "Okay.", question, rubric, topic_tag: "misc" };
}

/* ── Scoring ────────────────────────────────────────────────────────────── */

export async function scoreAnswer(answer: string, rubric: string) {
  const prompt = `
Rubric:
${rubric || "(none)"}

Answer:
${answer}

Score 1–5 (integer) and one-sentence reason.
Return JSON exactly: {"score": <1-5>, "reason": "<short>"}
`;
  const res = await judgeModel.invoke(prompt);
  try {
    const json = JSON.parse(toStr(res));
    const score = Math.max(1, Math.min(5, Number(json.score || 3)));
    const reason = String(json.reason || "Reasonable answer.");
    return { score, reason };
  } catch {
    return { score: 3, reason: "Reasonable answer." };
  }
}

/* ── Flow Core ──────────────────────────────────────────────────────────── */

async function ensureFlow(interviewId: string) {
  const inv = await Interview.findById(interviewId);
  if (!inv) throw new Error("Interview not found");

  inv.metadata = (inv.metadata || {}) as any;
  inv.metadata.flow = inv.metadata.flow || {
    stage: "intro",
    turn: 0,
    currentQuestion: "",
    currentRubric: "",
    scores: [],
    topicsAsked: [] as string[],
  };
  if (!inv.metadata.sessionId) {
    inv.metadata.sessionId = String(inv._id);
  }
  return { inv, flow: inv.metadata.flow as any };
}

async function buildNextTurn(sessionId: string) {
  const { inv, flow } = await ensureFlow(sessionId);

  const jdText = await loadJobContext(inv.jobOpeningId ? String(inv.jobOpeningId) : undefined);
  const role = inv.config?.category || "Software Engineer";
  const stack = inv.config?.industry || "Full-Stack";

  const askedTopics = Array.isArray(flow.topicsAsked) ? flow.topicsAsked : [];
  const system = SYSTEM_BASE(undefined, role, stack, jdText, askedTopics.join(", "));

  const history = await getMessagesForModel(sessionId, system);

  const instruct = `
Return ONLY valid minified JSON with these keys:

{
  "ack": "<=12 words warm back-channel (no question mark)>",
  "question": "<ONE direct question, <=20 words, no lists>",
  "rubric": "<private rubric, 1 short paragraph>",
  "topic_tag": "<kebab-case topic like 'state-management' or 'http-caching'>"
}

Hard rules:
- "ack" must NOT contain a question.
- "question" must be ONE sentence, aligned with the JD, and avoid topics already asked: [${askedTopics.join(", ")}].
- Keep it conversational and supportive. Use natural punctuation (commas, em dashes).
- No markdown, no code fences, no extra text outside JSON.
`;

  const res = await qnaModel.invoke([...history, new HumanMessage(instruct)]);
  const parsed = safeParseTurnJSON(toStr(res));

  // sanity trims + caps
  const ack = (parsed.ack || "Okay.").trim();
  const question = (parsed.question || "Let’s begin — could you briefly introduce your background?").trim();
  const rubric = (parsed.rubric || "").trim();
  const topic = (parsed.topic_tag || "general").trim().toLowerCase();

  return { ack, question, rubric, topic };
}

/* ── Public API ─────────────────────────────────────────────────────────── */

export async function startSession(
  sessionId: string,
  opts?: { name?: string; role?: string; stack?: string }
) {
  const { inv, flow } = await ensureFlow(sessionId);

  if (opts?.name || opts?.role || opts?.stack) {
    inv.metadata.persona = {
      ...(inv.metadata.persona || {}),
      name: opts.name ?? inv.metadata.persona?.name,
      role: opts.role ?? inv.metadata.persona?.role,
      stack: opts.stack ?? inv.metadata.persona?.stack,
    };
  }

  const { ack, question, rubric, topic } = await buildNextTurn(sessionId);
  flow.currentQuestion = question;
  flow.currentRubric = rubric;
  flow.topicsAsked = Array.from(new Set([...(flow.topicsAsked || []), topic]));
  await inv.save();

  // Seed history with AI turn (ack + question) for continuity
  await addAiTurn(sessionId, `${ack} ${question}`.trim());

  return { ack, question, stage: flow.stage, turn: flow.turn };
}

export async function handleTurn(sessionId: string, userText: string) {
  await addUserTurn(sessionId, userText);

  const { inv, flow } = await ensureFlow(sessionId);

  if (flow.currentQuestion) {
    try {
      const { score, reason } = await scoreAnswer(userText, flow.currentRubric || "");
      flow.scores = flow.scores || [];
      flow.scores.push({
        turn: flow.turn,
        question: flow.currentQuestion,
        score,
        reasoning: reason,
        answer: userText,
        createdAt: new Date(),
      });
    } catch { /* ignore */ }
  }

  flow.turn = (flow.turn || 0) + 1;
  flow.stage = nextStage(flow.stage || "intro", flow.turn);

  const { ack, question, rubric, topic } = await buildNextTurn(sessionId);

  flow.currentQuestion = question;
  flow.currentRubric = rubric;
  flow.topicsAsked = Array.from(new Set([...(flow.topicsAsked || []), topic]));
  await inv.save();

  const reply = `${ack} ${question}`.trim();

  await addAiTurn(sessionId, reply);

  return {
    ack,
    question,
    reply,
    stage: flow.stage,
    turn: flow.turn,
    rubric: flow.currentRubric,
    topic,
  };
}