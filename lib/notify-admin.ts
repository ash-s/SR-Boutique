import { getWhatsAppUrl } from "@/lib/whatsapp";

const ADMIN_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919500943141";

/**
 * Sends order notification to admin WhatsApp.
 * Uses CallMeBot API when CALLMEBOT_API_KEY is set (automatic, no customer tap needed).
 * Falls back to returning wa.me URL for manual send.
 */
export async function sendWhatsAppToAdmin(message: string): Promise<{
  sent: boolean;
  method: "callmebot" | "wa_me_link";
  whatsappUrl: string;
}> {
  const whatsappUrl = getWhatsAppUrl(message);
  const apiKey = process.env.CALLMEBOT_API_KEY;
  const phone = process.env.CALLMEBOT_PHONE || `+${ADMIN_PHONE.replace(/\D/g, "")}`;

  if (apiKey) {
    try {
      const encoded = encodeURIComponent(message);
      const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encoded}&apikey=${apiKey}`;
      const res = await fetch(url, { method: "GET", cache: "no-store" });
      const text = await res.text();

      if (res.ok && !text.toLowerCase().includes("error")) {
        return { sent: true, method: "callmebot", whatsappUrl };
      }
      console.error("CallMeBot error:", text);
    } catch (err) {
      console.error("CallMeBot fetch failed:", err);
    }
  }

  return { sent: false, method: "wa_me_link", whatsappUrl };
}
