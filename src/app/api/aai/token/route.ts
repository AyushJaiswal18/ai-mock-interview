export const runtime = "nodejs";

export async function GET() {
  try {
    const key = process.env.ASSEMBLYAI_API_KEY!;
    console.log('🔑 Requesting AssemblyAI token...');
    
    const r = await fetch("https://streaming.assemblyai.com/v3/token?expires_in_seconds=60", {
      headers: { Authorization: key },
    });
    
    if (!r.ok) {
      console.error('❌ Token request failed:', r.status, r.statusText);
      return new Response("token failed", { status: 500 });
    }
    
    const tokenData = await r.text();
    console.log('✅ Token received successfully');
    return new Response(tokenData, { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error('❌ Token error:', error);
    return new Response("token error", { status: 500 });
  }
}
