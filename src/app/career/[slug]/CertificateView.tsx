"use client";

import { Intern, CertificateConfig } from "@/lib/career/db";
import { Libre_Baskerville, Inter, Barlow } from "next/font/google";

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-libre",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
});

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-barlow",
});

interface Props {
  intern: Intern;
  config: CertificateConfig;
}

export default function CertificateView({ intern, config }: Props) {
  const gold = config.primaryColor || "#C9A227";
  const description = config.descriptionTemplate.replace("{companyName}", config.companyName);
  const fonts = `${libreBaskerville.variable} ${inter.variable} ${barlow.variable}`;

  const certUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://gebeta.app/career/${intern.slug}`;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(certUrl)}&color=${gold.replace("#", "")}&bgcolor=ffffff&format=svg&margin=2`;

  const DIVIDER = 66;

  return (
    <>
      <div className={`cert-screen-wrapper ${fonts}`}>
        <button className="cert-download-btn" onClick={() => window.print()}>
          Download / Print
        </button>

        <div id="certificate" className="cert-root">

          <div
            className="cert-right-panel"
            style={{ left: `${DIVIDER}%` }}
          >
            {config.wavyPatternUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={config.wavyPatternUrl}
                alt=""
                aria-hidden
                className="cert-wavy-img"
              />
            )}
          </div>

          <div
            className="cert-divider"
            style={{ left: `${DIVIDER}%`, borderColor: `${gold}55` }}
          />

          <div
            className="cert-seal"
            style={{ left: `${DIVIDER}%` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={config.badgeImageUrl || "/cert-seal.png"}
              alt="Certificate Seal"
              className="cert-seal-img"
            />
          </div>

          <div className="cert-left" style={{ width: `${DIVIDER}%` }}>
            <div className="cert-logo-row">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={config.companyLogoUrl || "/cert-logo.png"}
                alt={config.companyName}
                className="cert-logo-img"
              />
              <span className="cert-company-name" style={{ color: gold, fontFamily: "var(--font-libre)" }}>
                {config.companyName}
              </span>
            </div>

            <p className="cert-title-small" style={{ fontFamily: "var(--font-libre)" }}>
              {config.certificateTitle}
            </p>

            <h1 className="cert-title-big" style={{ fontFamily: "var(--font-libre)" }}>
              {config.certificateSubtitle}
            </h1>

            <p className="cert-presented-label" style={{ fontFamily: "var(--font-inter)" }}>
              {config.presentedToLabel}
            </p>

            <p className="cert-name" style={{ color: gold }}>
              {intern.name}
            </p>
            <div className="cert-name-underline" style={{ background: `linear-gradient(to right, ${gold}, transparent)` }} />

            <p className="cert-description" style={{ fontFamily: "var(--font-libre)" }}>
              {description.split(config.companyName).map((part, i, arr) =>
                i < arr.length - 1 ? (
                  <span key={i}>{part}<strong>{config.companyName}</strong></span>
                ) : (
                  <span key={i}>{part}</span>
                )
              )}
            </p>

            <div style={{ flex: 1 }} />

            <div className="cert-footer">
              <div>
                {config.signatorySignatureUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={config.signatorySignatureUrl}
                    alt="Signature"
                    className="cert-signature-img"
                  />
                ) : (
                  <p className="cert-signature-text" style={{ fontFamily: "var(--font-libre)" }}>
                    {config.signatoryName}
                  </p>
                )}
                <div className="cert-signature-line" />
                <p className="cert-signatory-title" style={{ fontFamily: "var(--font-barlow)" }}>
                  {config.signatoryTitle}
                </p>
              </div>

              <div className="cert-qr-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrUrl} alt="Certificate QR" className="cert-qr-img" />
                <p className="cert-presented-on-label" style={{ fontFamily: "var(--font-barlow)" }}>
                  PRESENTED ON
                </p>
                <p className="cert-presented-on-date" style={{ fontFamily: "var(--font-barlow)" }}>
                  {intern.presentedOn}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <link
        href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&display=swap"
        rel="stylesheet"
      />

      <style>{`
        .cert-screen-wrapper {
          min-height: 100vh;
          background: hsl(var(--muted));
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .cert-download-btn {
          margin-bottom: 20px;
          padding: 8px 24px;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 600;
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          border: none;
          cursor: pointer;
          transition: opacity .15s;
        }
        .cert-download-btn:hover { opacity: .85; }

        .cert-root {
          position: relative;
          background: #ffffff;
          box-shadow: 0 8px 40px rgba(0,0,0,.18);
          overflow: hidden;
          width: min(980px, 100%);
          aspect-ratio: 1920 / 1362;
        }

        .cert-right-panel {
          position: absolute;
          top: 0; right: 0; bottom: 0;
          background: #f9f8f6;
          overflow: hidden;
        }
        .cert-wavy-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.9;
        }

        .cert-divider {
          position: absolute;
          top: 0; bottom: 0;
          width: 1px;
          border-left: 1px solid;
        }

        .cert-seal {
          position: absolute;
          top: 4%;
          transform: translateX(-50%);
          width: 30%;
          z-index: 10;
        }
        .cert-seal-img {
          width: 100%;
          height: auto;
          object-fit: contain;
          filter: drop-shadow(0 4px 16px rgba(0,0,0,.18));
        }

        .cert-left {
          position: absolute;
          top: 0; left: 0; bottom: 0;
          display: flex;
          flex-direction: column;
          padding: 5% 6% 5% 5%;
        }

        .cert-logo-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 4%;
        }
        .cert-logo-img {
          height: clamp(22px, 3.5%, 40px);
          width: auto;
          object-fit: contain;
        }
        .cert-company-name {
          font-weight: 600;
          font-size: clamp(10px, 1.4vw, 18px);
        }

        .cert-title-small {
          font-size: clamp(8px, 1vw, 13px);
          letter-spacing: .18em;
          text-transform: uppercase;
          color: #555;
          font-weight: 400;
          margin: 0 0 2px;
        }
        .cert-title-big {
          font-size: clamp(20px, 4vw, 40px);
          font-weight: 700;
          color: #111;
          line-height: 1;
          margin: 0 0 5%;
          letter-spacing: .02em;
        }

        .cert-presented-label {
          font-size: clamp(18px, 0.78vw, 30px);
          letter-spacing: 0.25px;
          text-transform: uppercase;
          color: #C1BFB3;
          margin: 0 0 3%;
          font-weight: 400;
        }

        .cert-name {
          font-family: 'Dancing Script', var(--font-libre), cursive;
          font-size: clamp(16px, 2.8vw, 44px);
          font-weight: 700;
          line-height: 1.1;
          margin: 0 0 4px;
          letter-spacing: .01em;
        }
        .cert-name-underline {
          height: 1px;
          width: 55%;
          margin-bottom: 4%;
        }

        .cert-description {
          font-size: clamp(16px, 0.82vw, 20px);
          line-height: 1.65;
          color: #444;
          max-width: 82%;
          margin: 0;
        }

        .cert-footer {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
        }
        .cert-signature-img {
          height: clamp(24px, 3.5vw, 48px);
          width: auto;
          object-fit: contain;
          margin-bottom: 4px;
        }
        .cert-signature-text {
          font-size: clamp(12px, 1.8vw, 26px);
          font-style: italic;
          color: #333;
          margin: 0 0 4px;
        }
        .cert-signature-line {
          width: clamp(70px, 9vw, 130px);
          height: 1px;
          background: #bbb;
          margin-bottom: 4px;
        }
        .cert-signatory-title {
          font-size: clamp(12px, 0.58vw, 8px);
          letter-spacing: .2em;
          text-transform: uppercase;
          font-weight: 600;
          color: #555;
          margin: 0;
        }
        .cert-qr-block {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 3px;
        }
        .cert-qr-img {
          width: clamp(48px, 6.5vw, 86px);
          height: clamp(48px, 6.5vw, 86px);
        }
        .cert-presented-on-label {
          font-size: clamp(12px, 0.58vw, 8px);
          font-weight: 600;
          text-transform: uppercase;
          color: #8C8773;
          margin-top: 20px;
        }
        .cert-presented-on-date {
          font-size: clamp(18px, 0.82vw, 11px);
          font-weight: 600;
          letter-spacing: .08em;
          color: #222;
          margin: 0;
        }

        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .cert-screen-wrapper {
            min-height: unset !important;
            background: white !important;
            padding: 0 !important;
            display: block !important;
          }
          .cert-download-btn {
            display: none !important;
          }
          .cert-root {
            width: 100vw !important;
            max-width: 100vw !important;
            aspect-ratio: 1920 / 1362 !important;
            box-shadow: none !important;
            page-break-after: avoid;
            break-after: avoid;
          }
        }
      `}</style>
    </>
  );
}
