import { Knex } from "knex";
import { faker } from "@faker-js/faker";

import { getNumberSeedFromString } from "@/utils/createFakeUser";

export async function up(knex: Knex) {
  await knex("users").insert(createFakeUser("20240425141133-migration-user"));
}

export function down(knex: Knex) {
  knex("users").where("id", "20240425141133-migration-user").del();
}

function createFakeUser(id: string) {
  faker.seed(getNumberSeedFromString(id)); // Seed the faker with the id
  return {
    id,
    name: faker.person.fullName(),
    age: faker.number.int({ min: 18, max: 100 }),
    created: faker.date
      .past({ years: faker.number.int({ min: 1, max: 10 }) })
      .getTime(),
  };
}
