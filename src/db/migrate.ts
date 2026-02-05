import postgres from "postgres";

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { env } from "../env";
import chalk from "chalk";

const connnection = postgres(
  env.DATABASE_URL,
  { max: 1 },
);
const db = drizzle(connnection);

await migrate(db, { migrationsFolder: "drizzle" });

console.log(chalk.greenBright("Migrations completed successfully"));

await connnection.end();

process.exit();
