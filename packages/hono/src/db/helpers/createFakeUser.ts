import { faker } from "@faker-js/faker";

export function createFakeUser(id: string) {
  faker.seed(getNumberSeedFromString(id)); // Seed the faker with the id
  return {
    id,
    name: faker.person.fullName(),
    age: faker.number.int({ min: 18, max: 100 }),
  };
}

function getNumberSeedFromString(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}
