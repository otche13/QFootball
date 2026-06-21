import fs from "fs";
import path from "path";
import { logger } from "./logger";

export interface RawProduct {
  position: number;
  name: string;
  url: string;
  image: string;
  price: string;
  currency: string;
}

export interface Product {
  id: number;
  position: number;
  name: string;
  brand: string;
  url: string;
  image: string;
  price: number;
  currency: string;
  sizes: string[];
}

const KNOWN_BRANDS = [
  "Nike",
  "Adidas",
  "Puma",
  "New Balance",
  "Mizuno",
  "Asics",
  "Reebok",
  "Under Armour",
  "Umbro",
  "Diadora",
  "Lotto",
  "Joma",
  "Kelme",
  "Hummel",
  "Salomon",
  "ANTA",
  "Li-Ning",
  "Skechers",
];

const STANDARD_SIZES = [
  "37",
  "37.5",
  "38",
  "38.5",
  "39",
  "39.5",
  "40",
  "40.5",
  "41",
  "41.5",
  "42",
  "42.5",
  "43",
  "43.5",
  "44",
  "44.5",
  "45",
  "45.5",
  "46",
  "47",
];

function extractBrand(name: string): string {
  for (const brand of KNOWN_BRANDS) {
    if (name.toLowerCase().startsWith(brand.toLowerCase())) {
      return brand;
    }
  }
  const firstWord = name.split(" ")[0];
  return firstWord ?? "Unknown";
}

function getDataPath(): string {
  const workspaceRoot = process.cwd().endsWith(
    path.join("artifacts", "api-server"),
  )
    ? path.resolve(process.cwd(), "../..")
    : process.cwd();
  return path.resolve(workspaceRoot, "artifacts/api-server/data/products.json");
}

let cachedProducts: Product[] | null = null;

export function loadProducts(): Product[] {
  if (cachedProducts) return cachedProducts;

  const dataPath = getDataPath();

  if (!fs.existsSync(dataPath)) {
    logger.warn({ dataPath }, "products.json not found, returning empty list");
    return [];
  }

  try {
    const raw = fs.readFileSync(dataPath, "utf-8");
    const items: RawProduct[] = JSON.parse(raw);

    cachedProducts = items.map((item, index) => ({
      id: item.position ?? index + 1,
      position: item.position ?? index + 1,
      name: item.name,
      brand: extractBrand(item.name),
      url: item.url,
      image: item.image,
      price: parseFloat(item.price),
      currency: item.currency ?? "USD",
      sizes: STANDARD_SIZES,
    }));

    logger.info({ count: cachedProducts.length }, "Products loaded from JSON");
    return cachedProducts;
  } catch (err) {
    logger.error({ err, dataPath }, "Failed to parse products.json");
    return [];
  }
}

export function reloadProducts(): void {
  cachedProducts = null;
}

export interface ProductsQuery {
  page: number;
  limit: number;
  search?: string;
  brand?: string;
}

export interface ProductsResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function queryProducts(query: ProductsQuery): ProductsResult {
  let items = loadProducts();

  if (query.search) {
    const q = query.search.toLowerCase();
    items = items.filter((p) => p.name.toLowerCase().includes(q));
  }

  if (query.brand) {
    const b = query.brand.toLowerCase();
    items = items.filter((p) => p.brand.toLowerCase() === b);
  }

  const total = items.length;
  const totalPages = Math.ceil(total / query.limit);
  const offset = (query.page - 1) * query.limit;
  const products = items.slice(offset, offset + query.limit);

  return { products, total, page: query.page, limit: query.limit, totalPages };
}

export function getProductById(id: number): Product | undefined {
  return loadProducts().find((p) => p.id === id);
}

export function getAvailableBrands(): string[] {
  const products = loadProducts();
  const brands = new Set(products.map((p) => p.brand));
  return Array.from(brands).sort();
}
