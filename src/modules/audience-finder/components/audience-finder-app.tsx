"use client";

import { useState } from "react";
import { Target, AlertTriangle, Users, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { CATEGORY_OPTIONS, COUNTRY_OPTIONS } from "@/lib/constants";
import type { AudienceProfileResult } from "../schemas";

export function AudienceFinderApp() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [targetCountry, setTargetCountry] = useState("BJ");

  const [result, setResult] = useState<AudienceProfileResult | null>(null);
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
        body: JSON.stringify({ name, category: category || undefined, targetCountry }),
      });
      const productBody = await productResponse.json();
      if (!productResponse.ok) throw new Error(productBody.error ?? "Produit invalide");

      const response = await fetch("/api/audience-finder/generate", {
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
        <h1 className="text-2xl font-semibold tracking-tight">AI Audience Finder</h1>
        <p className="text-sm text-muted-foreground">
          Trouvez automatiquement vos meilleures audiences Facebook Ads.
        </p>
      </div>

      <Card>
        <CardContent className="p-5">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5 sm:col-span-1">
              <Label htmlFor="af-name">Produit</Label>
              <Input id="af-name" required value={name} onChange={(e) => setName(e.target.value)} />
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
            <Button type="submit" isLoading={isLoading} className="w-fit sm:col-span-3">
              <Target className="h-4 w-4" /> Trouver mon audience
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
          icon={<Target className="h-8 w-8" />}
          title="Aucune audience générée"
          description="Renseignez un produit pour obtenir un profil client complet et des suggestions d'intérêts Facebook."
        />
      )}

      {result && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="animate-fade-in lg:col-span-2">
            <CardContent className="p-5">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <Users className="h-4 w-4 text-primary" /> Client idéal
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{result.idealClient.summary}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {result.idealClient.segments.map((s, i) => (
                  <Badge key={i} variant="outline">
                    {s}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardContent className="flex flex-col gap-2 p-5 text-sm">
              <p className="font-medium">Démographie</p>
              <p>
                <span className="text-muted-foreground">Âge : </span>
                {result.demographics.ageRange}
              </p>
              <p>
                <span className="text-muted-foreground">Genre : </span>
                {result.demographics.genderSkew}
              </p>
              <p>
                <span className="text-muted-foreground">Profession : </span>
                {result.demographics.profession}
              </p>
              <p>
                <span className="text-muted-foreground">Localisation : </span>
                {result.demographics.location}
              </p>
              <p>
                <span className="text-muted-foreground">Pouvoir d&apos;achat : </span>
                {result.demographics.purchasingPower}
              </p>
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardContent className="flex flex-col gap-2 p-5">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <Heart className="h-4 w-4 text-destructive" /> Motivations d&apos;achat
              </p>
              <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                {result.motivations.map((m, i) => (
                  <li key={i}>• {m}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="animate-fade-in lg:col-span-2">
            <CardContent className="flex flex-col gap-3 p-5">
              <p className="text-sm font-medium">Intérêts Facebook suggérés</p>
              <div className="flex flex-wrap gap-1.5">
                {result.interests.map((interest, i) => (
                  <Badge key={i}>{interest}</Badge>
                ))}
              </div>
              <p className="mt-2 text-sm font-medium">Comportements pertinents</p>
              <div className="flex flex-wrap gap-1.5">
                {result.behaviors.map((behavior, i) => (
                  <Badge key={i} variant="outline">
                    {behavior}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in border-primary/30 bg-primary/5 lg:col-span-2">
            <CardContent className="flex items-start gap-3 p-5">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <p className="text-sm text-muted-foreground">{result.lookalikeNotes}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
