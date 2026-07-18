"use client";

import { useState } from "react";
import { Compass, Sparkles, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ScoreRing } from "@/components/ui/score-ring";
import type { MarketingAngleResult } from "@/modules/competitor-analyzer/schemas";

const CATEGORY_LABELS: Record<string, string> = {
  EMOTIONAL: "Angle émotionnel",
  RATIONAL: "Angle rationnel",
  SOCIAL: "Angle social",
  PROBLEM_SOLUTION: "Problème → Solution",
};

export function AngleFinderApp() {
  const [productName, setProductName] = useState("");
  const [angles, setAngles] = useState<MarketingAngleResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const productResponse = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: productName }),
      });
      const productBody = await productResponse.json();
      if (!productResponse.ok) throw new Error(productBody.error ?? "Produit invalide");

      const response = await fetch("/api/angle-finder/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: productBody.product.id }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Génération impossible");
      setAngles(body.angles);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  }

  const grouped = angles.reduce<Record<string, MarketingAngleResult[]>>((acc, angle) => {
    (acc[angle.category] ??= []).push(angle);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Angle Marketing Finder</h1>
        <p className="text-sm text-muted-foreground">
          Découvrez comment vendre votre produit différemment et plus efficacement que vos concurrents.
        </p>
      </div>

      <Card>
        <CardContent className="p-5">
          <form onSubmit={handleGenerate} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="angle-product">Produit</Label>
              <Input
                id="angle-product"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Ex : Tuyau d'arrosage extensible"
              />
            </div>
            <Button type="submit" isLoading={isLoading}>
              <Sparkles className="h-4 w-4" /> Générer 50 angles
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {angles.length === 0 && !isLoading ? (
        <EmptyState
          icon={<Compass className="h-8 w-8" />}
          title="Aucun angle généré"
          description="Entrez un produit pour découvrir jusqu'à 50 angles marketing classés par catégorie, avec un score d'opportunité pour chacun."
        />
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-muted-foreground">{CATEGORY_LABELS[category] ?? category}</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {items.map((angle, i) => (
                <Card key={i} className="animate-fade-in">
                  <CardContent className="flex flex-col gap-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold leading-tight">{angle.name}</p>
                        {angle.isUsedByCompetitor && (
                          <Badge variant="secondary" className="mt-1">
                            Déjà utilisé par un concurrent
                          </Badge>
                        )}
                      </div>
                      <ScoreRing value={angle.opportunityScore} size={44} strokeWidth={4} />
                    </div>
                    <p className="text-xs text-muted-foreground">{angle.description}</p>
                    <p className="text-xs">
                      <span className="font-medium">Pourquoi : </span>
                      {angle.whyItWorks}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                      <Badge variant="outline">Cible : {angle.targetClient}</Badge>
                      <Badge
                        variant={
                          angle.competitionLevel === "LOW"
                            ? "success"
                            : angle.competitionLevel === "MEDIUM"
                              ? "warning"
                              : "destructive"
                        }
                      >
                        Concurrence {angle.competitionLevel}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
