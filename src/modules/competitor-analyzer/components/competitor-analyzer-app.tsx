"use client";

import { useState } from "react";
import { AlertTriangle, Scale, Sparkles, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { AnalyzeForm } from "./analyze-form";
import { AnalyzedAdCard } from "./analyzed-ad-card";
import { StrategyView } from "./strategy-view";
import { ComparisonView } from "./comparison-view";
import type { AnalyzedAd } from "../use-cases/analyze-competitor.use-case";
import type { StrategyResult, CompetitorComparisonResult } from "../schemas";
import type { CompetitorInputMode, ManualAdInput } from "../types";

async function ensureProduct(name: string): Promise<string> {
  const response = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? "Impossible de créer le produit");
  return body.product.id as string;
}

export function CompetitorAnalyzerApp() {
  const [productName, setProductName] = useState("");
  const [productId, setProductId] = useState<string | null>(null);
  const [analyzedAds, setAnalyzedAds] = useState<AnalyzedAd[]>([]);
  const [selectedAdIds, setSelectedAdIds] = useState<string[]>([]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);
  const [isComparing, setIsComparing] = useState(false);

  const [strategy, setStrategy] = useState<StrategyResult | null>(null);
  const [comparison, setComparison] = useState<CompetitorComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggleSelect(adId: string) {
    setSelectedAdIds((prev) => (prev.includes(adId) ? prev.filter((id) => id !== adId) : [...prev, adId]));
  }

  async function handleAnalyze(args: { mode: CompetitorInputMode; value: string; manualAd?: ManualAdInput }) {
    setError(null);
    setIsAnalyzing(true);
    try {
      const id = productId ?? (await ensureProduct(productName));
      setProductId(id);

      const response = await fetch("/api/competitor-analyzer/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...args, productId: id }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Analyse impossible");

      setAnalyzedAds((prev) => [...(body.results as AnalyzedAd[]), ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleGenerateStrategy() {
    if (!productId || selectedAdIds.length === 0) return;
    setError(null);
    setIsGeneratingStrategy(true);
    try {
      const response = await fetch("/api/competitor-analyzer/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, adIds: selectedAdIds }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Génération de stratégie impossible");
      setStrategy(body.strategy);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsGeneratingStrategy(false);
    }
  }

  async function handleCompare() {
    if (!productId || selectedAdIds.length < 2) return;
    setError(null);
    setIsComparing(true);
    try {
      const response = await fetch("/api/competitor-analyzer/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, adIds: selectedAdIds }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Comparatif impossible");
      setComparison(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsComparing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Competitor Intelligence AI</h1>
        <p className="text-sm text-muted-foreground">
          Comprenez pourquoi les publicités de vos concurrents fonctionnent, et créez une stratégie
          supérieure.
        </p>
      </div>

      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="analyze">
        <TabsList>
          <TabsTrigger value="analyze">Analyser</TabsTrigger>
          <TabsTrigger value="strategy">Stratégie supérieure</TabsTrigger>
          <TabsTrigger value="compare">Comparateur</TabsTrigger>
        </TabsList>

        <TabsContent value="analyze">
          <div className="flex flex-col gap-4">
            <AnalyzeForm
              productName={productName}
              onProductNameChange={setProductName}
              onSubmit={handleAnalyze}
              isLoading={isAnalyzing}
            />

            {analyzedAds.length === 0 ? (
              <EmptyState
                icon={<Users className="h-8 w-8" />}
                title="Aucune publicité analysée"
                description="Entrez un lien de publicité, un nom de produit, une boutique ou une marque concurrente pour lancer l'analyse."
              />
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-xs text-muted-foreground">
                  Sélectionnez au moins une publicité pour générer une stratégie, ou deux pour le
                  comparateur.
                </p>
                {analyzedAds.map((item) => (
                  <AnalyzedAdCard
                    key={item.adId}
                    item={item}
                    selected={selectedAdIds.includes(item.adId)}
                    onToggleSelect={toggleSelect}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="strategy">
          <div className="flex flex-col gap-4">
            <Button
              onClick={handleGenerateStrategy}
              isLoading={isGeneratingStrategy}
              disabled={selectedAdIds.length === 0}
              className="w-fit"
            >
              <Sparkles className="h-4 w-4" /> Générer une stratégie supérieure ({selectedAdIds.length}{" "}
              sélectionnée(s))
            </Button>
            {strategy ? (
              <StrategyView strategy={strategy} />
            ) : (
              <EmptyState
                icon={<Sparkles className="h-8 w-8" />}
                title="Pas encore de stratégie générée"
                description="Analysez et sélectionnez au moins une publicité concurrente dans l'onglet « Analyser », puis générez votre stratégie."
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="compare">
          <div className="flex flex-col gap-4">
            <Button
              onClick={handleCompare}
              isLoading={isComparing}
              disabled={selectedAdIds.length < 2}
              className="w-fit"
            >
              <Scale className="h-4 w-4" /> Comparer ({selectedAdIds.length} sélectionnée(s))
            </Button>
            {comparison ? (
              <ComparisonView comparison={comparison} />
            ) : (
              <EmptyState
                icon={<Scale className="h-8 w-8" />}
                title="Pas encore de comparatif"
                description="Sélectionnez au moins deux publicités analysées pour comparer les angles concurrents et détecter une opportunité."
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
