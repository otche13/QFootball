import type { Express } from "express";
import { type Server } from "http";
import { z } from "zod";
import type { IStorage } from "./storage";
import { insertCartItemSchema, insertFavoriteSchema, insertProductSchema } from "@shared/schema";
import { notifyOrder } from "./bot";

export async function registerRoutes(
  httpServer: Server,
  app: Express,
  storage: IStorage
): Promise<Server> {

  // ── Products ──────────────────────────────────────────────────────────────
  app.get("/api/products", async (_req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get("/api/products/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
    const product = await storage.getProduct(id);
    if (!product) return res.status(404).json({ error: "Not found" });
    res.json(product);
  });

  app.post("/api/products", async (req, res) => {
    const parsed = insertProductSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const product = await storage.createProduct(parsed.data);
    res.status(201).json(product);
  });

  // ── Cart ──────────────────────────────────────────────────────────────────
  app.get("/api/cart/:telegramUserId", async (req, res) => {
    const { telegramUserId } = req.params;
    const items = await storage.getCart(telegramUserId);
    const enriched = await Promise.all(
      items.map(async (item) => ({
        ...item,
        product: await storage.getProduct(item.productId),
      }))
    );
    res.json(enriched);
  });

  app.post("/api/cart", async (req, res) => {
    const parsed = insertCartItemSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const item = await storage.addToCart(parsed.data);
    res.status(201).json(item);
  });

  app.patch("/api/cart/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { quantity } = z.object({ quantity: z.number().int().min(1) }).parse(req.body);
    const item = await storage.updateCartQuantity(id, quantity);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  });

  app.delete("/api/cart/:id", async (req, res) => {
    await storage.removeFromCart(Number(req.params.id));
    res.status(204).send();
  });

  app.delete("/api/cart/user/:telegramUserId", async (req, res) => {
    await storage.clearCart(req.params.telegramUserId);
    res.status(204).send();
  });

  // ── Favorites ─────────────────────────────────────────────────────────────
  app.get("/api/favorites/:telegramUserId", async (req, res) => {
    const favs = await storage.getFavorites(req.params.telegramUserId);
    const enriched = await Promise.all(
      favs.map(async (f) => ({
        ...f,
        product: await storage.getProduct(f.productId),
      }))
    );
    res.json(enriched);
  });

  app.post("/api/favorites", async (req, res) => {
    const parsed = insertFavoriteSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const fav = await storage.addFavorite(parsed.data);
    res.status(201).json(fav);
  });

  app.delete("/api/favorites/:telegramUserId/:productId", async (req, res) => {
    await storage.removeFavorite(
      req.params.telegramUserId,
      Number(req.params.productId)
    );
    res.status(204).send();
  });

  // ── Orders (send Telegram notification) ──────────────────────────────────
  const orderSchema = z.object({
    telegramUserId: z.string(),
    firstName: z.string().optional().default("Покупатель"),
    username: z.string().optional(),
    items: z.array(
      z.object({
        productName: z.string(),
        size: z.string().nullable().optional(),
        price: z.number(),
        quantity: z.number().int().min(1),
      })
    ).min(1),
    clearCart: z.boolean().optional().default(false),
  });

  app.post("/api/orders", async (req, res) => {
    const parsed = orderSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const { telegramUserId, firstName, username, items, clearCart } = parsed.data;

    try {
      await notifyOrder({ telegramUserId, firstName, username, items });

      if (clearCart) {
        await storage.clearCart(telegramUserId);
      }

      res.json({ ok: true });
    } catch (err) {
      console.error("[orders] Failed to send notification:", err);
      res.status(500).json({ error: "Failed to send notification" });
    }
  });

  return httpServer;
}
