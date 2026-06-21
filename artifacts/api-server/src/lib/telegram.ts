import { logger } from "./logger";

const TELEGRAM_API = "https://api.telegram.org";

export interface OrderNotification {
  productName: string;
  productUrl: string;
  size: string;
  price: number;
  currency: string;
  telegramUser?: string;
  telegramUserId?: number;
  comment?: string;
}

export async function sendOrderNotification(
  order: OrderNotification,
): Promise<boolean> {
  const token = process.env["TELEGRAM_BOT_TOKEN"];
  const chatId = process.env["TELEGRAM_CHAT_ID"];

  if (!token || !chatId) {
    logger.warn("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set — skipping notification");
    return false;
  }

  const priceFormatted = `${order.price.toLocaleString("ru-RU")} ${order.currency}`;
  const user = order.telegramUser
    ? `@${order.telegramUser}`
    : order.telegramUserId
      ? `ID: ${order.telegramUserId}`
      : "Аноним";

  const text = [
    "🛒 <b>Новый заказ!</b>",
    "",
    `👟 <b>Товар:</b> ${order.productName}`,
    `📏 <b>Размер:</b> ${order.size}`,
    `💰 <b>Цена:</b> ${priceFormatted}`,
    `👤 <b>Покупатель:</b> ${user}`,
    order.comment ? `💬 <b>Комментарий:</b> ${order.comment}` : null,
    "",
    `🔗 <a href="${order.productUrl}">Ссылка на товар</a>`,
  ]
    .filter((line) => line !== null)
    .join("\n");

  try {
    const res = await fetch(
      `${TELEGRAM_API}/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: false,
        }),
      },
    );

    if (!res.ok) {
      const body = await res.text();
      logger.error({ status: res.status, body }, "Telegram API error");
      return false;
    }

    logger.info("Telegram order notification sent");
    return true;
  } catch (err) {
    logger.error({ err }, "Failed to send Telegram notification");
    return false;
  }
}
