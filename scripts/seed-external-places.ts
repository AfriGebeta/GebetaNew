/**
 * One-off seed script — bulk imports external places into the Express/Prisma DB,
 * mapping each place's `location_type` to its marker image already uploaded in MinIO
 * under traffic-app/user-custom-markers/.
 *
 * Usage:
 *   npx tsx scripts/seed-external-places.ts ./data/places.json
 *
 * The JSON file should be the raw array straight from your source (Mongo export etc).
 * Adjust EXTERNAL_API, OWNER, and TYPE_IMAGE_MAP below before running.
 */

import fs from "fs";
import path from "path";

const EXTERNAL_API = process.env.EXTERNAL_API_URL ?? "https://api.traffic.gebeta.app";
const MINIO_BASE = "https://miniotest.gebeta.app/traffic-app/user-custom-markers";
const OWNER = "boss_username_here"; // <-- set the actual owner this batch belongs to
const BATCH_SIZE = 15; // concurrent requests per batch — stay under the 100 req/min limiter
const BATCH_DELAY_MS = 10000; // wait between batches so we stay under 100 req/60s

// location_type -> marker image filename already in MinIO.
// Add every distinct type your source data uses; unmapped types fall back to no image.
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