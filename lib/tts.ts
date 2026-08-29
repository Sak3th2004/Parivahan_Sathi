/** Browser TTS — zero OpenAI spend */

export function speakText(text: string, lang: "en" | "hi" = "en") {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.slice(0, 400));
    u.lang = lang === "hi" ? "hi-IN" : "en-IN";
    u.rate = 1.05;
    window.speechSynthesis.speak(u);
  } catch {
    // ignore TTS failures
  }
}

export function stopSpeaking() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}
