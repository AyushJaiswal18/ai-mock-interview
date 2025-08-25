import { NextRequest } from "next/server";
import { ChatOpenAI } from "@langchain/openai";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are a concise, friendly interviewer. 
Speak naturally in short sentences. Avoid long paragraphs or code blocks.`;

export async function POST(req: NextRequest) {
  // Parse JSON safely
  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid or missing JSON body", { status: 400 });
  }

  const sessionId = String(body?.sessionId || "");
  const lastUser = String(body?.lastUser || "");
  if (!sessionId || !lastUser) {
    return new Response("Missing sessionId or lastUser", { status: 400 });
  }

  // Model
  const model = new ChatOpenAI({
    modelName: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.5,
    streaming: true,
    maxTokens: 600,
  });

  const enc = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      // heartbeat to keep proxies from buffering
      const ping = setInterval(() => {
        controller.enqueue(enc.encode(`event: ping\ndata: {"t":${Date.now()}}\n\n`));
      }, 15000);

      let buffer = "";
      let lastFlush = Date.now();

      const flush = (final = false) => {
        const chunk = buffer.trim();
        if (!chunk) return;
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ text: chunk, final })}\n\n`));
        buffer = "";
        lastFlush = Date.now();
      };

      try {
        // Keep it very simple first (no LC history yet)
        const iter = await model.stream([
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: lastUser },
        ]);

        for await (const part of iter) {
          // Normalize token pieces from LangChain
          let token = "";
          const any = part as any;
          if (typeof any === "string") token = any;
          else if (typeof any?.content === "string") token = any.content;
          else if (Array.isArray(any?.content)) token = any.content.map((c: any) => c?.text ?? "").join("");
          else if (typeof any?.delta === "string") token = any.delta;

          if (!token) continue;
          buffer += token;

          const endsSentence = /[.!?…]["’”)]?\s$/.test(buffer);
          const longPhrase = buffer.split(/\s+/).length >= 14;
          const idle = Date.now() - lastFlush > 220;

          if (endsSentence || longPhrase || idle) flush(false);
        }

        flush(true);
        controller.close();
      } catch (err: any) {
        controller.enqueue(
          enc.encode(`event: error\ndata: ${JSON.stringify({ error: String(err?.message || err) })}\n\n`)
        );
        controller.close();
      } finally {
        clearInterval(ping);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store, no-transform",
      Connection: "keep-alive",
    },
  });
}
