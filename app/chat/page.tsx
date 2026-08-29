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
import { AppHeader } from "@/components/AppHeader";
import { EmptyChatHints, ToolResultCards } from "@/components/chat/ToolCards";

const TOOL_LABELS: Record<string, string> = {
  get_citizen_profile: "Looking up synthetic profile",
  check_service_eligibility: "Running eligibility rules",
  fix_document_issue: "Marking document verified",
  find_available_slot: "Finding mock RTO slots",
  submit_application: "Filing mock application",
  track_application: "Reading tracker ID",
};

const APP_ID_RE = /PS[A-Za-z0-9_-]{10,}/;

function ChatInner() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q");
  const { lang, t } = useLanguage();
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
    <div className="flex min-h-[calc(100vh-2rem)] flex-col">
      <AppHeader />

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-3 pb-3 sm:px-4">
        <div className="mb-2 mt-3 flex items-center justify-between rounded-2xl border border-teal-100/80 bg-white/70 px-3 py-2 backdrop-blur">
          <div>
            <p className="text-sm font-semibold text-teal-950">Sathi desk</p>
            <p className="text-[11px] text-slate-500">
              {t("Open conversation · any DL", "खुली बातचीत · कोई भी DL")}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Reset chat"
            onClick={() => setMessages([])}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto rounded-[1.5rem] border border-teal-900/5 bg-white/50 px-3 py-4 sm:px-4">
          {messages.length === 0 && !isLoading && (
            <EmptyChatHints
              onPick={(text) => {
                void append({ role: "user", content: text });
              }}
            />
          )}

          <AnimatePresence initial={false}>
            {messages.map((m) => {
              const isUser = m.role === "user";
              const appMatch = !isUser ? m.content?.match(APP_ID_RE) : null;
              const toolResults =
                m.toolInvocations?.filter((ti) => ti.state === "result") ?? [];

              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                >
                  {m.content ? (
                    <div
                      className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        isUser
                          ? "rounded-br-md bg-[#D9F99D] text-teal-950"
                          : "rounded-bl-md border border-teal-100 bg-white text-slate-800 shadow-sm"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.content}</p>
                      {appMatch && (
                        <Link
                          href={`/track/${appMatch[0]}`}
                          className="mt-2 inline-flex rounded-full bg-teal-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-800"
                        >
                          View live tracker →
                        </Link>
                      )}
                    </div>
                  ) : null}

                  {!isUser &&
                    toolResults.map((ti) =>
                      ti.state === "result" ? (
                        <ToolResultCards
                          key={ti.toolCallId}
                          toolName={ti.toolName}
                          result={ti.result}
                        />
                      ) : null
                    )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {(isLoading || activeTools.length > 0) && (
            <div className="flex flex-col items-start gap-2">
              {activeTools.map((name) => (
                <span
                  key={name}
                  className="rounded-full bg-teal-900/90 px-3 py-1 text-xs font-medium text-teal-50"
                >
                  {TOOL_LABELS[name] || name}…
                </span>
              ))}
              <div className="flex gap-1 rounded-2xl border border-teal-100 bg-white px-4 py-3">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-2 w-2 rounded-full bg-brand-teal"
                    style={{
                      animation: `bounce-dot 1.4s infinite ease-in-out both`,
                      animationDelay: `${i * 0.16}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
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
          className="mt-3 rounded-[1.5rem] border border-teal-100 bg-white/90 p-2 shadow-lg backdrop-blur"
        >
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("Type freely in any language…", "किसी भी भाषा में लिखें…")}
              disabled={isLoading}
              className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-xl"
              aria-label="Voice input"
              onClick={() => setVoiceOpen(true)}
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Button
              type="submit"
              size="icon"
              className="rounded-xl bg-teal-900 text-white hover:bg-teal-800"
              disabled={isLoading || !input.trim()}
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>

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
      fallback={<div className="p-8 text-center text-sm text-slate-500">Loading desk…</div>}
    >
      <ChatInner />
    </Suspense>
  );
}
