/**
 * Quick SCE + codec smoke tests (no API key required).
 * Run: npx tsx scripts/smoke-sce.ts
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

const a = generateCitizen("MH12AB1234");
const b = generateCitizen("MH12AB1234");
const c = generateCitizen("garbage-xyz-999");

assert(a.name === b.name && a.age === b.age, "determinism failed for same DL");
assert(a.dlNumber === "MH12AB1234", "DL normalized");
assert(!!c.name && c.age >= 21, "garbage input still yields profile");

const id = encodeApplication({
  dlNumber: a.dlNumber,
  service: "dl_renewal",
  formType: "9",
  fees: 700,
  rtoCode: a.rtoCode,
  slotDate: "2026-09-01",
  filedAtMs: Date.now(),
  slotRequired: true,
});
assert(id.startsWith("PS"), "id prefix");
const decoded = decodeApplication(id);
assert(decoded?.fees === 700, "decode fees");
const tl = computeTimeline(decoded!);
assert(tl.length === 4 && tl[0].done === true, "timeline step 0 done");

console.log("SMOKE OK");
console.log(" sample:", { name: a.name, age: a.age, status: a.dl.status, state: a.state });
console.log(" garbage:", { name: c.name, age: c.age, status: c.dl.status });
console.log(" track id length:", id.length);
