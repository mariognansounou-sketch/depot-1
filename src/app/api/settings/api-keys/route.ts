import { NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { prisma } from "@/infrastructure/db/prisma";
import { encryptSecret } from "@/infrastructure/security/crypto";
import { createApiKeySchema } from "@/lib/validation/settings.schema";
import { logger } from "@/infrastructure/logging/logger";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  }

  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id },
    select: { id: true, provider: true, label: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ keys });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createApiKeySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Clé API invalide" }, { status: 422 });
  }

  let encryptedValue: string;
  try {
    encryptedValue = encryptSecret(parsed.data.value);
  } catch (error) {
    logger.error("Failed to encrypt API key — check ENCRYPTION_KEY", { error: String(error) });
    return NextResponse.json(
      { error: "Le chiffrement des clés API n'est pas correctement configuré sur ce serveur." },
      { status: 500 },
    );
  }

  const key = await prisma.apiKey.create({
    data: {
      userId: session.user.id,
      provider: parsed.data.provider,
      label: parsed.data.label,
      encryptedValue,
    },
    select: { id: true, provider: true, label: true, createdAt: true },
  });

  return NextResponse.json({ key }, { status: 201 });
}
