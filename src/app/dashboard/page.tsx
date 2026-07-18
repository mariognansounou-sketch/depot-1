import Link from "next/link";
import { Trophy, Users, Search, Star, ArrowRight } from "lucide-react";
import { auth } from "@/modules/auth/auth";
import { prisma } from "@/infrastructure/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

async function getStats(userId: string) {
  const [productCount, winnerCount, adAnalysisCount, favoriteCount, recentSearches] = await Promise.all([
    prisma.product.count({ where: { userId } }),
    prisma.product.count({ where: { userId, status: "WINNER" } }),
    prisma.adAnalysis.count({ where: { ad: { competitor: { userId } } } }),
    prisma.favorite.count({ where: { userId } }),
    prisma.searchHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);
  return { productCount, winnerCount, adAnalysisCount, favoriteCount, recentSearches };
}

export default async function DashboardPage() {
  const session = await auth();
  const stats = await getStats(session!.user.id);

  const statCards = [
    { label: "Produits trackés", value: stats.productCount, icon: Trophy },
    { label: "Produits gagnants", value: stats.winnerCount, icon: Star },
    { label: "Publicités analysées", value: stats.adAnalysisCount, icon: Users },
    { label: "Favoris", value: stats.favoriteCount, icon: Star },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Bonjour {session?.user.name?.split(" ")[0] ?? ""} 👋
        </h1>
        <p className="text-sm text-muted-foreground">Voici un aperçu de votre activité e-commerce.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-2xl font-semibold">{stat.value}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <stat.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Recherches récentes</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentSearches.length === 0 ? (
              <EmptyState
                icon={<Search className="h-8 w-8" />}
                title="Aucune recherche pour l'instant"
                description="Lancez votre première recherche de produit gagnant pour voir apparaître votre historique ici."
                action={
                  <Link href="/dashboard/winner-finder">
                    <Button>
                      Trouver un produit gagnant <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                }
              />
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {stats.recentSearches.map((search) => (
                  <li key={search.id} className="flex items-center justify-between py-3 text-sm">
                    <span className="font-medium">{search.module}</span>
                    <span className="text-muted-foreground">{search.resultSummary}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parcours recommandé</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {[
              { step: "1", label: "Trouver un produit gagnant", href: "/dashboard/winner-finder" },
              { step: "2", label: "Analyser les concurrents", href: "/dashboard/competitor-analyzer" },
              { step: "3", label: "Trouver un meilleur angle", href: "/dashboard/angle-finder" },
              { step: "4", label: "Valider le produit", href: "/dashboard/product-validator" },
            ].map((item) => (
              <Link
                key={item.step}
                href={item.href}
                className="flex items-center gap-3 rounded-md border border-border p-3 text-sm transition-colors hover:bg-secondary"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {item.step}
                </span>
                {item.label}
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
