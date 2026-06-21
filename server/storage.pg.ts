import { eq, and } from "drizzle-orm";
import { db } from "./db";
import {
  products, cartItems, favorites, users,
  type Product, type InsertProduct,
  type CartItem, type InsertCartItem,
  type Favorite, type InsertFavorite,
  type User, type InsertUser,
} from "@shared/schema";
import { randomUUID } from "crypto";
import type { IStorage } from "./storage";
import { SEED_PRODUCTS } from "./seed";

export class PgStorage implements IStorage {
  async seed() {
    const existing = await db.select().from(products);
    if (existing.length === 0) {
      await db.insert(products).values(SEED_PRODUCTS);
    }
  }

  // ── Products ────────────────────────────────────────────────────────────────
  async getProducts(): Promise<Product[]> {
    return db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const rows = await db.select().from(products).where(eq(products.id, id));
    return rows[0];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const rows = await db.insert(products).values(product).returning();
    return rows[0];
  }

  // ── Cart ────────────────────────────────────────────────────────────────────
  async getCart(telegramUserId: string): Promise<CartItem[]> {
    return db.select().from(cartItems).where(eq(cartItems.telegramUserId, telegramUserId));
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    const existing = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.telegramUserId, item.telegramUserId),
          eq(cartItems.productId, item.productId),
          item.size ? eq(cartItems.size, item.size) : eq(cartItems.size, null as any)
        )
      );

    if (existing.length > 0) {
      const updated = await db
        .update(cartItems)
        .set({ quantity: existing[0].quantity + 1 })
        .where(eq(cartItems.id, existing[0].id))
        .returning();
      return updated[0];
    }

    const rows = await db.insert(cartItems).values({
      telegramUserId: item.telegramUserId,
      productId: item.productId,
      size: item.size ?? null,
      quantity: item.quantity ?? 1,
    }).returning();
    return rows[0];
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async updateCartQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const rows = await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id)).returning();
    return rows[0];
  }

  async clearCart(telegramUserId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.telegramUserId, telegramUserId));
  }

  // ── Favorites ───────────────────────────────────────────────────────────────
  async getFavorites(telegramUserId: string): Promise<Favorite[]> {
    return db.select().from(favorites).where(eq(favorites.telegramUserId, telegramUserId));
  }

  async addFavorite(fav: InsertFavorite): Promise<Favorite> {
    const existing = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.telegramUserId, fav.telegramUserId), eq(favorites.productId, fav.productId)));
    if (existing.length > 0) return existing[0];
    const rows = await db.insert(favorites).values(fav).returning();
    return rows[0];
  }

  async removeFavorite(telegramUserId: string, productId: number): Promise<void> {
    await db
      .delete(favorites)
      .where(and(eq(favorites.telegramUserId, telegramUserId), eq(favorites.productId, productId)));
  }

  async isFavorite(telegramUserId: string, productId: number): Promise<boolean> {
    const rows = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.telegramUserId, telegramUserId), eq(favorites.productId, productId)));
    return rows.length > 0;
  }

  // ── Users (legacy) ──────────────────────────────────────────────────────────
  async getUser(id: string): Promise<User | undefined> {
    const rows = await db.select().from(users).where(eq(users.id, id));
    return rows[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const rows = await db.select().from(users).where(eq(users.username, username));
    return rows[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const rows = await db.insert(users).values({ ...insertUser, id }).returning();
    return rows[0];
  }
}
