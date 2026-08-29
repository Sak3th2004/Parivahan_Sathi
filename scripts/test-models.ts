import fs from "fs";
import path from "path";

async function main() {
  const envPath = path.join(process.cwd(), ".env.local");
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i === -1) continue;
    process.env[line.slice(0, i)] = line.slice(i + 1);
  }

  const { resolveWorkingModel, generateWithFallback, getModelChain } = await import(
    "../lib/aiClient"
  );

  console.log("chain:", getModelChain().join(" → "));
  const id = await resolveWorkingModel(true);
  console.log("resolved:", id);
  const r = await generateWithFallback("Say OK in one word.");
  console.log("used:", r.modelUsed);
  console.log("text:", r.text);
}

main().catch((e) => {
  console.error("FAIL", e);
  process.exit(1);
});
