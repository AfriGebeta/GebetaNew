import { Intern, CertificateConfig } from "@/lib/career/db";
import { Libre_Baskerville, Inter, Dancing_Script } from "next/font/google";
import Image from "next/image";
import QRCode from "qrcode";
import PrintButton from "./PrintButton";

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-libre",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-dancing",
});

interface Props {
  intern: Intern;
  config: CertificateConfig;
}

export default async function CertificateView({ intern, config }: Props) {
  const gold = config.primaryColor || "#ffa500";
  const description = config.descriptionTemplate.replace("{companyName}", config.companyName);
  const fonts = `${libreBaskerville.variable} ${inter.variable} ${dancingScript.variable}`;

  const certUrl = `https://gebeta.app/career/${intern.slug}`;
  // Rendered on the server as an inline SVG so the QR is in the first paint (no external request).
  const qrSvg = await QRCode.toString(certUrl, {
    type: "svg",
    margin: 1,
    color: { dark: gold, light: "#ffffff" },
  });

  const DIVIDER = 66;

  return (
    <>
      <div className={`cert-screen-wrapper ${fonts}`}>
        <PrintButton />

        <div id="certificate" className="cert-root">

          <div
            className="cert-right-panel"
            style={{ left: `${DIVIDER}%` }}
          >
              <Image
                src="/images/tile.png"
                alt="tile"
                aria-hidden
                className="cert-wavy-img"
                fill
                priority
              />
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
                <p className="cert-signatory-title" style={{ fontFamily: "var(--font-inter)" }}>
                  {config.signatoryTitle}
                </p>
              </div>

              <div className="cert-qr-block">
                <div
                  role="img"
                  aria-label="Certificate QR"
                  className="cert-qr-img"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
                <p className="cert-presented-on-label" style={{ fontFamily: "var(--font-inter)" }}>
                  PRESENTED ON
                </p>
                <p className="cert-presented-on-date" style={{ fontFamily: "var(--font-inter)" }}>
                  {intern.presentedOn}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

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

        @media (max-width: 640px) {
          .cert-screen-wrapper { padding: 16px 12px; }
          .cert-root { box-shadow: 0 4px 20px rgba(0,0,0,.14); }
        }

        .cert-root {
          position: relative;
          background: #ffffff;
          box-shadow: 0 8px 40px rgba(0,0,0,.18);
          overflow: hidden;
          width: min(980px, 100%);
          aspect-ratio: 1920 / 1362;
          /* Everything inside is sized in cqw (1% of card width, designed at 980px) so the certificate scales as one piece. */
          container-type: inline-size;
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
          gap: 1cqw;
          margin-bottom: 4%;
        }
        .cert-logo-img {
          height: 3.1cqw;
          width: auto;
          object-fit: contain;
        }
        .cert-company-name {
          font-weight: 600;
          font-size: 1.84cqw;
        }

        .cert-title-small {
          font-size: 1.33cqw;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: #555;
          font-weight: 400;
          margin: 0 0 2px;
        }
        .cert-title-big {
          font-size: 4.08cqw;
          font-weight: 700;
          color: #111;
          line-height: 1;
          margin: 0 0 5%;
          letter-spacing: .02em;
        }

        .cert-presented-label {
          font-size: 1.84cqw;
          letter-spacing: 0.25px;
          text-transform: uppercase;
          color: #C1BFB3;
          margin: 0 0 3%;
          font-weight: 400;
        }

        .cert-name {
          font-family: var(--font-dancing), var(--font-libre), cursive;
          font-size: 4.2cqw;
          font-weight: 700;
          line-height: 1.1;
          margin: 0 0 0.4cqw;
          letter-spacing: .01em;
        }
        .cert-name-underline {
          height: 1px;
          width: 55%;
          margin-bottom: 4%;
        }

        .cert-description {
          font-size: 1.63cqw;
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
          height: 4.9cqw;
          width: auto;
          object-fit: contain;
          margin-bottom: 0.4cqw;
        }
        .cert-signature-text {
          font-size: 2.65cqw;
          font-style: italic;
          color: #333;
          margin: 0 0 0.4cqw;
        }
        .cert-signature-line {
          width: 13.3cqw;
          height: 1px;
          background: #bbb;
          margin-bottom: 0.4cqw;
        }
        .cert-signatory-title {
          font-size: 1.22cqw;
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
          gap: 0.3cqw;
        }
        .cert-qr-img {
          width: 8.8cqw;
          height: 8.8cqw;
        }
        .cert-qr-img svg {
          display: block;
          width: 100%;
          height: 100%;
        }
        .cert-presented-on-label {
          font-size: 1.22cqw;
          font-weight: 600;
          text-transform: uppercase;
          color: #8C8773;
          margin-top: 2cqw;
        }
        .cert-presented-on-date {
          font-size: 1.84cqw;
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
