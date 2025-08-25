// public/pcm-worklet.js
// Downsample input (whatever the AudioContext runs at) to 16 kHz mono PCM S16LE.
// - linear interpolation resampler (simple & low-cost)
// - frame = 640 samples (~40 ms @16 kHz) for a good latency/overhead balance
// - transferable posts to keep GC pressure low

class PCMWorklet extends AudioWorkletProcessor {
  constructor() {
    super();
    // WebAudio provides sampleRate inside the worklet context
    this.inRate = sampleRate;           // e.g., 48000 or 44100
    this.outRate = 16000;
    this.ratio = this.inRate / this.outRate;
    this.phase = 0;                     // fractional read pointer
    this.prev = 0;                      // last sample for continuity
    this.frameSize = 800;               // 40ms @16k. Use 320 for 20ms if you want lower latency.
    this.outBuf = new Int16Array(this.frameSize);
    this.outFill = 0;
  }

  // Convert [-1, 1] float → int16 little-endian value
  static f32_to_i16(x) {
    const v = Math.max(-1, Math.min(1, x));
    return v < 0 ? (v * 0x8000) | 0 : (v * 0x7FFF) | 0;
  }

  process(inputs) {
    const ch = inputs?.[0]?.[0];
    if (!ch || ch.length === 0) return true;

    // Downsample using linear interpolation between input frames
    let readPos = this.phase; // fractional index into `ch`
    const inLen = ch.length;

    while (readPos < inLen - 1) {
      const idx = Math.floor(readPos);
      const frac = readPos - idx;

      // sample at idx and idx+1
      const s0 = idx >= 0 ? ch[idx] : this.prev;      // safe start edge
      const s1 = ch[idx + 1];

      // linear interpolation
      const s = s0 + (s1 - s0) * frac;

      // write to output
      this.outBuf[this.outFill++] = PCMWorklet.f32_to_i16(s);

      // flush full frames
      if (this.outFill === this.frameSize) {
        // Transfer underlying buffer (zero-copy to main thread)
        const out = this.outBuf;
        this.port.postMessage(out.buffer, [out.buffer]);
        // allocate a new buffer for the next frame
        this.outBuf = new Int16Array(this.frameSize);
        this.outFill = 0;
      }

      // advance fractional read position by ratio
      readPos += this.ratio;
    }

    // Save continuity state for next call
    this.phase = readPos - (inLen - 1); // carry remaining fractional over next block
    // The last actual input sample becomes the "previous" for the next process() call
    this.prev = ch[inLen - 1];

    return true;
  }
}

registerProcessor('pcm-worklet', PCMWorklet);
