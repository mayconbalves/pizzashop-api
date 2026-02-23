import { faker } from "@faker-js/faker";
import {
  users,
  restaurants,
  orderItems,
  orders,
  products,
  authLinks,
} from "./schema";
import { db } from "./connection";
import chalk from "chalk";
import { createId } from "@paralleldrive/cuid2";

/**
 * Reset database
 **/

await db.delete(users);
await db.delete(restaurants);
await db.delete(orderItems);
await db.delete(orders);
await db.delete(products);
await db.delete(authLinks);

console.log(chalk.yellow("Database reset"));

function generateProduct(restaurantId: string) {
  return {
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    restaurantId,
    priceInCents: Number(faker.commerce.price({ min: 190, max: 490, dec: 0 })),
  };
}

// Create users

const [customer1, customer2] = await db
  .insert(users)
  .values([
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: "customer",
    },
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: "customer",
    },
  ])
  .returning();

console.log(chalk.yellow("create customer"));

const [manager] = await db
  .insert(users)
  .values([
    {
      name: faker.person.fullName(),
      email: "admin@admin.com",
      role: "manager",
    },
  ])
  .returning({ id: users.id });

if (!manager) {
  throw new Error("Manager was not created");
}

console.log(chalk.yellow("create manager"));

const [restaurant] = await db
  .insert(restaurants)
  .values([
    {
      name: faker.company.name(),
      description: faker.lorem.paragraph(),
      managerId: manager.id,
    },
  ])
  .returning();

if (!restaurant) {
  throw new Error("Restaurant was not created");
}

console.log(chalk.yellow("create restaurant"));

const availableProducts = await db
  .insert(products)
  .values([
    generateProduct(restaurant.id),
    generateProduct(restaurant.id),
    generateProduct(restaurant.id),
    generateProduct(restaurant.id),
  ])
  .returning();

console.log(chalk.yellow("create products"));

type OrderItemsInsert = typeof orderItems.$inferInsert;
type OrderInsert = typeof orders.$inferInsert;

const orderItemsToInsert: OrderItemsInsert[] = [];
const ordersToInsert: OrderInsert[] = [];

if (!customer1 || !customer2) {
  throw new Error("Customers were not created");
}

for (let i = 0; i < 200; i++) {
  const orderId = createId();

  const orderProducts = faker.helpers.arrayElements(availableProducts, {
    min: 1,
    max: 3,
  });

  let totalInCents = 0;

  orderProducts.forEach((orderProduct) => {
    const quantity = faker.number.int({ min: 1, max: 3 });

    totalInCents += orderProduct.priceInCents * quantity;

    orderItemsToInsert.push({
      orderId,
      priceInCents: orderProduct.priceInCents,
      quantity,
      productId: orderProduct.id,
    });
  });

  ordersToInsert.push({
    id: orderId,
    customerId: faker.helpers.arrayElement([customer1.id, customer2.id]),
    restaurantId: restaurant.id,
    totalInCents,
    status: faker.helpers.arrayElement([
      "pending",
      "processing",
      "delivering",
      "delivered",
      "canceled",
    ]),
    createdAt: faker.date.recent({ days: 40 }),
  });
}

await db.insert(orders).values(ordersToInsert);
await db.insert(orderItems).values(orderItemsToInsert);

console.log(chalk.yellow("Created orders"));

console.log(chalk.yellow("Database seeded successfully!"));

process.exit();
