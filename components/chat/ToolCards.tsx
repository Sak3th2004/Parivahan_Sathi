"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  MapPin,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { MockPill } from "@/components/AppHeader";

type AnyRec = Record<string, unknown>;

function asRec(v: unknown): AnyRec | null {
  return v && typeof v === "object" ? (v as AnyRec) : null;
}

export function ToolResultCards({
  toolName,
  result,
}: {
  toolName: string;
  result: unknown;
}) {
  const r = asRec(result);
  if (!r) return null;

  if (toolName === "get_citizen_profile") {
    const dl = asRec(r.dl);
    const docs = asRec(r.documents);
    const vehicle = asRec(r.vehicle);
    const status = String(dl?.status || "");
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-2 w-full max-w-md overflow-hidden rounded-2xl border border-teal-100 bg-white shadow-[0_8px_30px_rgba(15,118,110,0.08)]"
      >
        <div className="flex items-center justify-between bg-teal-900 px-4 py-2.5 text-white">
          <span className="text-xs font-medium tracking-wide">Synthetic citizen profile</span>
          <MockPill>
            <span className="text-teal-900">Mock · SCE</span>
          </MockPill>
        </div>
        <div className="space-y-3 p-4">
          <div>
            <p className="text-lg font-semibold text-teal-950">{String(r.name)}</p>
            <p className="text-sm text-slate-500">
              {String(r.age)} yrs · {String(r.occupation)} · {String(r.state)}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Info label="DL" value={String(r.dlNumber)} mono />
            <Info
              label="Status"
              value={status.replace(/_/g, " ")}
              tone={status === "valid" ? "ok" : "warn"}
            />
            <Info label="RTO" value={String(r.rtoCode)} />
            <Info label="Address" value={String(r.currentAddress)} />
          </div>
          {vehicle && (
            <div className="rounded-xl bg-teal-50/80 px-3 py-2 text-sm">
              <p className="font-medium text-teal-900">{String(vehicle.model)}</p>
              <p className="text-xs text-teal-800/70">{String(vehicle.rcNumber)}</p>
              {!vehicle.sameStateAsOwner && (
                <p className="mt-1 text-xs text-amber-700">
                  Interstate origin: {String(vehicle.interstateOriginState)}
                </p>
              )}
            </div>
          )}
          <div className="flex flex-wrap gap-1.5">
            {docs &&
              Object.entries(docs).map(([k, v]) => (
                <span
                  key={k}
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    v === "verified"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-800"
                  }`}
                >
                  {k}: {String(v)}
                </span>
              ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (toolName === "check_service_eligibility") {
    const issues = Array.isArray(r.issues) ? (r.issues as string[]) : [];
    const eligible = Boolean(r.eligible);
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-2 w-full max-w-md rounded-2xl border border-teal-100 bg-white p-4 shadow-[0_8px_30px_rgba(15,118,110,0.08)]"
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-teal-950">Eligibility check</p>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              eligible ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"
            }`}
          >
            {eligible ? "Ready to file" : "Fix before filing"}
          </span>
        </div>
        <div className="mb-3 grid grid-cols-3 gap-2 text-center text-xs">
          <Stat label="Form" value={String(r.formType || "—")} />
          <Stat label="Fees" value={`₹${r.fees ?? "—"}`} />
          <Stat label="Days" value={String(r.estimatedDays ?? "—")} />
        </div>
        {issues.length > 0 ? (
          <ul className="space-y-1.5">
            {issues.map((issue) => (
              <li
                key={issue}
                className="flex items-start gap-2 rounded-lg bg-amber-50 px-2.5 py-2 text-xs text-amber-950"
              >
                <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {issue.replace(/_/g, " ")}
              </li>
            ))}
          </ul>
        ) : (
          <p className="flex items-center gap-2 text-xs text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> No blockers on this synthetic profile
          </p>
        )}
        {typeof r.reasoning === "string" && (
          <p className="mt-2 text-[11px] italic text-slate-500">{r.reasoning}</p>
        )}
        <p className="mt-2 text-[10px] text-slate-400">Mock CMV rules · not a live RTO decision</p>
      </motion.div>
    );
  }

  if (toolName === "find_available_slot") {
    const slots = Array.isArray(r.slots) ? (r.slots as AnyRec[]) : [];
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-2 w-full max-w-md rounded-2xl border border-teal-100 bg-white p-4 shadow-sm"
      >
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-teal-950">
          <MapPin className="h-4 w-4 text-brand-teal" /> Nearest mock slots
        </div>
        <div className="space-y-2">
          {slots.map((s, i) => (
            <div
              key={String(s.slotId || i)}
              className="flex items-center justify-between rounded-xl border border-teal-50 bg-teal-50/40 px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium text-teal-950">
                  {String(s.dayHi)} · {String(s.date)}
                </p>
                <p className="text-xs text-slate-500">{String(s.time)}</p>
              </div>
              <span className="text-[10px] text-slate-400">simulated</span>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (toolName === "submit_application") {
    const id = String(r.applicationId || "");
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-2 w-full max-w-md overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white shadow-md"
      >
        <div className="flex items-center gap-2 bg-brand-amber/90 px-4 py-2 text-sm font-semibold text-teal-950">
          <FileText className="h-4 w-4" /> Application filed (mock)
        </div>
        <div className="space-y-3 p-4">
          <p className="break-all font-mono text-xs text-slate-600">{id}</p>
          <p className="text-sm text-slate-700">
            Est. {String(r.estimatedDays ?? 7)} days · live tracker encoded in the ID (no database)
          </p>
          {id && (
            <Link
              href={`/track/${id}`}
              className="inline-flex rounded-full bg-teal-900 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Open live tracker →
            </Link>
          )}
        </div>
      </motion.div>
    );
  }

  if (toolName === "fix_document_issue") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-2 flex max-w-md items-start gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900"
      >
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p className="font-medium">{String(r.issueResolved || "document")} marked verified</p>
          <p className="text-xs text-emerald-800/80">{String(r.message || "")}</p>
          <p className="mt-1 text-[10px] text-emerald-700/60">Mock repair · conversation-scoped</p>
        </div>
      </motion.div>
    );
  }

  return null;
}

function Info({
  label,
  value,
  mono,
  tone,
}: {
  label: string;
  value: string;
  mono?: boolean;
  tone?: "ok" | "warn";
}) {
  return (
    <div className="rounded-lg bg-slate-50 px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p>
      <p
        className={`text-xs font-medium ${mono ? "font-mono" : ""} ${
          tone === "ok"
            ? "text-emerald-700"
            : tone === "warn"
              ? "text-amber-700"
              : "text-slate-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-2 py-2">
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className="font-semibold text-teal-950">{value}</p>
    </div>
  );
}

export function EmptyChatHints({
  onPick,
}: {
  onPick: (text: string) => void;
}) {
  const hints = [
    {
      title: "Licence renewal",
      text: "My driving licence MH14-99887766 has expired. Please assist with renewal.",
      icon: AlertTriangle,
    },
    {
      title: "Ownership transfer",
      text: "I purchased a used vehicle. DL TS09ZZ0001. Please assist with ownership transfer.",
      icon: Sparkles,
    },
    {
      title: "Address update",
      text: "I require DL and RC address update. DL KA05MZ4321.",
      icon: MapPin,
    },
  ];
  return (
    <div className="mx-auto max-w-md space-y-3 py-6">
      <p className="text-center text-sm text-slate-500">
        Enter your request in Hindi or English. Any DL number is accepted for this prototype.
      </p>
      {hints.map((h) => (
        <button
          key={h.title}
          type="button"
          onClick={() => onPick(h.text)}
          className="flex w-full items-start gap-3 rounded-2xl border border-teal-100 bg-white/90 px-4 py-3 text-left shadow-sm transition hover:border-teal-300 hover:shadow-md"
        >
          <h.icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-teal" />
          <div>
            <p className="text-sm font-semibold text-teal-950">{h.title}</p>
            <p className="text-xs text-slate-500">{h.text}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
