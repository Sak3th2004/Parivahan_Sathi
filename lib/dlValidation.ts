/**
 * Validate DL-like input for the open demo.
 * Allows invented DLs, but rejects URLs / localhost / empty junk so judges
 * don't accidentally feed page addresses into the citizen engine.
 */

export type DlValidation =
  | { ok: true; normalized: string }
  | { ok: false; reason: string; reasonHi: string };

export function validateDlInput(raw: string): DlValidation {
  const trimmed = raw.trim();
  if (trimmed.length < 3) {
    return {
      ok: false,
      reason: "Please enter a driving licence number (at least 3 characters).",
      reasonHi: "कृपया ड्राइविंग लाइसेंस नंबर दर्ज करें (कम से कम 3 अक्षर)।",
    };
  }

  const lower = trimmed.toLowerCase();
  const looksLikeUrl =
    /^https?:\/\//i.test(trimmed) ||
    /^www\./i.test(trimmed) ||
    lower.includes("localhost") ||
    lower.includes("127.0.0.1") ||
    /\.(com|in|org|net|app|io|dev)(\/|$)/i.test(trimmed) ||
    lower.includes("vercel.app") ||
    trimmed.includes("://");

  if (looksLikeUrl) {
    return {
      ok: false,
      reason:
        "That looks like a website address, not a licence number. Enter a DL such as MH14-99887766 (you may invent one).",
      reasonHi:
        "यह वेबसाइट पता लगता है, लाइसेंस नंबर नहीं। जैसे MH14-99887766 दर्ज करें (आप नया भी बना सकते हैं)।",
    };
  }

  // Pure punctuation / path junk
  if (!/[A-Za-z0-9]/.test(trimmed) || /^[./\\?#&=]+$/.test(trimmed)) {
    return {
      ok: false,
      reason: "Please enter a valid-looking licence number (letters and digits).",
      reasonHi: "कृपया अक्षरों और अंकों वाला लाइसेंस नंबर दर्ज करें।",
    };
  }

  return { ok: true, normalized: trimmed.toUpperCase() };
}

/** Extract a plausible DL token from free text; ignore URLs */
export function extractDlCandidate(text: string): string | null {
  const withoutUrls = text.replace(/https?:\/\/\S+/gi, " ").replace(/\blocalhost\S*/gi, " ");
  // Common Indian DL-ish patterns or alnum blocks with state code
  const m =
    withoutUrls.match(/\b([A-Z]{2}[-\s]?\d{1,2}[-\s]?[A-Z0-9]{1,4}[-\s]?\d{3,7})\b/i) ||
    withoutUrls.match(/\b([A-Z]{2}\d{2}[A-Z]{0,3}\d{3,7})\b/i);
  if (m) {
    const v = validateDlInput(m[1]);
    return v.ok ? v.normalized : null;
  }
  return null;
}
