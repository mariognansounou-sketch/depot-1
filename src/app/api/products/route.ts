import { NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { prisma } from "@/infrastructure/db/prisma";
import { createProductSchema } from "@/lib/validation/product.schema";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Produit invalide", issues: parsed.error.flatten() }, { status: 422 });
  }

  const existing = await prisma.product.findFirst({
    where: { userId: session.user.id, name: parsed.data.name },
  });
  if (existing) {
    return NextResponse.json({ product: existing });
  }

  const product = await prisma.product.create({
    data: { userId: session.user.id, ...parsed.data },
  });

  return NextResponse.json({ product }, { status: 201 });
}
