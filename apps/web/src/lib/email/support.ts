/**
 * Fire-and-forget support email via the Resend REST API. The support address
 * lives ONLY in the server-only `SUPPORT_EMAIL` env var and is never sent to the
 * client. No-op when email isn't configured (the caller still succeeds — a
 * PostHog event is captured as the durable fallback).
 */
export function supportEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.SUPPORT_EMAIL);
}

export interface SupportMessage {
  name: string;
  email: string;
  message: string;
}

export async function sendSupportEmail(input: SupportMessage): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.SUPPORT_EMAIL;
  const from = process.env.SUPPORT_FROM ?? 'OurAI Support <onboarding@resend.dev>';
  if (!apiKey || !to) return false;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: input.email,
        subject: `[OurAI contact] ${input.name}`,
        text: `From: ${input.name} <${input.email}>\n\n${input.message}`,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
