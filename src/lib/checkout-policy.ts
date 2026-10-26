import { z } from "zod";

export const checkoutItemsSchema = z.array(z.object({
  product: z.object({ _id: z.string().min(1).max(128).regex(/^[\w-]+$/) }),
  quantity: z.number().int().min(1).max(99),
  size: z.string().max(32).optional(),
})).min(1).max(100);

export function canonicalCheckout<T extends { _id: string; price?: number; name?: string; stock?: number }>(items: z.infer<typeof checkoutItemsSchema>, products: T[]) {
  const totals = new Map<string, number>();
  return items.map(item => {
    const product = products.find(p => p._id === item.product._id);
    if (!product || !Number.isFinite(product.price) || product.price! <= 0 || !Number.isSafeInteger(Math.round(product.price! * 100))) throw new Error("Produit ou prix indisponible");
    const total = (totals.get(product._id) ?? 0) + item.quantity;
    totals.set(product._id, total);
    if (total > 99 || (product.stock != null && total > product.stock)) throw new Error("Stock insuffisant");
    return { ...item, product };
  });
}

export const orderDocumentId = (sessionId: string) => {
  if (!/^cs_(test_|live_)?[A-Za-z0-9]+$/.test(sessionId)) throw new Error("Session invalide");
  return `order.${sessionId}`;
};
