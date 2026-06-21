import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ─── Products ───────────────────────────────────────────────────────────────
export const products = pgTable("products", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  price: integer("price").notNull(),
  description: text("description").notNull().default(""),
  images: text("images").array().notNull().default(sql`'{}'::text[]`),
  sizes: text("sizes").array().notNull().default(sql`'{}'::text[]`),
  isOriginal: boolean("is_original").notNull().default(true),
  inStock: boolean("in_stock").notNull().default(true),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// ─── Cart Items ──────────────────────────────────────────────────────────────
export const cartItems = pgTable("cart_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  telegramUserId: text("telegram_user_id").notNull(),
  productId: integer("product_id").notNull(),
  size: text("size"),
  quantity: integer("quantity").notNull().default(1),
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true });
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;

// ─── Favorites ───────────────────────────────────────────────────────────────
export const favorites = pgTable("favorites", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  telegramUserId: text("telegram_user_id").notNull(),
  productId: integer("product_id").notNull(),
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({ id: true });
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;

// ─── Legacy user (kept for drizzle config) ───────────────────────────────────
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
