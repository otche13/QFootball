import type { InsertProduct } from "@shared/schema";

export const SEED_PRODUCTS: InsertProduct[] = [
  {
    name: "Nike Mercurial Vapor 16",
    brand: "Nike",
    price: 7990,
    description:
      "Профессиональные футбольные бутсы для игры на натуральном и искусственном газоне. Верх из тонкого синтетического материала обеспечивает точный контроль мяча.",
    images: ["/figmaAssets/image-12.png", "/figmaAssets/image-13.png", "/figmaAssets/image-14.png"],
    sizes: ["37", "37.5", "38", "38.5", "39", "39.5", "40", "40.5", "41", "42", "42.5", "43", "44", "45", "46"],
    isOriginal: true,
    inStock: true,
  },
  {
    name: "Adidas X Crazyfast",
    brand: "Adidas",
    price: 8490,
    description:
      "Сверхлёгкие бутсы серии Crazyfast от Adidas. Созданы для максимальной скорости и взрывного старта.",
    images: ["/figmaAssets/image-13.png", "/figmaAssets/image-12.png"],
    sizes: ["38", "38.5", "39", "40", "41", "42", "43", "44"],
    isOriginal: true,
    inStock: true,
  },
  {
    name: "Puma Future Ultimate",
    brand: "Puma",
    price: 6990,
    description:
      "Адаптивные бутсы с уникальной шнуровкой NETFIT, позволяющей настроить посадку под любую форму стопы.",
    images: ["/figmaAssets/image-14.png", "/figmaAssets/image-15.png"],
    sizes: ["37", "38", "39", "40", "41", "42", "43"],
    isOriginal: true,
    inStock: true,
  },
  {
    name: "Adidas Predator Elite",
    brand: "Adidas",
    price: 9990,
    description:
      "Элитные бутсы с системой CONTROLSKIN для непревзойдённого касания мяча. Любимая модель плеймейкеров.",
    images: ["/figmaAssets/image-15.png", "/figmaAssets/image-12.png"],
    sizes: ["39", "40", "41", "42", "43", "44", "45"],
    isOriginal: true,
    inStock: true,
  },
  {
    name: "Nike Phantom GX Elite",
    brand: "Nike",
    price: 11990,
    description:
      "Инновационная модель с технологией Ghost Lace и текстурированным верхом для идеального контроля мяча.",
    images: ["/figmaAssets/image-12.png", "/figmaAssets/image-15.png"],
    sizes: ["38", "39", "40", "41", "42", "43", "44", "45"],
    isOriginal: true,
    inStock: true,
  },
  {
    name: "Asics Lethal Speed",
    brand: "Asics",
    price: 5490,
    description:
      "Классические бутсы Asics с надёжным кожаным верхом и традиционной шнуровкой для максимального чувства мяча.",
    images: ["/figmaAssets/image-13.png", "/figmaAssets/image-14.png"],
    sizes: ["37", "38", "39", "40", "41", "42"],
    isOriginal: true,
    inStock: true,
  },
];
