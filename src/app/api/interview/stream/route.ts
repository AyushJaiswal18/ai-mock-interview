// src/app/api/interview/stream/route.ts
import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { withDB } from "@/lib/db-utils";
import { Interview } from "@/lib/models/interview";
import { handleTurn } from "@/lib/brain/flow";
import { requireAuth, AuthenticatedRequest } from "@/lib/auth-middleware";
import { isEndIntent } from "@/lib/brain/intents";

export const runtime = "nodejs";

export const POST = requireAuth(async (request: AuthenticatedRequest) => {
  return withDB(async () => {
    const userId = request.user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let sessionId: string | undefined;
    let lastUser: string | undefined;

    try {
      const body = await request.json();
      sessionId = body?.sessionId;
      lastUser = body?.lastUser;
    } catch {
      return NextResponse.json({ error: "Invalid or missing JSON body" }, { status: 400 });
    }

    if (!sessionId || !lastUser) {
      return NextResponse.json({ error: "Missing sessionId or lastUser" }, { status: 400 });
    }
    if (!Types.ObjectId.isValid(sessionId)) {
      return NextResponse.json({ error: "Invalid sessionId" }, { status: 400 });
    }

    // Verify ownership
    const interview = await Interview.findById(sessionId);
    if (!interview) return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    if (String(interview.candidateId) !== String(userId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const encoder = new TextEncoder();

    // If user asked to END → mark completed and stream final ack/meta
    if (isEndIntent(lastUser!)) {
      interview.status = "completed";
      interview.endedAt = new Date();
      interview.metadata = (interview.metadata || {}) as any;
      const flow = (interview.metadata.flow = interview.metadata.flow || {});
      flow.stage = "wrap";
      await interview.save();

      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          const send = (payload: unknown) =>
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
          // Short, voice-friendly goodbye
          send({ text: "Understood — ending the interview now. Great job today.", final: false });
          send({ text: "", meta: { stage: "wrap", ended: true }, final: true });
          send("[DONE]");
          controller.close();
        },
      });

      return new NextResponse(stream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
        },
      });
    }

    // Otherwise, normal turn handling
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (payload: unknown) =>
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        try {
          const { ack, question, stage, turn } = await handleTurn(sessionId!, lastUser!);

          const ackText = String(ack ?? "").trim();
          if (ackText) send({ text: ackText, final: false });

          const q = String(question ?? "");
          let buf = "";
          for (const t of q.split(/(\s+)/)) {
            buf += t;
            if (buf.length >= 26 || /[.!?]\s$/.test(buf)) {
              send({ text: buf, final: false });
              buf = "";
            }
          }
          if (buf) send({ text: buf, final: false });

          send({ text: "", meta: { stage, turn, newQuestion: String(question ?? "") }, final: true });
          send("[DONE]");
        } catch (e: any) {
          send({ text: `Error: ${String(e?.message || e)}`, final: true });
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  });
});