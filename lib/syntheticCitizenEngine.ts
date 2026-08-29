// Deterministic, hash-seeded mock citizen generator.
// Same input string ALWAYS produces the same output. No LLM. No DB. Instant.

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STATE_CODE_MAP: Record<string, { state: string; names: string[] }> = {
  BR: { state: "Bihar", names: ["Ramesh Kumar", "Sunita Devi", "Manoj Yadav", "Kavita Singh"] },
  UP: {
    state: "Uttar Pradesh",
    names: ["Rajesh Verma", "Fatima Begum", "Anil Tiwari", "Zeenat Khan"],
  },
  KA: {
    state: "Karnataka",
    names: ["Priya Sharma", "Manjunath Rao", "Deepa Gowda", "Suresh Hegde"],
  },
  DL: { state: "Delhi", names: ["Suresh Nair", "Neha Kapoor", "Vikram Chawla", "Ayesha Ali"] },
  MH: {
    state: "Maharashtra",
    names: ["Rohan Deshmukh", "Sneha Patil", "Amit Joshi", "Pooja Shah"],
  },
  TN: {
    state: "Tamil Nadu",
    names: ["Karthik Raman", "Lakshmi Iyer", "Suresh Pillai", "Divya Krishnan"],
  },
  WB: {
    state: "West Bengal",
    names: ["Arjun Banerjee", "Ritu Das", "Sourav Ghosh", "Mou Sengupta"],
  },
  RJ: {
    state: "Rajasthan",
    names: ["Vikram Singh Rathore", "Meena Chouhan", "Devendra Shekhawat", "Anita Rajput"],
  },
  GJ: {
    state: "Gujarat",
    names: ["Kiran Patel", "Bhavesh Shah", "Nisha Trivedi", "Jignesh Mehta"],
  },
  PB: {
    state: "Punjab",
    names: ["Gurpreet Singh", "Simran Kaur", "Harjit Dhillon", "Manpreet Sidhu"],
  },
  KL: {
    state: "Kerala",
    names: ["Suresh Nair", "Anitha Menon", "Bijoy Thomas", "Reshma Pillai"],
  },
  TS: {
    state: "Telangana",
    names: ["Srinivas Reddy", "Padma Rao", "Naveen Kumar", "Sravani Goud"],
  },
};

const FALLBACK_NAMES = ["Arun Prakash", "Geeta Sharma", "Mohan Lal", "Sarita Devi"];
const OCCUPATIONS = [
  "Taxi driver",
  "Tailor",
  "Software Engineer",
  "Bank Officer",
  "Farmer",
  "Shop owner",
  "Teacher",
  "Electrician",
  "Auto driver",
  "Government clerk",
];
const CITIES = [
  "Sector 12",
  "MG Road area",
  "Old Town",
  "Civil Lines",
  "Gandhi Nagar",
  "Model Town",
  "Station Road",
];

export type SyntheticCitizen = {
  dlNumber: string;
  name: string;
  age: number;
  occupation: string;
  state: string;
  rtoCode: string;
  dl: {
    issueDate: string;
    expiryDate: string;
    class: string[];
    status: "valid" | "expired" | "expired_over_1yr";
  };
  vehicle: {
    rcNumber: string;
    model: string;
    sameStateAsOwner: boolean;
    interstateOriginState: string | null;
  } | null;
  documents: {
    aadhaar: "verified" | "missing";
    addressProof: "verified" | "missing";
    medicalCert: "verified" | "missing";
    noc: "verified" | "missing";
  };
  currentAddress: string;
};

export function generateCitizen(rawInput: string): SyntheticCitizen {
  const input = rawInput.trim().toUpperCase();
  const seed = hashString(input);
  const rand = mulberry32(seed);

  const codeMatch = input.match(/[A-Z]{2}/);
  const keys = Object.keys(STATE_CODE_MAP);
  const code = codeMatch && STATE_CODE_MAP[codeMatch[0]]
    ? codeMatch[0]
    : keys[Math.floor(rand() * keys.length)];
  const stateInfo = STATE_CODE_MAP[code] || { state: "Unknown State (demo)", names: FALLBACK_NAMES };

  const age = 21 + Math.floor(rand() * 50);
  const name = stateInfo.names[Math.floor(rand() * stateInfo.names.length)];
  const occupation = OCCUPATIONS[Math.floor(rand() * OCCUPATIONS.length)];

  const statusRoll = rand();
  const dlStatus: SyntheticCitizen["dl"]["status"] =
    statusRoll < 0.4 ? "valid" : statusRoll < 0.75 ? "expired" : "expired_over_1yr";
  const issueYear = 2026 - (age - 18 > 25 ? 25 : Math.max(1, age - 18));
  const expiryYear =
    dlStatus === "valid" ? 2027 + Math.floor(rand() * 8) : dlStatus === "expired" ? 2025 : 2022;

  const medicalCertMissing = age >= 50 && rand() < 0.7;
  const addressProofMissing = rand() < 0.15;
  const hasVehicle = rand() < 0.55;
  let vehicle: SyntheticCitizen["vehicle"] = null;
  let nocMissing = false;

  if (hasVehicle) {
    const interstate = rand() < 0.4;
    const originCodes = keys.filter((c) => c !== code);
    const originCode = interstate
      ? originCodes[Math.floor(rand() * originCodes.length)]
      : code;
    nocMissing = interstate && rand() < 0.6;
    vehicle = {
      rcNumber: `${code}-${10 + Math.floor(rand() * 89)}-${["CA", "MG", "AB", "XY", "PQ"][Math.floor(rand() * 5)]}-${1000 + Math.floor(rand() * 8999)}`,
      model:
        ["Maruti Swift", "Honda City", "Hyundai i20", "Tata Nexon", "Toyota Innova"][
          Math.floor(rand() * 5)
        ] +
        " " +
        (2016 + Math.floor(rand() * 9)),
      sameStateAsOwner: !interstate,
      interstateOriginState: interstate
        ? STATE_CODE_MAP[originCode]?.state || "Another State"
        : null,
    };
  }

  return {
    dlNumber: input,
    name,
    age,
    occupation,
    state: stateInfo.state,
    rtoCode: code,
    dl: {
      issueDate: `${issueYear}-0${1 + Math.floor(rand() * 8)}-1${Math.floor(rand() * 9)}`,
      expiryDate: `${expiryYear}-0${1 + Math.floor(rand() * 8)}-1${Math.floor(rand() * 9)}`,
      class: ["LMV"],
      status: dlStatus,
    },
    vehicle,
    documents: {
      aadhaar: "verified",
      addressProof: addressProofMissing ? "missing" : "verified",
      medicalCert: medicalCertMissing ? "missing" : "verified",
      noc: nocMissing ? "missing" : "verified",
    },
    currentAddress: `${CITIES[Math.floor(rand() * CITIES.length)]}, ${stateInfo.state}`,
  };
}
