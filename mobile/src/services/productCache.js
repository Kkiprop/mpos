import { MMKV } from "react-native-mmkv";
import { fetchProductsForSync } from "./api";

const storage = new MMKV({ id: "product-cache" });

const PRODUCTS_KEY = "products-by-barcode";

export function getProductsMap() {
  const raw = storage.getString(PRODUCTS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function getProductByBarcode(barcode) {
  const map = getProductsMap();
  return map[barcode] || null;
}

export async function syncProductsFromServer() {
  const products = await fetchProductsForSync();
  const byBarcode = {};
  for (const p of products) {
    byBarcode[p.barcode] = p;
  }
  storage.set(PRODUCTS_KEY, JSON.stringify(byBarcode));
  return byBarcode;
}

export function upsertProductInCache(product) {
  const current = getProductsMap();
  const updated = { ...current, [product.barcode]: product };
  storage.set(PRODUCTS_KEY, JSON.stringify(updated));
  return updated[product.barcode];
}
