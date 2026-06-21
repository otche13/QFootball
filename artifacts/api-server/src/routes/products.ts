import { Router, type IRouter } from "express";
import {
  queryProducts,
  getProductById,
  getAvailableBrands,
} from "../lib/products";

const router: IRouter = Router();

router.get("/products", async (req, res): Promise<void> => {
  const page = Math.max(1, parseInt(String(req.query["page"] ?? "1"), 10) || 1);
  const limit = Math.min(
    20,
    Math.max(1, parseInt(String(req.query["limit"] ?? "8"), 10) || 8),
  );
  const search = req.query["search"]
    ? String(req.query["search"]).trim()
    : undefined;
  const brand = req.query["brand"]
    ? String(req.query["brand"]).trim()
    : undefined;

  const result = queryProducts({ page, limit, search, brand });

  res.json(result);
});

router.get("/products/brands", async (_req, res): Promise<void> => {
  const brands = getAvailableBrands();
  res.json({ brands });
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params["id"])
    ? req.params["id"][0]
    : req.params["id"];
  const id = parseInt(raw ?? "", 10);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }

  const product = getProductById(id);

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(product);
});

export default router;
