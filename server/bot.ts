const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

async function sendMessage(chatId: string | number, text: string): Promise<void> {
  if (!BOT_TOKEN) {
    console.warn("[bot] BOT_TOKEN not set — skipping Telegram notification");
    return;
  }
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("[bot] sendMessage failed:", err);
  }
}

export interface OrderItem {
  productName: string;
  size?: string | null;
  price: number;
  quantity: number;
}

export async function notifyOrder(params: {
  telegramUserId: string;
  firstName: string;
  username?: string;
  items: OrderItem[];
}) {
  const { telegramUserId, firstName, username, items } = params;
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const itemLines = items
    .map(
      (i) =>
        `• ${i.productName}${i.size ? ` (EU ${i.size})` : ""} × ${i.quantity} — ${(i.price * i.quantity).toLocaleString("ru-RU")} ₽`
    )
    .join("\n");

  // Message to the customer
  const userMsg =
    `✅ <b>Ваш запрос принят!</b>\n\n` +
    `${itemLines}\n\n` +
    `💰 <b>Итого: ${total.toLocaleString("ru-RU")} ₽</b>\n\n` +
    `Наш менеджер свяжется с вами в ближайшее время для подтверждения заказа.`;

  await sendMessage(telegramUserId, userMsg);

  // Message to the shop owner
  if (ADMIN_CHAT_ID) {
    const userRef = username ? `@${username}` : firstName;
    const adminMsg =
      `🛒 <b>Новый заказ!</b>\n\n` +
      `👤 Покупатель: ${userRef} (ID: <code>${telegramUserId}</code>)\n\n` +
      `${itemLines}\n\n` +
      `💰 <b>Итого: ${total.toLocaleString("ru-RU")} ₽</b>`;

    await sendMessage(ADMIN_CHAT_ID, adminMsg);
  }
}
