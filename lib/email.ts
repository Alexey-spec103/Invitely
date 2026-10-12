import { Resend } from "resend";

// invimbo.com is verified in Resend (DKIM/SPF/MX) -- matches the
// support@invimbo.com address domain-actions.ts already promises hosts can
// reply to.
const FROM_ADDRESS = "Invimbo <support@invimbo.com>";

let client: Resend | null = null;

function getClient(): Resend {
  if (!client) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    client = new Resend(apiKey);
  }
  return client;
}

/** Escapes a string before it's interpolated into email HTML. Without this,
 * a guest-submitted RSVP field (name, allergies, message) containing a raw
 * `<a href=...>` tag renders as a real, clickable link inside a
 * legitimately support@invimbo.com-signed email to the host -- a
 * ready-made phishing vector (security-review, 2026-10-12). Apply at the
 * point each untrusted value is about to enter a template string, not
 * here in sendEmail/wrapEmailHtml -- by then subject/html are already
 * fully-formed strings with no way to tell trusted markup from escaped
 * user content apart. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

/** email-audit (2026-10-10): every one of this app's 6 transactional emails
 * was bare `<p>`/`<ul>` HTML with zero shared visual identity. Wrapping here,
 * centrally, means every call site keeps constructing its own real body
 * content exactly as before -- only `sendEmail()` itself changed, so no call
 * site needed touching for this part.
 *
 * Table-based layout, fully inline styles, no `<style>` block -- the
 * well-established safe pattern for HTML email: Outlook's rendering engine
 * (Word, not a browser engine) has poor div/flexbox support, and many
 * clients strip `<style>` blocks outright. Colors match this app's own
 * `--dash-accent` family (app/globals.css) and the parchment/ink palette
 * used elsewhere in this session's own email-adjacent surfaces, kept to a
 * thin top border + wordmark rather than a heavier redesign -- this is a
 * light identity pass, not a marketing template. */
function wrapEmailHtml(bodyHtml: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f2ea;padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:12px;border:1px solid #e3dcc9;">
        <tr>
          <td style="padding:22px 32px;border-bottom:3px solid #ff6b45;">
            <span style="font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:700;color:#201c16;">Invimbo</span>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#2b2621;">
            ${bodyHtml}
          </td>
        </tr>
        <tr>
          <td style="padding:18px 32px;background-color:#f7f4ec;border-top:1px solid #e3dcc9;border-radius:0 0 12px 12px;">
            <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.5;color:#7a7265;">
              Sent by Invimbo &middot; Questions? Just reply, or write to
              <a href="mailto:support@invimbo.com" style="color:#7a7265;">support@invimbo.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const { error } = await getClient().emails.send({
    from: FROM_ADDRESS,
    to: input.to,
    subject: input.subject,
    html: wrapEmailHtml(input.html),
  });

  if (error) {
    throw new Error(error.message);
  }
}
