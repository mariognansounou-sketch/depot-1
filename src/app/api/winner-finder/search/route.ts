import { NextResponse } from "next/server";
import { auth } from "@/modules/auth/auth";
import { winnerFinderFiltersSchema } from "@/lib/validation/winner-finder.schema";
import { SearchWinningProductsUseCase } from "@/modules/winner-finder/use-cases/search-winning-products.use-case";
import { getAdSource, isMetaAdLibraryConfigured } from "@/infrastructure/ad-sources/ad-source.factory";
import { DomainError } from "@/core/errors";
import { logger } from "@/infrastructure/logging/logger";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = winnerFinderFiltersSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Filtres invalides", issues: parsed.error.flatten() }, { status: 422 });
  }

  if (!isMetaAdLibraryConfigured()) {
    return NextResponse.json(
      {
        error:
          "La Meta Ad Library API n'est pas configurée sur cet environnement. Ajoutez une publicité manuellement ou configurez META_AD_LIBRARY_ACCESS_TOKEN (voir docs/META_AD_LIBRARY.md).",
        code: "META_AD_LIBRARY_NOT_CONFIGURED",
      },
      { status: 424 },
    );
  }

  try {
    const useCase = new SearchWinningProductsUseCase(getAdSource());
    const results = await useCase.execute(session.user.id, parsed.data);
    return NextResponse.json({ results });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.httpStatus });
    }
    logger.error("Winner finder search failed", { error: String(error) });
    return NextResponse.json({ error: "Une erreur inattendue est survenue" }, { status: 500 });
  }
}
