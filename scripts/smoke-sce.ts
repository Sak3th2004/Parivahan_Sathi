/**
 * Break-it QA for SCE + codec (no API key).
 * Run: npm run smoke
 */
import { generateCitizen } from "../lib/syntheticCitizenEngine";
import {
  encodeApplication,
  decodeApplication,
  computeTimeline,
} from "../lib/applicationCodec";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const cases = [
  "MH12AB1234",
  "MH-14-99887766",
  "DL01 20110012345",
  "!!!@@@",
  "garbage-xyz-999",
  "ka05mz4321",
  "   up16  ",
  "TS09ZZ0001",
];

console.log("--- Determinism & any-input profiles ---");
for (const raw of cases) {
  const a = generateCitizen(raw);
  const b = generateCitizen(raw);
  assert(JSON.stringify(a) === JSON.stringify(b), `nondeterministic: ${raw}`);
  assert(a.name.length > 0 && a.age >= 21 && a.age <= 70, `bad profile: ${raw}`);
  assert(["valid", "expired", "expired_over_1yr"].includes(a.dl.status), `bad status: ${raw}`);
  console.log(" OK", raw.trim() || "(empty-ish)", "→", a.name, a.age, a.dl.status, a.state);
}

console.log("--- Application codec + timeline ---");
const citizen = generateCitizen("MH12AB1234");
const filedAtMs = Date.now() - 9000; // mid pipeline
const id = encodeApplication({
  dlNumber: citizen.dlNumber,
  service: "dl_renewal",
  formType: "9",
  fees: 700,
  rtoCode: citizen.rtoCode,
  slotDate: "2026-09-01",
  filedAtMs,
  slotRequired: true,
});
assert(id.startsWith("PS"), "prefix");
const decoded = decodeApplication(id);
assert(decoded?.service === "dl_renewal", "decode service");
assert(decodeApplication("not-valid") === null, "invalid id");
const tl = computeTimeline(decoded!, filedAtMs + 9000);
assert(tl[0].done && tl[1].done, "steps 0-1 should be done after 9s");
assert(!tl[3].done, "final step not yet done at 9s");
console.log(" OK track sample path: /track/" + id.slice(0, 24) + "…");

console.log("--- Duplicate input casing ---");
assert(
  JSON.stringify(generateCitizen("mh12ab1234")) ===
    JSON.stringify(generateCitizen("MH12AB1234")),
  "case normalize"
);

console.log("\nALL QA CHECKS PASSED");
