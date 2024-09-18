import { type Knex } from "knex";

export function createDbConfig(filename = "./db.sqlite") {
  return {
    client: "better-sqlite3",
    connection: { filename },
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
}
