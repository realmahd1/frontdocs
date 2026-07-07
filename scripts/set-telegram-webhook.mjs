const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
const explicitUrl = process.env.TELEGRAM_WEBHOOK_URL?.trim();
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()?.replace(/\/$/, "");
const webhookUrl = explicitUrl || (siteUrl ? `${siteUrl}/api/telegram/webhook` : "");

if (!token || !secret || !webhookUrl) {
  console.error(`Missing configuration.
Required:
- TELEGRAM_BOT_TOKEN
- TELEGRAM_WEBHOOK_SECRET
- TELEGRAM_WEBHOOK_URL or NEXT_PUBLIC_SITE_URL`);
  process.exit(1);
}

const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    url: webhookUrl,
    secret_token: secret,
    allowed_updates: ["channel_post", "edited_channel_post"],
    drop_pending_updates: false,
  }),
});

const result = await response.json();
console.log(JSON.stringify(result, null, 2));

if (!response.ok || !result.ok) {
  process.exit(1);
}
