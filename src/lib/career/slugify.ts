import { getSlugExists } from "./db";

function toSlugBase(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function randomSuffix(len = 4): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: len }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

export async function generateUniqueSlug(name: string): Promise<string> {
  const base = toSlugBase(name);
  let slug = `${base}-${randomSuffix()}`;
  while (await getSlugExists(slug)) {
    slug = `${base}-${randomSuffix()}`;
  }
  return slug;
}
