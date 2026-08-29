"use client";

import { useChat } from "ai/react";
import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, RotateCcw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/components/LanguageContext";
import { VoiceInput } from "@/components/VoiceInput";
import { speakText } from "@/lib/tts";

const TOOL_LABELS: Record<string, string> = {
  get_citizen_profile: "Looking up your profile",
  check_service_eligibility: "Checking eligibility",
  fix_document_issue: "Updating document",
  find_available_slot: "Finding a slot",
  submit_application: "Filing your application",
  track_application: "Fetching status",
};

const APP_ID_RE = /PS[A-Za-z0-9_-]{10,}/;

function ChatInner() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q");
  const { lang, toggle, t } = useLanguage();
  const [voiceOpen, setVoiceOpen] = useState(false);
  const bootstrapped = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, input, setInput, handleSubmit, isLoading, setMessages, append, error } =
    useChat({
      api: "/api/agent",
      onFinish: (message) => {
        if (message.content) speakText(message.content, lang);
      },
    });

  useEffect(() => {
    if (bootstrapped.current || !q) return;
    bootstrapped.current = true;
    void append({ role: "user", content: q });
  }, [q, append]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const activeTools = useMemo(() => {
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    if (!last?.toolInvocations?.length) return [];
    return last.toolInvocations
      .filter((ti) => ti.state === "call" || ti.state === "partial-call")
      .map((ti) => ti.toolName);
  }, [messages]);

  return (
    <div className="mx-auto flex h-[calc(100vh-2.5rem)] max-w-2xl flex-col">
      <header className="flex items-center justify-between border-b border-teal-100 bg-white/80 px-4 py-3 backdrop-blur">
        <Link href="/" className="font-semibold text-brand-teal">
          Parivahan Sathi
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={toggle}>
            {lang === "en" ? "हिंदी" : "EN"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Reset chat"
            onClick={() => setMessages([])}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && !isLoading && (
          <p className="text-center text-sm text-slate-500">
            {t(
              "Tell me what you need — renew DL, transfer a vehicle, or change address. Any DL number works.",
              "बताइए क्या चाहिए — DL renew, गाड़ी transfer, या address change. कोई भी DL नंबर चलेगा।"
            )}
          </p>
        )}

        <AnimatePresence initial={false}>
          {messages.map((m) => {
            const isUser = m.role === "user";
            const appMatch = !isUser ? m.content.match(APP_ID_RE) : null;
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isUser
                      ? "bg-brand-amber text-slate-900"
                      : "border border-teal-200 bg-white text-slate-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  {appMatch && (
                    <Link
                      href={`/track/${appMatch[0]}`}
                      className="mt-2 inline-flex rounded-md bg-brand-teal px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-800"
                    >
                      View live tracker →
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {(isLoading || activeTools.length > 0) && (
          <div className="flex flex-col items-start gap-2">
            {activeTools.map((name) => (
              <span
                key={name}
                className="rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-800"
              >
                {TOOL_LABELS[name] || name}…
              </span>
            ))}
            <div className="flex gap-1 rounded-2xl border border-teal-200 bg-white px-4 py-3">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-2 w-2 rounded-full bg-brand-teal"
                  style={{ animation: `bounce-dot 1.4s infinite ease-in-out both`, animationDelay: `${i * 0.16}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {t(
              "Something went wrong connecting to the assistant. Please try again.",
              "सहायक से कनेक्ट नहीं हो पाया। कृपया फिर कोशिश करें।"
            )}
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-teal-100 bg-white/90 px-3 py-3 backdrop-blur"
      >
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("Type your message…", "अपना संदेश लिखें…")}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Voice input"
            onClick={() => setVoiceOpen(true)}
          >
            <Mic className="h-4 w-4" />
          </Button>
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()} aria-label="Send">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>

      <VoiceInput
        open={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        lang={lang}
        onResult={(transcript) => {
          setVoiceOpen(false);
          void append({ role: "user", content: transcript });
        }}
      />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={<div className="p-8 text-center text-sm text-slate-500">Loading chat…</div>}
    >
      <ChatInner />
    </Suspense>
  );
}
