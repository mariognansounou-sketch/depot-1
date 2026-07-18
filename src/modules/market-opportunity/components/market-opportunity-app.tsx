"use client";

import { useState } from "react";
import { Gauge, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScoreRing } from "@/components/ui/score-ring";
import { EmptyState } from "@/components/ui/empty-state";
import { COUNTRY_OPTIONS, CATEGORY_OPTIONS } from "@/lib/constants";
import type { MarketOpportunityResult } from "../schemas";

const CRITERIA: { key: keyof MarketOpportunityResult; label: string }[] = [
  { key: "successElsewhere", label: "Succès ailleurs" },
  { key: "localCompetition", label: "Concurrence locale" },
  { key: "purchasingPower", label: "Pouvoir d'achat" },
  { key: "culturalFit", label: "Adaptation culturelle" },
  { key: "logistics", label: "Logistique" },
];

export function MarketOpportunityApp() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [priceSale, setPriceSale] = useState("");
  const [country, setCountry] = useState("BJ");

  const [result, setResult] = useState<MarketOpportunityResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const productResponse = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category: category || undefined,
          priceSale: priceSale ? Number(priceSale) : undefined,
          targetCountry: country,
        }),
      });
      const productBody = await productResponse.json();
      if (!productResponse.ok) throw new Error(productBody.error ?? "Produit invalide");

      const response = await fetch("/api/market-opportunity/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: productBody.product.id, country }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Score impossible");
      setResult(body.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  }

  const countryLabel = COUNTRY_OPTIONS.find((c) => c.code === country)?.label ?? country;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Market Opportunity Score</h1>
        <p className="text-sm text-muted-foreground">
          Sachez si un produit est une opportunité dans un marché précis avant de vous lancer.
        </p>
      </div>

      <Card>
        <CardContent className="p-5">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="mo-name">Produit</Label>
              <Input id="mo-name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Catégorie</Label>
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Sélectionner</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Pays cible</Label>
              <Select value={country} onChange={(e) => setCountry(e.target.value)}>
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Prix de vente envisagé</Label>
              <Input type="number" min={0} value={priceSale} onChange={(e) => setPriceSale(e.target.value)} />
            </div>
            <Button type="submit" isLoading={isLoading} className="w-fit sm:col-span-2">
              <Gauge className="h-4 w-4" /> Calculer le score d&apos;opportunité
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

      {!result && !isLoading && (
        <EmptyState
          icon={<Gauge className="h-8 w-8" />}
          title="Aucun score calculé"
          description="Remplissez le formulaire pour évaluer l'opportunité de ce produit sur le marché sélectionné."
        />
      )}

      {result && (
        <Card className="animate-fade-in">
          <CardContent className="flex flex-col gap-6 p-6">
            <div className="flex items-center gap-4">
              <ScoreRing value={result.totalScore} size={80} strokeWidth={7} label="/100" />
              <div>
                <p className="text-sm text-muted-foreground">Opportunity Score — {countryLabel}</p>
                <p className="mt-1 text-sm font-medium">{result.message}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
              {CRITERIA.map((c) => {
                const item = result[c.key] as { score: number; reasoning: string };
                return (
                  <div key={c.key} className="rounded-md border border-border p-3 text-center">
                    <p className="text-lg font-semibold">{item.score}/20</p>
                    <p className="text-[10px] text-muted-foreground">{c.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-2">
              {CRITERIA.map((c) => {
                const item = result[c.key] as { score: number; reasoning: string };
                return (
                  <p key={c.key} className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{c.label} : </span>
                    {item.reasoning}
                  </p>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
