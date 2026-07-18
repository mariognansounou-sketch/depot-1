"use client";

import { useState } from "react";
import { Gauge, AlertTriangle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/ui/score-ring";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

interface SaturationResponse {
  signals: {
    advertiserCount: number;
    storeCount: number;
    avgCampaignDurationDays: number;
    adGrowthTrend: { period: string; count: number }[];
  };
  interpretation: {
    saturationLevel: "LOW" | "MEDIUM" | "HIGH";
    saturationPercent: number;
    recommendation: string;
    reasoning: string;
  };
}

const LEVEL_VARIANT: Record<string, "success" | "warning" | "destructive"> = {
  LOW: "success",
  MEDIUM: "warning",
  HIGH: "destructive",
};

export function SaturationDetectorApp() {
  const [name, setName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [advertiserCount, setAdvertiserCount] = useState("");
  const [avgDuration, setAvgDuration] = useState("");

  const [result, setResult] = useState<SaturationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const productResponse = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const productBody = await productResponse.json();
      if (!productResponse.ok) throw new Error(productBody.error ?? "Produit invalide");

      const manualSignals = showManual
        ? {
            advertiserCount: Number(advertiserCount) || 0,
            storeCount: Number(advertiserCount) || 0,
            avgCampaignDurationDays: Number(avgDuration) || 0,
            adGrowthTrend: [],
          }
        : undefined;

      const response = await fetch("/api/saturation-detector/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: productBody.product.id, searchQuery, manualSignals }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Analyse impossible");
      setResult(body);
    } catch (err) {
      setError({ message: err instanceof Error ? err.message : "Une erreur est survenue" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Saturation Detector</h1>
        <p className="text-sm text-muted-foreground">
          Évitez de lancer un produit trop tard, une fois le marché déjà saturé.
        </p>
      </div>

      <Card>
        <CardContent className="p-5">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sd-name">Produit</Label>
                <Input id="sd-name" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sd-query">Mot-clé de recherche (Ad Library)</Label>
                <Input
                  id="sd-query"
                  required
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ex : mini projecteur LED"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowManual((s) => !s)}
              className="flex items-center gap-1 self-start text-xs font-medium text-primary"
            >
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showManual && "rotate-180")} />
              {showManual ? "Masquer la saisie manuelle" : "Renseigner les signaux manuellement (sans API)"}
            </button>

            {showManual && (
              <div className="grid grid-cols-1 gap-3 rounded-md border border-border bg-surface-raised p-4 sm:grid-cols-2 animate-fade-in">
                <div className="flex flex-col gap-1.5">
                  <Label>Nombre d&apos;annonceurs / boutiques observés</Label>
                  <Input
                    type="number"
                    min={0}
                    value={advertiserCount}
                    onChange={(e) => setAdvertiserCount(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Durée moyenne des campagnes (jours)</Label>
                  <Input type="number" min={0} value={avgDuration} onChange={(e) => setAvgDuration(e.target.value)} />
                </div>
              </div>
            )}

            <Button type="submit" isLoading={isLoading} className="w-fit">
              <Gauge className="h-4 w-4" /> Détecter la saturation
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </CardContent>
        </Card>
      )}

      {!result && !isLoading && (
        <EmptyState
          icon={<Gauge className="h-8 w-8" />}
          title="Aucune analyse pour l'instant"
          description="Lancez une détection pour savoir si ce produit est encore une opportunité ou déjà trop disputé."
        />
      )}

      {result && (
        <Card className="animate-fade-in">
          <CardContent className="flex flex-col gap-6 p-6">
            <div className="flex items-center gap-4">
              <ScoreRing value={result.interpretation.saturationPercent} size={80} strokeWidth={7} label="satur." />
              <div>
                <Badge variant={LEVEL_VARIANT[result.interpretation.saturationLevel]}>
                  Saturation {result.interpretation.saturationLevel}
                </Badge>
                <p className="mt-1 text-sm font-medium">{result.interpretation.recommendation}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-md border border-border p-3 text-center">
                <p className="text-lg font-semibold">{result.signals.advertiserCount}</p>
                <p className="text-[10px] text-muted-foreground">Annonceurs détectés</p>
              </div>
              <div className="rounded-md border border-border p-3 text-center">
                <p className="text-lg font-semibold">{result.signals.storeCount}</p>
                <p className="text-[10px] text-muted-foreground">Boutiques estimées</p>
              </div>
              <div className="rounded-md border border-border p-3 text-center">
                <p className="text-lg font-semibold">{result.signals.avgCampaignDurationDays}j</p>
                <p className="text-[10px] text-muted-foreground">Durée moyenne</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">{result.interpretation.reasoning}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
