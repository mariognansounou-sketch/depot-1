import { NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { prisma } from "@/infrastructure/db/prisma";

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  }

  await prisma.apiKey.deleteMany({ where: { id: params.id, userId: session.user.id } });

  return NextResponse.json({ success: true });
}
