import {
  type Product, type InsertProduct,
  type CartItem, type InsertCartItem,
  type Favorite, type InsertFavorite,
  type User, type InsertUser,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { SEED_PRODUCTS } from "./seed";

export interface IStorage {
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;

  getCart(telegramUserId: string): Promise<CartItem[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  removeFromCart(id: number): Promise<void>;
  updateCartQuantity(id: number, quantity: number): Promise<CartItem | undefined>;
  clearCart(telegramUserId: string): Promise<void>;

  getFavorites(telegramUserId: string): Promise<Favorite[]>;
  addFavorite(fav: InsertFavorite): Promise<Favorite>;
  removeFavorite(telegramUserId: string, productId: number): Promise<void>;
  isFavorite(telegramUserId: string, productId: number): Promise<boolean>;

  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private products: Map<number, Product> = new Map();
  private cartItems: Map<number, CartItem> = new Map();
  private favorites: Map<number, Favorite> = new Map();
  private users: Map<string, User> = new Map();
  private productCounter = 1;
  private cartCounter = 1;
  private favCounter = 1;

  constructor() {
    for (const p of SEED_PRODUCTS) {
      const id = this.productCounter++;
      this.products.set(id, { ...p, id });
    }
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productCounter++;
    const p: Product = { ...product, id };
    this.products.set(id, p);
    return p;
  }
  async getCart(telegramUserId: string): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter((c) => c.telegramUserId === telegramUserId);
  }
  async addToCart(item: InsertCartItem): Promise<CartItem> {
    const existing = Array.from(this.cartItems.values()).find(
      (c) => c.telegramUserId === item.telegramUserId && c.productId === item.productId && c.size === (item.size ?? null)
    );
    if (existing) { existing.quantity += 1; return existing; }
    const id = this.cartCounter++;
    const c: CartItem = { id, telegramUserId: item.telegramUserId, productId: item.productId, size: item.size ?? null, quantity: item.quantity ?? 1 };
    this.cartItems.set(id, c);
    return c;
  }
  async removeFromCart(id: number): Promise<void> { this.cartItems.delete(id); }
  async updateCartQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const item = this.cartItems.get(id);
    if (!item) return undefined;
    item.quantity = quantity;
    return item;
  }
  async clearCart(telegramUserId: string): Promise<void> {
    for (const [id, c] of this.cartItems) {
      if (c.telegramUserId === telegramUserId) this.cartItems.delete(id);
    }
  }
  async getFavorites(telegramUserId: string): Promise<Favorite[]> {
    return Array.from(this.favorites.values()).filter((f) => f.telegramUserId === telegramUserId);
  }
  async addFavorite(fav: InsertFavorite): Promise<Favorite> {
    const already = Array.from(this.favorites.values()).find(
      (f) => f.telegramUserId === fav.telegramUserId && f.productId === fav.productId
    );
    if (already) return already;
    const id = this.favCounter++;
    const f: Favorite = { id, ...fav };
    this.favorites.set(id, f);
    return f;
  }
  async removeFavorite(telegramUserId: string, productId: number): Promise<void> {
    for (const [id, f] of this.favorites) {
      if (f.telegramUserId === telegramUserId && f.productId === productId) { this.favorites.delete(id); return; }
    }
  }
  async isFavorite(telegramUserId: string, productId: number): Promise<boolean> {
    return Array.from(this.favorites.values()).some(
      (f) => f.telegramUserId === telegramUserId && f.productId === productId
    );
  }
  async getUser(id: string): Promise<User | undefined> { return this.users.get(id); }
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.username === username);
  }
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
}

export async function createStorage(): Promise<IStorage> {
  if (process.env.DATABASE_URL) {
    const { PgStorage } = await import("./storage.pg");
    const pgStorage = new PgStorage();
    await pgStorage.seed();
    console.log("[storage] Using PostgreSQL");
    return pgStorage;
  }
  console.warn("[storage] DATABASE_URL not set — using in-memory storage (data resets on restart)");
  return new MemStorage();
}
