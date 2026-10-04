import fs from "fs";
import path from "path";

const EXTERNAL_API = process.env.EXTERNAL_API_URL ?? "http://localhost:4000";
const MINIO_BASE = "https://minio.traffic.gebeta.app/traffic-app-public/user-custom-markers";
const OWNER = "gebeta1";
const BATCH_SIZE = 15;
const BATCH_DELAY_MS = 10000; 

const TYPE_IMAGE_MAP: Record<string, string> = {
  tele: "tele.webp",
  bank: "bank.webp",
  crrsa: "crrsa.webp",
  dars: "dars.webp",
  mor: "mor.webp",
  palace: "palace.webp",
  post: "post.webp",
  "post office": "post.webp",
};

interface SourcePlace {
  _id: string;
  location_name: string;
  address?: string;
  longitude: number;
  latitude: number;
  status?: string;
  location_type: string;
}

interface CreatePayload {
  name: string;
  lat: number;
  lng: number;
  owner: string;
  image?: string;
  type?: string;
  active?: boolean;
}

function imageForType(type: string): string | undefined {
  const filename = TYPE_IMAGE_MAP[(type || "").toLowerCase().trim()];
  return filename ? `${MINIO_BASE}/${filename}` : undefined;
}

function toPayload(place: SourcePlace): CreatePayload {
  return {
    name: place.location_name,
    lat: place.latitude,
    lng: place.longitude,
    owner: OWNER,
    type: place.location_type,
    image: imageForType(place.location_type),
    active: (place.status ?? "active") !== "inactive",
  };
}

async function createOne(payload: CreatePayload, retries = 3): Promise<boolean> {
  try {
    const res = await fetch(`${EXTERNAL_API}/api/external/place/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.status === 429) {
      if (retries > 0) {
        await new Promise(r => setTimeout(r, 5000));
        return createOne(payload, retries - 1);
      }
      console.error(`Rate limited, gave up: ${payload.name}`);
      return false;
    }

    if (!res.ok) {
      console.error(`Failed [${res.status}]: ${payload.name}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Error: ${payload.name}`, err);
    return false;
  }
}

async function seed() {
  const filePathArg = process.argv[2];
  if (!filePathArg) {
    console.error("Usage: npx tsx scripts/seed-external-places.ts <path-to-json>");
    process.exit(1);
  }

  const fullPath = path.resolve(filePathArg);
  const raw = fs.readFileSync(fullPath, "utf-8");
  const sourcePlaces: SourcePlace[] = JSON.parse(raw);

  console.log(`Loaded ${sourcePlaces.length} places from ${fullPath}`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < sourcePlaces.length; i += BATCH_SIZE) {
    const batch = sourcePlaces.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(place => createOne(toPayload(place)))
    );
    success += results.filter(Boolean).length;
    failed += results.filter(r => !r).length;
    console.log(`Progress: ${Math.min(i + BATCH_SIZE, sourcePlaces.length)}/${sourcePlaces.length}`);

    if (i + BATCH_SIZE < sourcePlaces.length) {
      await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
    }
  }

  console.log(`\nDone. ${success} succeeded, ${failed} failed.`);
}

seed();