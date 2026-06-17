const UPLOAD_API = "https://api.traffic.gebeta.app"

interface PresignedResponse {
  objectName: string;
  url: string;
  maxSize: number;
}

export async function uploadMarkerImage(file: File): Promise<string> {
  const presignRes = await fetch(`${UPLOAD_API}/api/uploads/presigned`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prefix: "user-custom-markers",
      filename: file.name,
    }),
  });

  if (!presignRes.ok) {
    throw new Error(
      `Failed to get upload URL: ${presignRes.status} ${presignRes.statusText}`
    );
  }

  const { url, maxSize }: PresignedResponse = await presignRes.json();

  if (file.size > maxSize) {
    throw new Error(
      `File too large — max ${(maxSize / 1024 / 1024).toFixed(1)} MB`
    );
  }

  const uploadRes = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error(
      `Upload failed: ${uploadRes.status} ${uploadRes.statusText}`
    );
  }

  return url.split("?")[0];
}