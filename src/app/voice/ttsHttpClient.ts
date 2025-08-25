export class HttpTTSQueue {
    private audio: HTMLAudioElement;
    private q: string[] = [];
    private busy = false;
    private stopped = false;
  
    constructor(audioEl?: HTMLAudioElement) {
      this.audio = audioEl ?? new Audio();
      this.audio.autoplay = true;
      this.audio.preload = "none";
      this.audio.addEventListener("ended", () => this.pump());
      this.audio.addEventListener("error", () => this.pump());
    }
  
    say(text: string) {
      if (!text) return;
      this.q.push(text);
      this.pump();
    }
  
    stop() {
      this.stopped = true;
      try { this.audio.pause(); } catch {}
      this.audio.src = "";
      this.q = [];
      this.busy = false;
    }
  
    isSpeaking() {
      return this.busy || this.q.length > 0 || !this.audio.paused;
    }
  
    // backpressure helpers (used by UI)
    __qLength() { return this.q.length; }
    __mergeTail(extra: string) {
      if (!extra) return;
      if (this.q.length === 0) { this.q.push(extra); return; }
      const last = this.q.pop()!;
      this.q.push((last.trim() + " " + extra.trim()).replace(/\s+/g, " "));
      this.pump();
    }
  
    private async pump() {
      if (this.busy || this.stopped) return;
      const next = this.q.shift();
      if (!next) return;
      this.busy = true;
  
      try {
        const url = `/api/tts/stream?q=${encodeURIComponent(next)}&lat=3`;
        this.audio.src = url;
        await this.audio.play().catch(() => {});
      } finally {
        this.busy = false;
        if (!this.stopped && this.q.length) this.pump();
      }
    }
  }
  