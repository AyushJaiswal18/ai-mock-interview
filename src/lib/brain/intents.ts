// Simple end-intent detector for voice/chat
export function isEndIntent(text: string): boolean {
    if (!text) return false;
    const s = String(text).toLowerCase().trim();
  
    // exact short commands
    const exact = new Set([
      "end interview",
      "stop interview",
      "finish interview",
      "end the interview",
      "stop the interview",
      "finish the interview",
      "wrap up",
      "that's all",
      "that is all",
      "we can stop",
      "we are done",
      "i am done",
      "i'm done",
      "cancel interview",
      "terminate interview",
      "end it",
      "stop it"
    ]);
    if (exact.has(s)) return true;
  
    // loose patterns
    if (/\b(end|stop|finish|wrap|cancel|terminate)\b.*\b(interview|this)\b/.test(s)) return true;
    if (/^(end|stop|finish|cancel|terminate)\b/.test(s)) return true;
    if (/\bwe(\s+can)?\s+stop\b/.test(s)) return true;
    if (/\b(that('| i)s)?\s*all\b/.test(s)) return true;
  
    return false;
  }