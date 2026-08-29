"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Mic, Square, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onResult: (text: string) => void;
  lang: "en" | "hi";
};

export function VoiceInput({ open, onClose, onResult, lang }: Props) {
  const [listening, setListening] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!open) {
      cleanup();
      setListening(false);
      setUploading(false);
      setInterim("");
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function cleanup() {
    try {
      mediaRef.current?.state !== "inactive" && mediaRef.current?.stop();
    } catch {
      /* ignore */
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    mediaRef.current = null;
    chunksRef.current = [];
  }

  async function start() {
    setError(null);
    setInterim("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Microphone not supported in this browser. Please type instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "";

      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      mediaRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        setListening(false);
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        if (blob.size < 200) {
          setError("Recording too short. Hold Start, speak, then press Stop.");
          return;
        }

        setUploading(true);
        setInterim("Transcribing with OpenAI…");
        try {
          const form = new FormData();
          form.append("audio", blob, "speech.webm");
          form.append("lang", lang);
          const res = await fetch("/api/transcribe", { method: "POST", body: form });
          const data = await res.json();
          if (!res.ok) {
            setError(data.error || "Transcription failed");
            setInterim("");
            return;
          }
          const text = String(data.text || "").trim();
          if (!text) {
            setError("No speech detected. Please try again.");
            setInterim("");
            return;
          }
          setInterim(text);
          onResult(text);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Network error while transcribing");
          setInterim("");
        } finally {
          setUploading(false);
        }
      };

      recorder.start(250);
      setListening(true);
      setInterim(lang === "hi" ? "बोलिए… फिर Stop दबाएँ" : "Speak now… then press Stop");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(
        msg.toLowerCase().includes("permission") || msg.toLowerCase().includes("denied")
          ? "Microphone permission denied. Allow mic access and try again."
          : "Could not access microphone. Check browser permissions."
      );
    }
  }

  function stop() {
    if (mediaRef.current && mediaRef.current.state !== "inactive") {
      mediaRef.current.stop();
    } else {
      setListening(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Voice input"
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brand-teal">Speak to Sathi</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              cleanup();
              onClose();
            }}
            aria-label="Close"
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="mb-4 text-sm text-slate-600">
          Uses OpenAI speech-to-text (Whisper / GPT transcribe). Prefer free quota models; paid
          wallet only if needed. Hindi or English.
        </p>
        <div className="mb-4 min-h-[3rem] rounded-lg border border-teal-100 bg-teal-50/50 p-3 text-sm text-slate-700">
          {uploading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> {interim || "Transcribing…"}
            </span>
          ) : (
            interim || (listening ? "Listening… press Stop when done" : "Tap Start, speak, then Stop")
          )}
        </div>
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          {!listening && !uploading ? (
            <Button className="flex-1 gap-2" onClick={start}>
              <Mic className="h-4 w-4" /> Start
            </Button>
          ) : listening ? (
            <Button className="flex-1 gap-2" variant="amber" onClick={stop}>
              <Square className="h-4 w-4" /> Stop &amp; transcribe
            </Button>
          ) : (
            <Button className="flex-1 gap-2" disabled>
              <Loader2 className="h-4 w-4 animate-spin" /> Working…
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => {
              cleanup();
              onClose();
            }}
            disabled={uploading}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
