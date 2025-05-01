import { faker } from "@faker-js/faker";
import { nanoid } from "nanoid";

async function main() {
  const count = 1000;

  const data = [] as Array<{
    id: string;
    name: string;
  }>;

  for (let i = 0; i < count; i++) {
    data.push({
      id: nanoid(),
      name: faker.commerce.productName(),
    });
  }

  console.log(JSON.stringify(data));
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
