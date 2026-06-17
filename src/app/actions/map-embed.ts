"use server";

export interface Marker {
  lat: number;
  lng: number;
  label?: string;
  image?: string
}

export interface GenerateEmbedInput {
  serverToken: string;
  clientToken: string;
  lat: number;
  lng: number;
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  bounds?: [number, number, number, number] | null;
  owner: string;
}

export interface GenerateEmbedResult {
  iframeSrc: string;
  embedId: string;
}

export async function generateMapEmbed(input: GenerateEmbedInput): Promise<GenerateEmbedResult> {
  const baseUrl = "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/map-embed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Failed to create embed");
  }
  return res.json();
}