const FOOTER_ADDRESS = "GebetaMaps &bull; Maraki Tower, Floor 5 &bull; Megenagna, Addis Ababa, Ethiopia";

export function emailLayout({
  preheader = "",
  body,
  ctaUrl,
  ctaLabel,
  footerNote,
}: {
  preheader?: string;
  body: string;
  ctaUrl?: string;
  ctaLabel?: string;
  footerNote?: string;
}) {
  const cta = ctaUrl && ctaLabel
    ? `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;">
        <tr>
          <td>
            <a href="${ctaUrl}"
               style="display:inline-block;background:#1A1A2E;color:#ffffff;text-decoration:none;
                      padding:14px 32px;border-radius:6px;font-size:15px;font-weight:600;
                      letter-spacing:0.01em;">
              ${ctaLabel}
            </a>
          </td>
        </tr>
      </table>`
    : "";

  const extra = footerNote
    ? `<p style="color:#6b7280;font-size:13px;line-height:1.6;margin:24px 0 0;">${footerNote}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background:#ffffff;-webkit-text-size-adjust:100%;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>` : ""}
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;">
    <tr>
      <td align="center" style="padding:48px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">

          <!-- Logo / brand -->
          <tr>
            <td style="padding-bottom:32px;">
              <span style="font-size:18px;font-weight:700;color:#1A1A2E;letter-spacing:-0.02em;">GebetaMaps</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;
                       font-size:15px;line-height:1.7;color:#111827;">
              ${body}
              ${cta}
              ${extra}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding-top:40px;">
              <div style="border-top:1px solid #e5e7eb;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:20px;
                       font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;
                       font-size:12px;color:#9ca3af;line-height:1.6;">
              <p style="margin:0 0 4px;">${FOOTER_ADDRESS}</p>
              <p style="margin:0;">You are receiving this email from GebetaMaps.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
