import { text, pgTable, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./users";
import { orders } from "./orders";
import { products } from "./products";

export const orderItems = pgTable("order_items", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, {
      onDelete: "cascade",
    }),
  productId: text("product_id").references(() => users.id, {
    onDelete: "set null",
  }),
  priceInCents: integer("price_in_cents").notNull(),
  quantity: integer("quantity").notNull(),
});

export const orderItemsRelations = relations(orderItems, ({ one }) => {
  return {
    order: one(orders, {
      fields: [orderItems.orderId],
      references: [orders.id],
      relationName: "order_item_order",
    }),
    products: one(products, {
      fields: [orderItems.productId],
      references: [products.id],
      relationName: "order_product_item",
    }),
  };
});
