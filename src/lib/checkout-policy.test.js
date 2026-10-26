import { test, expect } from "bun:test";
import { checkoutItemsSchema, canonicalCheckout, orderDocumentId } from "./checkout-policy";
test("prices come from the catalog, quantities and aggregate stock are bounded", () => {
  const parsed = checkoutItemsSchema.parse([{ product: { _id: "dress", price: 0.01 }, quantity: 2, size: "S" }]);
  expect(canonicalCheckout(parsed, [{ _id: "dress", price: 50, stock: 3 }])[0].product.price).toBe(50);
  for (const quantity of [0,-1,0.5,100,"2"]) expect(() => checkoutItemsSchema.parse([{ product: { _id: "dress" }, quantity }])).toThrow();
  expect(() => canonicalCheckout([...parsed,...parsed], [{ _id:"dress",price:50,stock:3 }])).toThrow();
  expect(() => canonicalCheckout(parsed, [])).toThrow();
});
test("full session identity is retained for atomic order creation", () => {
  expect(orderDocumentId("cs_test_one")).toBe("order.cs_test_one");
  expect(orderDocumentId("cs_test_two")).not.toBe(orderDocumentId("cs_test_one"));
  expect(() => orderDocumentId("../../order")).toThrow();
});
