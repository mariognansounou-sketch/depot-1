"use client";

import { useState } from "react";
import { Search, Sparkles, TrendingUp, Globe2, Layers, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ScoreRing } from "@/components/ui/score-ring";
import { COUNTRY_OPTIONS, CATEGORY_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { WinnerCandidate } from "../types";

export function WinnerFinderApp() {
  const [query, setQuery] = useState("");
  const [countries, setCountries] = useState<string[]>(["BJ"]);
  const [category, setCategory] = useState("");
  const [minDurationDays, setMinDurationDays] = useState(0);
  const [codCompatible, setCodCompatible] = useState(false);
  const [physicalOnly, setPhysicalOnly] = useState(true);

  const [results, setResults] = useState<WinnerCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);

  function toggleCountry(code: string) {
    setCountries((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const response = await fetch("/api/winner-finder/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        countries,
        category: category || undefined,
        minDurationDays: minDurationDays || undefined,
        physicalProductOnly: physicalOnly,
        codCompatible,
      }),
    });

    const body = await response.json();
    setIsLoading(false);

    if (!response.ok) {
      setError({ message: body.error ?? "Une erreur est survenue.", code: body.code });
      setResults([]);
      return;
    }

    setResults(body.results ?? []);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Winner Finder</h1>
        <p className="text-sm text-muted-foreground">
          Recherchez des produits gagnants encore diffusés sur la Meta Ad Library.
        </p>
      </div>

      <Card>
        <CardContent className="p-5">
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="query">Produit, mot-clé ou page</Label>
              <Input
                id="query"
                required
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex : GPS tracker, débroussailleuse électrique..."
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <Label>Catégorie</Label>
                <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">Toutes catégories</option>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="minDuration">Durée de diffusion min. (jours)</Label>
                <Input
                  id="minDuration"
                  type="number"
                  min={0}
                  value={minDurationDays}
                  onChange={(e) => setMinDurationDays(Number(e.target.value))}
                />
              </div>
              <div className="flex flex-col justify-end gap-2 pb-0.5">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={physicalOnly}
                    onChange={(e) => setPhysicalOnly(e.target.checked)}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                  Produit physique uniquement
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={codCompatible}
                    onChange={(e) => setCodCompatible(e.target.checked)}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                  Compatible paiement à la livraison
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Pays cibles</Label>
              <div className="flex flex-wrap gap-2">
                {COUNTRY_OPTIONS.map((c) => (
                  <button
                    type="button"
                    key={c.code}
                    onClick={() => toggleCountry(c.code)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      countries.includes(c.code)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-secondary",
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" isLoading={isLoading} className="w-fit">
              <Search className="h-4 w-4" /> Rechercher des produits gagnants
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="flex items-start gap-3 p-5">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            <div>
              <p className="text-sm font-medium">Recherche indisponible</p>
              <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
              {error.code === "META_AD_LIBRARY_NOT_CONFIGURED" && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Alternative : ajoutez vos concurrents manuellement depuis le module{" "}
                  <span className="font-medium text-foreground">Competitor Analyzer</span> en attendant
                  la configuration de l&apos;accès API.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!error && results.length === 0 && !isLoading && (
        <EmptyState
          icon={<Sparkles className="h-8 w-8" />}
          title="Aucun résultat pour l'instant"
          description="Lancez une recherche pour découvrir des produits gagnants encore actifs, avec plusieurs variantes ou diffusés dans plusieurs pays."
        />
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map((candidate, index) => (
            <Card key={`${candidate.productName}-${index}`} className="animate-fade-in">
              <CardContent className="flex flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold leading-tight">{candidate.productName}</p>
                    {candidate.pageName && (
                      <p className="text-xs text-muted-foreground">{candidate.pageName}</p>
                    )}
                  </div>
                  <ScoreRing value={candidate.scores.winnerScore} size={56} strokeWidth={5} label="score" />
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {candidate.isActive && <Badge variant="success">Active</Badge>}
                  <Badge variant="outline">
                    <TrendingUp className="mr-1 h-3 w-3" /> {candidate.durationDays}j de diffusion
                  </Badge>
                  <Badge variant="outline">
                    <Layers className="mr-1 h-3 w-3" /> {candidate.variantsCount} variante(s)
                  </Badge>
                  <Badge variant="outline">
                    <Globe2 className="mr-1 h-3 w-3" /> {candidate.countries.length || 1} pays
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 border-y border-border py-3 text-center">
                  <div>
                    <p className="text-sm font-semibold">{candidate.scores.opportunity}</p>
                    <p className="text-[10px] text-muted-foreground">Opportunité</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{candidate.scores.competitionLevel}</p>
                    <p className="text-[10px] text-muted-foreground">Concurrence</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{candidate.scores.launchPotential}</p>
                    <p className="text-[10px] text-muted-foreground">Potentiel</p>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-muted-foreground">{candidate.reasoning}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
