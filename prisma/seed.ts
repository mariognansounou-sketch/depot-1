import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/modules/auth/password";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@adwinner.os";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Demo user already exists, skipping seed.");
    return;
  }

  const passwordHash = await hashPassword("adwinner-demo-2026");

  await prisma.user.create({
    data: {
      email,
      name: "Demo",
      passwordHash,
      role: "OWNER",
      settings: { create: { defaultCountry: "BJ" } },
    },
  });

  console.log(`Seeded demo user: ${email} / adwinner-demo-2026`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
