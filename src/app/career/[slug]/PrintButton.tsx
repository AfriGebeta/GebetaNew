"use client";

export default function PrintButton() {
  return (
    <button className="cert-download-btn" onClick={() => window.print()}>
      Download / Print
    </button>
  );
}
