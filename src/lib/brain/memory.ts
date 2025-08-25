import {
    AIMessage,
    HumanMessage,
    SystemMessage,
    type BaseMessage,
  } from "@langchain/core/messages";
  import { ChatMessage } from "@/lib/models/chatMessage";
  
  const MAX_TURNS = 12; // keep last 12 user↔ai pairs
  
  function toLc(role: "user" | "ai", text: string): BaseMessage {
    return role === "user" ? new HumanMessage(text) : new AIMessage(text);
  }
  
  /** Append a user message and trim session to MAX_TURNS. */
  export async function addUserTurn(sessionId: string, text: string) {
    await ChatMessage.create({ sessionId, role: "user", text });
    await trimSession(sessionId);
  }
  
  /** Append an AI message and trim session to MAX_TURNS. */
  export async function addAiTurn(sessionId: string, text: string) {
    await ChatMessage.create({ sessionId, role: "ai", text });
    await trimSession(sessionId);
  }
  
  /** Get messages for the model: system prompt (optional) + last N*2 msgs ascending. */
  export async function getMessagesForModel(
    sessionId: string,
    systemPrompt?: string
  ): Promise<BaseMessage[]> {
    const docs = await ChatMessage.find({ sessionId })
      .sort({ createdAt: 1 }) // chronological
      .limit(MAX_TURNS * 2)
      .lean();
  
    const msgs: BaseMessage[] = docs.map((d) => toLc(d.role as any, d.text));
    return systemPrompt ? [new SystemMessage(systemPrompt), ...msgs] : msgs;
  }
  
  /** Delete all messages for a session. */
  export async function resetSession(sessionId: string) {
    await ChatMessage.deleteMany({ sessionId });
  }
  
  /** List active session IDs (most recent first). */
  export async function listSessions(): Promise<string[]> {
    const rows = await ChatMessage.aggregate([
      { $group: { _id: "$sessionId", last: { $max: "$createdAt" } } },
      { $sort: { last: -1 } },
      { $limit: 200 },
    ]);
    return rows.map((r) => r._id as string);
  }
  
  /** Keep only the most recent MAX_TURNS*2 messages for the session. */
  async function trimSession(sessionId: string) {
    const keep = MAX_TURNS * 2;
    // Find ids of messages older than the latest `keep`
    const idsToDelete = await ChatMessage.find({ sessionId })
      .sort({ createdAt: -1 }) // newest first
      .skip(keep)
      .select({ _id: 1 })
      .lean();
  
    if (idsToDelete.length) {
      await ChatMessage.deleteMany({ _id: { $in: idsToDelete.map((d) => d._id) } });
    }
  }
  