import { Resend } from "resend";

// Sandbox sender: works immediately with no domain verification, but only
// while there's no real deployment domain yet (see NEXT_PUBLIC_APP_DOMAIN in
// lib/supabase/proxy.ts). Swap to a branded address on the same domain once
// one exists.
const FROM_ADDRESS = "Invitely <onboarding@resend.dev>";

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
