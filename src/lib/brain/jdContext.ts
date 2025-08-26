import { JobOpening } from "@/lib/models/jobOpening";

export async function loadJobContext(jobOpeningId?: string) {
  if (!jobOpeningId) return "";
  const jd = await JobOpening.findById(jobOpeningId).lean();
  if (!jd) return "";

  const lines: string[] = [];
  lines.push(`Job Title: ${jd.title}`);
  lines.push(`Company: ${jd.company}`);
  lines.push(`Seniority: ${jd.seniority} | Type: ${jd.employmentType} | Location: ${jd.locationType} ${jd.location ? `(${jd.location})` : ""}`);
  if (jd.primaryStack?.length) lines.push(`Primary Stack: ${jd.primaryStack.join(", ")}`);
  if (jd.requirements?.length) lines.push(`Must-Have: ${jd.requirements.slice(0, 8).join("; ")}`);
  if (jd.niceToHave?.length) lines.push(`Nice-to-Have: ${jd.niceToHave.slice(0, 6).join("; ")}`);
  lines.push(`Description: ${jd.description?.slice(0, 1200)}`); // keep it brief, avoid blowing context window
  return lines.join("\n");
}