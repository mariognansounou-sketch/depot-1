import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/modules/auth/auth";
import { prisma } from "@/infrastructure/db/prisma";
import { createSupplierSchema } from "@/lib/validation/supplier.schema";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  const parsed = z.string().cuid().safeParse(productId);
  if (!parsed.success) {
    return NextResponse.json({ error: "productId invalide" }, { status: 422 });
  }

  const product = await prisma.product.findFirst({ where: { id: parsed.data, userId: session.user.id } });
  if (!product) {
    return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  }

  const suppliers = await prisma.supplier.findMany({
    where: { productId: parsed.data },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ suppliers });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createSupplierSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Fournisseur invalide", issues: parsed.error.flatten() }, { status: 422 });
  }

  const product = await prisma.product.findFirst({
    where: { id: parsed.data.productId, userId: session.user.id },
  });
  if (!product) {
    return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  }

  const supplier = await prisma.supplier.create({ data: parsed.data });

  return NextResponse.json({ supplier }, { status: 201 });
}
