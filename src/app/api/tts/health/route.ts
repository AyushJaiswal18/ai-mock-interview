import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(_req: NextRequest) {
  const key = process.env.ELEVENLABS_API_KEY?.trim();
  const voiceId = process.env.ELEVENLABS_VOICE_ID?.trim();

  if (!key) {
    return NextResponse.json({ ok: false, error: "Missing ELEVENLABS_API_KEY" }, { status: 500 });
  }
  if (!voiceId) {
    return NextResponse.json({ ok: false, error: "Missing ELEVENLABS_VOICE_ID" }, { status: 500 });
  }

  try {
    const res = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: { "xi-api-key": key },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { ok: false, error: `Voices fetch failed: ${res.status} ${text}` },
        { status: 500 }
      );
    }

    const data = await res.json();
    const voices = Array.isArray(data?.voices) ? data.voices : [];
    const selected = voices.find((v: any) => v?.voice_id === voiceId);

    return NextResponse.json({
      ok: true,
      voices_found: voices.length,
      selected_voice: selected ? { id: selected.voice_id, name: selected.name } : null,
      hint: selected ? "Voice id looks valid ✅" : "Voice id not in your account list (double-check)",
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
