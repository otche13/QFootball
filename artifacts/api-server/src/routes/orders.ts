import { Router, type IRouter } from "express";
import { getProductById } from "../lib/products";
import { sendOrderNotification } from "../lib/telegram";

const router: IRouter = Router();

router.post("/orders", async (req, res): Promise<void> => {
  const { productId, size, telegramUser, telegramUserId, comment } = req.body as {
    productId?: unknown;
    size?: unknown;
    telegramUser?: unknown;
    telegramUserId?: unknown;
    comment?: unknown;
  };

  if (!productId || !size) {
    res.status(400).json({ error: "productId and size are required" });
    return;
  }

  const id = parseInt(String(productId), 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid productId" });
    return;
  }

  const product = getProductById(id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const sizeStr = String(size).trim();
  if (!sizeStr) {
    res.status(400).json({ error: "Size cannot be empty" });
    return;
  }

  const notificationSent = await sendOrderNotification({
    productName: product.name,
    productUrl: product.url,
    size: sizeStr,
    price: product.price,
    currency: product.currency,
    telegramUser: telegramUser ? String(telegramUser) : undefined,
    telegramUserId: telegramUserId ? Number(telegramUserId) : undefined,
    comment: comment ? String(comment) : undefined,
  });

  req.log.info(
    { productId: id, size: sizeStr, notificationSent },
    "Order created",
  );

  res.status(201).json({
    success: true,
    order: {
      productId: id,
      productName: product.name,
      size: sizeStr,
      price: product.price,
      currency: product.currency,
    },
    notificationSent,
  });
});

export default router;
