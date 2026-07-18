"use client";

import { useState } from "react";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/ui/score-ring";
import { EmptyState } from "@/components/ui/empty-state";
import { CATEGORY_OPTIONS, COUNTRY_OPTIONS } from "@/lib/constants";
import type { ProductValidationResult } from "../schemas";

const CRITERIA: { key: keyof ProductValidationResult; label: string }[] = [
  { key: "demandScore", label: "Demande marché" },
  { key: "competitionScore", label: "Concurrence" },
  { key: "marginScore", label: "Marge" },
  { key: "logisticsScore", label: "Logistique" },
  { key: "adPotentialScore", label: "Potentiel publicitaire" },
];

const DECISION_LABEL: Record<
  ProductValidationResult["decision"],
  { label: string; variant: "success" | "warning" | "destructive" }
> = {
  LAUNCH: { label: "Lancer immédiatement", variant: "success" },
  TEST: { label: "Tester avec un petit budget", variant: "warning" },
  AVOID: { label: "Éviter ce produit", variant: "destructive" },
};

export function ProductValidatorApp() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [priceCost, setPriceCost] = useState("");
  const [priceSale, setPriceSale] = useState("");
  const [targetCountry, setTargetCountry] = useState("BJ");

  const [result, setResult] = useState<ProductValidationResult | null>(null);
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
          priceCost: priceCost ? Number(priceCost) : undefined,
          priceSale: priceSale ? Number(priceSale) : undefined,
          targetCountry: targetCountry || undefined,
        }),
      });
      const productBody = await productResponse.json();
      if (!productResponse.ok) throw new Error(productBody.error ?? "Produit invalide");

      const response = await fetch("/api/product-validator/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: productBody.product.id }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Validation impossible");
      setResult(body.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Product Validator AI</h1>
        <p className="text-sm text-muted-foreground">
          Déterminez si un produit mérite d&apos;être lancé avant de dépenser en publicité.
        </p>
      </div>

      <Card>
        <CardContent className="p-5">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="pv-name">Produit</Label>
              <Input id="pv-name" required value={name} onChange={(e) => setName(e.target.value)} />
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
              <Select value={targetCountry} onChange={(e) => setTargetCountry(e.target.value)}>
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Prix d&apos;achat</Label>
              <Input type="number" min={0} value={priceCost} onChange={(e) => setPriceCost(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Prix de vente prévu</Label>
              <Input type="number" min={0} value={priceSale} onChange={(e) => setPriceSale(e.target.value)} />
            </div>
            <Button type="submit" isLoading={isLoading} className="w-fit sm:col-span-2">
              <ShieldCheck className="h-4 w-4" /> Valider ce produit
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
          icon={<ShieldCheck className="h-8 w-8" />}
          title="Aucune validation pour l'instant"
          description="Remplissez le formulaire pour obtenir un score détaillé et une recommandation de lancement."
        />
      )}

      {result && (
        <Card className="animate-fade-in">
          <CardContent className="flex flex-col gap-6 p-6">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
              <div className="flex items-center gap-4">
                <ScoreRing value={result.totalScore} size={80} strokeWidth={7} label="/100" />
                <div>
                  <p className="text-sm text-muted-foreground">Product Score</p>
                  <Badge variant={DECISION_LABEL[result.decision].variant} className="mt-1">
                    {DECISION_LABEL[result.decision].label}
                  </Badge>
                </div>
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

            <div className="rounded-md bg-primary/5 p-4 text-sm">
              <span className="font-medium text-primary">Synthèse : </span>
              {result.reasoning}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
