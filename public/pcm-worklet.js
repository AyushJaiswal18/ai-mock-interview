class PCMWorklet extends AudioWorkletProcessor {
  constructor(){ super(); this.buf=[]; this.ratio=sampleRate/16000; }
  process(inputs){
    const ch = inputs?.[0]?.[0]; if(!ch) return true;
    for(let i=0;i<ch.length;i+=this.ratio){
      const v = Math.max(-1, Math.min(1, ch[Math.floor(i)]||0));
      this.buf.push(v<0 ? v*0x8000 : v*0x7FFF);
    }
    const FRAME = 800; // ~50ms @16k
    while(this.buf.length>=FRAME){
      const out = new Int16Array(this.buf.splice(0,FRAME));
      this.port.postMessage(out.buffer, [out.buffer]);
    }
    return true;
  }
}
registerProcessor('pcm-worklet', PCMWorklet);
