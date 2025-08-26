import mongoose, { Schema, type InferSchemaType } from "mongoose";

// Keep every message as a separate doc.
// Pros: simple writes, easy to trim, easy to query "last N messages".
const ChatMessageSchema = new Schema({
  sessionId: { type: String, required: true },
  role:      { type: String, enum: ["user", "ai"], required: true },
  text:      { type: String, required: true },
  createdAt: { type: Date,   default: () => new Date() },
});

// Compound index for fast fetch of one session's recent messages
ChatMessageSchema.index({ sessionId: 1, createdAt: 1 });
ChatMessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 }); // 7 days
ChatMessageSchema.index({ sessionId: 1 });


export type ChatMessageDoc = InferSchemaType<typeof ChatMessageSchema>;

export const ChatMessage =mongoose.models.ChatMessage||
  mongoose.model<ChatMessageDoc>("ChatMessage", ChatMessageSchema);
