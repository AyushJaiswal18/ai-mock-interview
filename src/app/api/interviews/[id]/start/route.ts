// src/app/api/interviews/[id]/start/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { Interview } from "@/lib/models/interview";
import { User } from "@/lib/models/user";
import { startSession } from "@/lib/brain/flow";
import { AuthenticatedRequest, requireAuth } from "@/lib/auth-middleware";
import { withDB } from "@/lib/db-utils";

export const runtime = "nodejs";

type Params = { params: { id: string } };



export const POST = requireAuth(async (request: AuthenticatedRequest, { params }: Params) => {
  return withDB(async () => {
     // ✅ Get user id on the server
  const userId = request.user?.id;
  console.log("userId", userId);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const interviewId = params.id;
  if (!Types.ObjectId.isValid(interviewId)) {
    return NextResponse.json({ error: "Invalid interview id" }, { status: 400 });
  }

  const interview = await Interview.findById(interviewId);
  if (!interview) return NextResponse.json({ error: "Interview not found" }, { status: 404 });

  // Only the candidate who owns this interview can start it
  if (String(interview.candidateId) !== String(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Bind session to interviewId, set status, set startedAt
  interview.metadata = (interview.metadata || {}) as any;
  interview.metadata.sessionId = String(interview._id);

  if (interview.status !== "in-progress") {
    interview.status = "in-progress";
    interview.startedAt = new Date();
  }

  // Optional personalization
  const user:any = await User.findById(userId).lean();
  const name =
    (user?.firstName || user?.lastName)
      ? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()
      : undefined;

  await interview.save();

  // Ask the flow for the first question
  const out = await startSession(String(interview._id), {
    name,
    role: interview.config?.category || "Software Engineer",
    stack: interview.config?.industry || "Full-Stack",
  });

  // Mirror current question into Interview metadata.flow
  const inv = await Interview.findById(interviewId);
  inv!.metadata = (inv!.metadata || {}) as any;
  inv!.metadata.flow = inv!.metadata.flow || ({} as any);
  inv!.metadata.flow.currentQuestion = out.question;
  await inv!.save();

  return NextResponse.json({
    interviewId,
    sessionId: String(interview._id),   // use this on the client
    stage: out.stage,
    question: out.question,
  });

  });
});