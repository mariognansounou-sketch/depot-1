import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/infrastructure/db/prisma";
import { hashPassword } from "@/modules/auth/password";
import { logger } from "@/infrastructure/logging/logger";

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 422 });
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Un compte existe déjà avec cet email" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "OWNER",
        settings: { create: {} },
      },
      select: { id: true, email: true, name: true },
    });

    logger.info("New user registered", { userId: user.id });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    // Race condition guard: two concurrent submissions can both pass the
    // findUnique check above before either insert lands. The email column's
    // unique constraint is the real guarantee; this just turns the DB-level
    // conflict into the same friendly message as the check above.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Un compte existe déjà avec cet email" }, { status: 409 });
    }
    logger.error("User registration failed", { error: String(error) });
    return NextResponse.json({ error: "Une erreur inattendue est survenue" }, { status: 500 });
  }
}
