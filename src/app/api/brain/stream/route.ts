// src/app/api/brain/stream/route.ts
import { NextRequest } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { AIMessageChunk } from "@langchain/core/messages";
import { getMessagesForModel, addUserTurn, addAiTurn } from "@/lib/brain/memory"; // async now!
import { AI_CONFIG } from "@/lib/constants";
import { dbConnect } from "@/lib/db";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are ${AI_CONFIG.NAME}, a helpful, concise, voice-friendly assistant.
- Keep replies short, natural for speech.
- Use context from prior turns.
- If you need clarification, ask a brief follow-up.
- Avoid long code blocks and long lists.`;

// Reuse a single model instance
const model = new ChatOpenAI({
  modelName: AI_CONFIG.MODEL,
  temperature: 0.7,
  streaming: true,
  maxTokens: 800,
});

export async function POST(req: NextRequest) {
    await dbConnect();
  let sessionId: string | undefined;
  let lastUser: string | undefined;

  try {
    const body = await req.json();
    sessionId = body.sessionId;
    lastUser = body.lastUser;
  } catch {
    return new Response("Invalid or missing JSON body", { status: 400 });
  }

  if (!sessionId || !lastUser) {
    return new Response("Missing sessionId or lastUser", { status: 400 });
  }

  // ✅ await async writes
  await addUserTurn(sessionId, lastUser);

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = "";
      let finalText = "";

      const send = (payload: unknown) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));

      const flush = (final = false) => {
        const chunk = buffer.trim();
        if (!chunk) return;
        send({ text: chunk, final });
        buffer = "";
      };

      try {
        // ✅ await async read
        const messages = await getMessagesForModel(sessionId!, SYSTEM_PROMPT);

        // Stream the model output
        const iter = await model.stream(messages);

        for await (const part of iter) {
          const token =
            part instanceof AIMessageChunk
              ? (part.content ?? "")
              // @ts-ignore handle older shapes
              : (part?.content ?? part ?? "");

          if (!token) continue;

          buffer += String(token);
          finalText += String(token);

          if (buffer.length > 20 || /[.!?]\s$/.test(buffer)) flush(false);
        }

        flush(true);
        send("[DONE]");

        const cleanFinal = finalText.trim();
        if (cleanFinal) {
          // ✅ await async write
          await addAiTurn(sessionId!, cleanFinal);
        }

        controller.close();
      } catch (e: any) {
        send({ text: `Error: ${String(e?.message || e)}`, final: true });
        controller.close();
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
