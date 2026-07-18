"use client";

import { useState } from "react";
import { Brain, AlertTriangle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { BrainInsightsResult } from "../schemas";
import type { BrainStats } from "../stats";

export function EcommerceBrainApp() {
  const [stats, setStats] = useState<BrainStats | null>(null);
  const [insights, setInsights] = useState<BrainInsightsResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ecommerce-brain/insights", { method: "POST" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Génération impossible");
      setStats(body.stats);
      setInsights(body.insights);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  }

  const statTiles = stats
    ? [
        { label: "Produits suivis", value: stats.totalProducts },
        { label: "Validations produit", value: stats.totalValidations },
        { label: "Score validation moyen", value: stats.avgValidationScore ?? "—" },
        { label: "Créatives analysées", value: stats.totalCreativeAnalyses },
        { label: "Hook moyen /10", value: stats.avgHookScore ?? "—" },
        { label: "Scripts générés", value: stats.totalScripts },
        { label: "Textes générés", value: stats.totalCopyAssets },
        { label: "Rapports de saturation", value: stats.totalSaturationReports },
      ]
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Personal Ecommerce Brain</h1>
        <p className="text-sm text-muted-foreground">
          La mémoire IA de votre activité : elle apprend de vos actions passées sur AdWinner OS.
        </p>
      </div>

      <Card>
        <CardContent className="flex items-center justify-between p-5">
          <p className="text-sm text-muted-foreground">
            Analyse votre historique réel (produits, validations, créatives, scripts...) pour en tirer des
            tendances personnalisées.
          </p>
          <Button onClick={handleGenerate} isLoading={isLoading}>
            <Brain className="h-4 w-4" /> Générer mes insights
          </Button>
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

      {!stats && !isLoading && (
        <EmptyState
          icon={<Brain className="h-8 w-8" />}
          title="Pas encore d'historique analysé"
          description="Utilisez d'abord les autres modules (Winner Finder, Product Validator, Creative Analyzer...) pour construire votre historique, puis générez vos insights."
        />
      )}

      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statTiles.map((tile) => (
            <Card key={tile.label}>
              <CardContent className="p-4 text-center">
                <p className="text-lg font-semibold">{tile.value}</p>
                <p className="text-[10px] text-muted-foreground">{tile.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {insights && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <Card>
            <CardContent className="flex flex-col gap-2 p-5">
              <p className="text-sm font-medium">Observations personnalisées</p>
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                {insights.insights.map((insight, i) => (
                  <li key={i} className="rounded-md bg-muted p-2.5">
                    {insight}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="flex items-start gap-3 p-5">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-sm text-muted-foreground">{insights.recommendation}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
