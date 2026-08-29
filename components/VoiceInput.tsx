"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onResult: (text: string) => void;
  lang: "en" | "hi";
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((ev: { results: SpeechRecognitionResultList }) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
};

export function VoiceInput({ open, onClose, onResult, lang }: Props) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recogRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    if (!open) {
      recogRef.current?.stop();
      setListening(false);
      setInterim("");
      setError(null);
    }
  }, [open]);

  function start() {
    setError(null);
    const W = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!Ctor) {
      setError(
        "Voice input needs Chrome/Edge browser speech. You can type instead — no API cost."
      );
      return;
    }
    const recog = new Ctor();
    recog.lang = lang === "hi" ? "hi-IN" : "en-IN";
    recog.continuous = false;
    recog.interimResults = true;
    recog.onresult = (ev) => {
      let finalText = "";
      let interimText = "";
      for (let i = 0; i < ev.results.length; i++) {
        const r = ev.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interimText += r[0].transcript;
      }
      setInterim(interimText || finalText);
      if (finalText.trim()) {
        onResult(finalText.trim());
      }
    };
    recog.onerror = (ev) => {
      setError(ev.error === "not-allowed" ? "Microphone permission denied." : ev.error);
      setListening(false);
    };
    recog.onend = () => setListening(false);
    recogRef.current = recog;
    recog.start();
    setListening(true);
  }

  function stop() {
    recogRef.current?.stop();
    setListening(false);
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
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="mb-4 text-sm text-slate-600">
          Uses your browser speech recognition (free — no Whisper API spend). Hindi or English.
        </p>
        <div className="mb-4 min-h-[3rem] rounded-lg border border-teal-100 bg-teal-50/50 p-3 text-sm text-slate-700">
          {interim || (listening ? "Listening…" : "Tap the mic and speak")}
        </div>
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          {!listening ? (
            <Button className="flex-1 gap-2" onClick={start}>
              <Mic className="h-4 w-4" /> Start
            </Button>
          ) : (
            <Button className="flex-1 gap-2" variant="amber" onClick={stop}>
              <Square className="h-4 w-4" /> Stop
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
