// Encodes application data into the ID (base64url). No database required.

export type ApplicationData = {
  dlNumber: string;
  service: string;
  formType: string;
  fees: number;
  rtoCode: string;
  slotDate: string | null;
  filedAtMs: number;
  slotRequired: boolean;
};

const STEP_DELAYS_MS = [0, 8000, 16000, 24000];

function toBase64Url(json: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(json).toString("base64url");
  }
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(b64: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(b64, "base64url").toString("utf-8");
  }
  const padded = b64.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeApplication(data: ApplicationData): string {
  return `PS${toBase64Url(JSON.stringify(data))}`;
}

export function decodeApplication(id: string): ApplicationData | null {
  try {
    const b64 = id.startsWith("PS") ? id.slice(2) : id;
    return JSON.parse(fromBase64Url(b64)) as ApplicationData;
  } catch {
    return null;
  }
}

export type TimelineStep = {
  step: string;
  stepHi: string;
  done: boolean;
  timestamp: string | null;
};

export function computeTimeline(data: ApplicationData, nowMs = Date.now()): TimelineStep[] {
  const elapsed = nowMs - data.filedAtMs;
  const stepNames = [
    { en: "Application submitted", hi: "Application file ho gaya" },
    { en: "Document verification", hi: "Documents verify ho rahe hain" },
    {
      en: data.slotRequired ? "RTO visit & biometric" : "Officer approval",
      hi: data.slotRequired ? "RTO visit + biometric" : "Officer approval",
    },
    { en: "Certificate dispatched", hi: "Certificate ghar bhej diya" },
  ];
  return stepNames.map((step, i) => ({
    step: step.en,
    stepHi: step.hi,
    done: elapsed >= STEP_DELAYS_MS[i],
    timestamp:
      elapsed >= STEP_DELAYS_MS[i]
        ? new Date(data.filedAtMs + STEP_DELAYS_MS[i]).toISOString()
        : null,
  }));
}

export { STEP_DELAYS_MS };
