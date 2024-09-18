import { type Knex } from "knex";

export const config = {
  client: "better-sqlite3",
  connection: {
    filename: "./db.sqlite",
  },
  useNullAsDefault: true,
  migrations: {
    directory: "./src/db/migrations",
    loadExtensions: [".ts", ".js"],
  },
  seeds: {
    directory: "./src/db/seeds",
    loadExtensions: [".ts", ".js"],
  },
} satisfies Knex.Config;
