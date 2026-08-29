import { tool } from "ai";
import { z } from "zod";
import { generateCitizen } from "./syntheticCitizenEngine";
import { encodeApplication, decodeApplication, computeTimeline } from "./applicationCodec";
import { generateWithFallback } from "./aiClient";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const agentTools = {
  get_citizen_profile: tool({
    description:
      "Fetch or generate the citizen's DL/RC profile for ANY DL number the user provides — works for any input, generating a consistent demo profile. Call this first once you have a DL number.",
    parameters: z.object({
      dlNumber: z.string().min(3).describe("Any DL number string the user gave, even informal"),
    }),
    execute: async ({ dlNumber }) => {
      await delay(600);
      return generateCitizen(dlNumber);
    },
  }),

  check_service_eligibility: tool({
    description:
      "MUST be called before submit_application. Runs the RTO Eligibility Analyst sub-agent applying Central Motor Vehicles Rules to the citizen's generated profile.",
    parameters: z.object({
      dlNumber: z.string(),
      service: z.enum([
        "dl_renewal",
        "dl_address_change",
        "vehicle_transfer",
        "rc_address_change",
        "combined_address_change",
      ]),
    }),
    execute: async ({ dlNumber, service }) => {
      await delay(1000);
      const c = generateCitizen(dlNumber);

      const rules = `You are an RTO Eligibility Analyst. Apply Central Motor Vehicles Rules.

Citizen: ${JSON.stringify(c)}
Requested service: ${service}

RULES:
DL RENEWAL (Form 9):
- dl.status "expired_over_1yr" → fresh driving test required (issue: "retest_required")
- age >= 50 → medical certificate Form 1A mandatory (issue: "medical_cert_needed" if documents.medicalCert !== "verified")
- Fees: base 200 + 500 late fee if status !== "valid"

VEHICLE TRANSFER (Form 29+30):
- requires vehicle to be non-null. If vehicle is null, set eligible:false, issues:["no_vehicle_on_record"]
- if vehicle.sameStateAsOwner === false → interstate → NOC required (issue: "noc_needed" if documents.noc !== "verified")
- Fees: 500

RC ADDRESS CHANGE (Form 33): requires vehicle non-null. Fees 100. issue "address_proof_missing" if documents.addressProof !== "verified"
DL ADDRESS CHANGE (Form LLD): Fees 100. issue "address_proof_missing" if documents.addressProof !== "verified"
COMBINED (33+LLD): requires vehicle non-null. Fees 200, no slot if same RTO.

Return ONLY JSON:
{ "eligible": boolean, "issues": string[], "formType": "9"|"29+30"|"33"|"LLD"|"33+LLD", "fees": number, "slotRequired": boolean, "estimatedDays": number, "reasoning": "one short sentence" }`;

      try {
        const { text } = await generateWithFallback(rules, { temperature: 0.1, maxTokens: 350 });
        const m = text.match(/\{[\s\S]*\}/);
        if (m) return JSON.parse(m[0]);
        return deterministicEligibility(c, service);
      } catch {
        return deterministicEligibility(c, service);
      }
    },
  }),

  fix_document_issue: tool({
    description:
      "Mark a flagged document issue as resolved after the user confirms they have it. Mock repair — always succeeds.",
    parameters: z.object({
      issue: z.enum(["medical_cert", "noc", "address_proof"]),
      referenceGiven: z.string().describe("Whatever reference/confirmation the user gave"),
    }),
    execute: async ({ issue, referenceGiven }) => {
      await delay(1200);
      return {
        success: true,
        issueResolved: issue,
        message: `${issue} marked verified (ref: ${referenceGiven})`,
      };
    },
  }),

  find_available_slot: tool({
    description: "Find nearest available slot at citizen's RTO.",
    parameters: z.object({ rtoCode: z.string() }),
    execute: async ({ rtoCode }) => {
      await delay(700);
      const dayNames = ["Somvar", "Mangalvar", "Budhvar", "Guruvar", "Shukravar"];
      const slots = [1, 2, 3].map((i) => {
        const d = new Date();
        d.setDate(d.getDate() + i * 2);
        return {
          date: d.toISOString().split("T")[0],
          dayHi: dayNames[i % 5],
          time: i % 2 ? "10:30" : "14:00",
          slotId: `${rtoCode}-${d.getTime()}`,
        };
      });
      return { slots };
    },
  }),

  submit_application: tool({
    description:
      "File the application. ONLY call after eligibility passes with no unresolved issues. Uses a stateless encoded ID.",
    parameters: z.object({
      dlNumber: z.string(),
      service: z.string(),
      formType: z.string(),
      fees: z.number(),
      rtoCode: z.string(),
      slotDate: z.string().optional(),
      slotRequired: z.boolean(),
    }),
    execute: async ({
      dlNumber,
      service,
      formType,
      fees,
      rtoCode,
      slotDate,
      slotRequired,
    }) => {
      await delay(1500);
      const id = encodeApplication({
        dlNumber,
        service,
        formType,
        fees,
        rtoCode,
        slotDate: slotDate ?? null,
        filedAtMs: Date.now(),
        slotRequired,
      });
      return { applicationId: id, trackingUrl: `/track/${id}`, estimatedDays: 7 };
    },
  }),

  track_application: tool({
    description: "Get status of a filed application by its ID.",
    parameters: z.object({ applicationId: z.string() }),
    execute: async ({ applicationId }) => {
      const data = decodeApplication(applicationId);
      if (!data) return { error: "Invalid or unrecognized application ID" };
      return { status: "in_progress", timeline: computeTimeline(data), fees: data.fees };
    },
  }),
};

/** Offline rule engine if LLM fails — keeps the demo working without burning retries */
function deterministicEligibility(
  c: ReturnType<typeof generateCitizen>,
  service: string
) {
  const issues: string[] = [];
  let formType = "9";
  let fees = 200;
  let slotRequired = true;
  let eligible = true;

  if (service === "dl_renewal") {
    formType = "9";
    fees = 200 + (c.dl.status !== "valid" ? 500 : 0);
    if (c.dl.status === "expired_over_1yr") issues.push("retest_required");
    if (c.age >= 50 && c.documents.medicalCert !== "verified") {
      issues.push("medical_cert_needed");
    }
  } else if (service === "vehicle_transfer") {
    formType = "29+30";
    fees = 500;
    if (!c.vehicle) {
      eligible = false;
      issues.push("no_vehicle_on_record");
    } else if (!c.vehicle.sameStateAsOwner && c.documents.noc !== "verified") {
      issues.push("noc_needed");
    }
  } else if (service === "rc_address_change") {
    formType = "33";
    fees = 100;
    if (!c.vehicle) {
      eligible = false;
      issues.push("no_vehicle_on_record");
    }
    if (c.documents.addressProof !== "verified") issues.push("address_proof_missing");
  } else if (service === "dl_address_change") {
    formType = "LLD";
    fees = 100;
    slotRequired = true;
    if (c.documents.addressProof !== "verified") issues.push("address_proof_missing");
  } else if (service === "combined_address_change") {
    formType = "33+LLD";
    fees = 200;
    slotRequired = false;
    if (!c.vehicle) {
      eligible = false;
      issues.push("no_vehicle_on_record");
    }
    if (c.documents.addressProof !== "verified") issues.push("address_proof_missing");
  }

  if (issues.length > 0 && eligible) eligible = false;

  return {
    eligible,
    issues,
    formType,
    fees,
    slotRequired,
    estimatedDays: 7,
    reasoning: "Applied CMV rules deterministically (LLM fallback).",
  };
}
