import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Prefer cheaper/newer transcribe models first; whisper-1 as reliable fallback */
const TRANSCRIBE_MODELS = [
  process.env.OPENAI_TRANSCRIBE_MODEL || "gpt-4o-mini-transcribe",
  "whisper-1",
].filter((v, i, a) => a.indexOf(v) === i);

export async function POST(req: NextRequest) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return Response.json({ error: "OPENAI_API_KEY missing" }, { status: 500 });
  }

  const form = await req.formData();
  const file = form.get("audio");
  const lang = String(form.get("lang") || "en");

  if (!(file instanceof Blob) || file.size < 100) {
    return Response.json({ error: "No audio recorded. Hold the mic and speak clearly." }, { status: 400 });
  }

  let lastError = "Transcription failed";

  for (const model of TRANSCRIBE_MODELS) {
    try {
      const body = new FormData();
      // OpenAI expects a filename with extension
      const filename = file.type.includes("mp4") || file.type.includes("m4a")
        ? "speech.m4a"
        : file.type.includes("ogg")
          ? "speech.ogg"
          : "speech.webm";
      body.append("file", file, filename);
      body.append("model", model);
      // whisper-1 supports language hint; some newer models may ignore it
      if (model === "whisper-1") {
        body.append("language", lang === "hi" ? "hi" : "en");
      }
      body.append("response_format", "json");

      const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}` },
        body,
      });

      const data = await res.json();
      if (!res.ok) {
        lastError = data?.error?.message || `Model ${model} failed (${res.status})`;
        console.warn("[transcribe]", model, lastError);
        continue;
      }

      const text = String(data.text || "").trim();
      if (!text) {
        lastError = "No speech detected. Please try again.";
        continue;
      }

      console.warn(`[transcribe] ok via ${model}`);
      return Response.json({ text, modelUsed: model });
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      console.warn("[transcribe] exception", model, lastError);
    }
  }

  return Response.json({ error: lastError }, { status: 502 });
}
