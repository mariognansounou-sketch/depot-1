"use client";

import { useState } from "react";
import { PackagePlus, AlertTriangle, Gift, ShieldCheck, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/utils";
import type { OfferResult } from "../schemas";

export function OfferBuilderApp() {
  const [name, setName] = useState("");
  const [priceCost, setPriceCost] = useState("");
  const [priceSale, setPriceSale] = useState("");

  const [result, setResult] = useState<OfferResult | null>(null);
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
          priceCost: priceCost ? Number(priceCost) : undefined,
          priceSale: priceSale ? Number(priceSale) : undefined,
        }),
      });
      const productBody = await productResponse.json();
      if (!productResponse.ok) throw new Error(productBody.error ?? "Produit invalide");

      const response = await fetch("/api/offer-builder/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: productBody.product.id }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Génération impossible");
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
        <h1 className="text-2xl font-semibold tracking-tight">AI Offer Builder</h1>
        <p className="text-sm text-muted-foreground">
          Construisez l&apos;offre commerciale qui maximise vos conversions.
        </p>
      </div>

      <Card>
        <CardContent className="p-5">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ob-name">Produit</Label>
              <Input id="ob-name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Prix fournisseur</Label>
              <Input type="number" min={0} value={priceCost} onChange={(e) => setPriceCost(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Prix de vente envisagé</Label>
              <Input type="number" min={0} value={priceSale} onChange={(e) => setPriceSale(e.target.value)} />
            </div>
            <Button type="submit" isLoading={isLoading} className="w-fit sm:col-span-3">
              <PackagePlus className="h-4 w-4" /> Construire l&apos;offre
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
          icon={<PackagePlus className="h-8 w-8" />}
          title="Aucune offre générée"
          description="Renseignez votre produit pour obtenir un prix conseillé, des bonus, garanties et mécanismes d'urgence."
        />
      )}

      {result && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="animate-fade-in lg:col-span-2 border-primary/30 bg-primary/5">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs text-muted-foreground">Prix conseillé</p>
                <p className="text-2xl font-semibold text-primary">
                  {formatCurrency(result.recommendedPrice.value)}
                </p>
              </div>
              <p className="max-w-md text-sm text-muted-foreground">{result.recommendedPrice.reasoning}</p>
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardContent className="flex flex-col gap-2 p-5">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <Gift className="h-4 w-4 text-primary" /> Bonus
              </p>
              <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                {result.bonuses.map((b, i) => (
                  <li key={i}>• {b}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardContent className="flex flex-col gap-2 p-5">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <ShieldCheck className="h-4 w-4 text-success" /> Garanties
              </p>
              <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                {result.guarantees.map((g, i) => (
                  <li key={i}>• {g}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardContent className="flex flex-col gap-2 p-5">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <Clock className="h-4 w-4 text-warning" /> Urgence
              </p>
              <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                {result.urgency.map((u, i) => (
                  <li key={i}>• {u}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardContent className="flex flex-col gap-2 p-5">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <Star className="h-4 w-4 text-warning" /> Preuve sociale
              </p>
              <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                {result.socialProof.map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="animate-fade-in lg:col-span-2">
            <CardContent className="p-5">
              <p className="mb-3 text-sm font-medium">Packs suggérés</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {result.packs.map((pack, i) => (
                  <div key={i} className="rounded-md border border-border p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{pack.name}</p>
                      <Badge variant="outline">{formatCurrency(pack.suggestedPrice)}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{pack.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
