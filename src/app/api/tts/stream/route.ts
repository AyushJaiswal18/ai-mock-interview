import { NextRequest } from "next/server";

export const runtime = "nodejs";

const API_KEY = process.env.ELEVENLABS_API_KEY!;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"; // Rachel
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";

// GET /api/tts/stream?q=hello+world
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  if (!API_KEY) return new Response("Missing ELEVENLABS_API_KEY", { status: 500 });
  if (!q) return new Response("Missing q", { status: 400 });

  // Latency preset: 0 (highest quality) → 4 (fastest)
  const optimize_streaming_latency = searchParams.get("lat") || "3";

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(
    VOICE_ID
  )}/stream?optimize_streaming_latency=${encodeURIComponent(
    optimize_streaming_latency
  )}&output_format=mp3_44100_128`;

  const body = {
    text: q,
    model_id: MODEL_ID,
    // Optional: tweak these to taste
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.0,
      use_speaker_boost: true,
    },
  };

  try {
    const r = await fetch(url, {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify(body),
    });

    if (!r.ok || !r.body) {
      const txt = await r.text().catch(() => "");
      return new Response(`TTS failed: ${r.status} ${txt}`, { status: 502 });
    }

    // Stream audio/mpeg straight through
    return new Response(r.body, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store, no-transform",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (e: any) {
    return new Response(`TTS error: ${e?.message || e}`, { status: 500 });
  }
}
