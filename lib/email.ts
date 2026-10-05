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

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const { error } = await getClient().emails.send({
    from: FROM_ADDRESS,
    to: input.to,
    subject: input.subject,
    html: input.html,
  });

  if (error) {
    throw new Error(error.message);
  }
}
