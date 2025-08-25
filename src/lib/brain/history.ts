import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";

const local = new Map<string, InMemoryChatMessageHistory>();

export function getBrainHistory(sessionId: string) {
  if (!local.has(sessionId)) {
    local.set(sessionId, new InMemoryChatMessageHistory());
  }
  return local.get(sessionId)!;
}
