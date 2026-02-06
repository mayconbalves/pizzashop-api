import { drizzle } from "drizzle-orm/postgres-js";
import postgress from "postgres";
import { env } from "../env";
import * as schema from "./schema";

const connection = postgress(env.DATABASE_URL);

export const db = drizzle(connection, { schema });
