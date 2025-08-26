import mongoose, { Schema, InferSchemaType } from "mongoose";

const JobOpeningSchema = new Schema({
  recruiterId: { type: Schema.Types.ObjectId, ref: "User", required: true },

  // Core JD
  title: { type: String, required: true },
  company: { type: String, default: "Confidential" },
  location: { type: String, default: "Remote" },
  locationType: { type: String, enum: ["onsite", "remote", "hybrid"], default: "remote" },
  employmentType: { type: String, enum: ["full-time", "part-time", "contract", "intern"], default: "full-time" },
  seniority: { type: String, enum: ["entry", "mid", "senior", "lead", "principal"], default: "mid" },
  team: { type: String, default: "Engineering" },
  industry: { type: String, default: "Software" },

  // Rich content (used as AI context)
  description: { type: String, required: true },              // full JD text
  responsibilities: { type: [String], default: [] },
  requirements: { type: [String], default: [] },              // must-have
  niceToHave: { type: [String], default: [] },
  primaryStack: { type: [String], default: [] },               // e.g. ["Next.js","Node","Postgres"]
  keywords: { type: [String], default: [] },                   // e.g. from a parser

  // Hiring prefs
  minExperienceYears: { type: Number, default: 2 },
  salaryMin: { type: Number },   // monthly or annual (your choice)
  salaryMax: { type: Number },
  currency: { type: String, default: "USD" },
  visaSponsorship: { type: Boolean, default: false },

  // Status/visibility
  status: { type: String, enum: ["draft", "open", "paused", "closed"], default: "open" },
  visibility: { type: String, enum: ["private", "internal", "public"], default: "private" },

  // Optional embeddings for future search/ranking
  embedding: { type: [Number], select: false },

  // Meta
  tags: { type: [String], default: [] },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() },
}, { minimize: false });

JobOpeningSchema.pre("save", function(next) {
  (this as any).updatedAt = new Date();
  next();
});

// Add individual indexes
JobOpeningSchema.index({ recruiterId: 1 });
JobOpeningSchema.index({ title: 1 });
JobOpeningSchema.index({ company: 1 });
JobOpeningSchema.index({ location: 1 });
JobOpeningSchema.index({ locationType: 1 });
JobOpeningSchema.index({ employmentType: 1 });
JobOpeningSchema.index({ seniority: 1 });
JobOpeningSchema.index({ status: 1 });
JobOpeningSchema.index({ visibility: 1 });
JobOpeningSchema.index({ createdAt: 1 });
JobOpeningSchema.index({ updatedAt: 1 });

JobOpeningSchema.index({ title: "text", company: "text", description: "text", keywords: "text", tags: "text" });
// src/lib/models/interview.ts  (add near top-level fields)

export type JobOpeningDoc = InferSchemaType<typeof JobOpeningSchema>;

export const JobOpening =
  (mongoose.models.JobOpening as mongoose.Model<JobOpeningDoc>) ||
  mongoose.model<JobOpeningDoc>("JobOpening", JobOpeningSchema);