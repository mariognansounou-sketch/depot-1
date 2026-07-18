"use client";

import { useState } from "react";
import { FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { ScriptResult } from "../schemas";

const TYPE_OPTIONS = [
  { value: "UGC", label: "UGC (face caméra)" },
  { value: "STORYTELLING", label: "Storytelling" },
  { value: "DEMO", label: "Démonstration produit" },
];
const TONE_OPTIONS = [
  { value: "EMOTIONAL", label: "Émotionnel" },
  { value: "RATIONAL", label: "Rationnel" },
  { value: "AGGRESSIVE", label: "Agressif" },
  { value: "SHORT", label: "Court" },
  { value: "LONG", label: "Long" },
];
const PLATFORM_OPTIONS = [
  { value: "FACEBOOK", label: "Facebook Ads" },
  { value: "INSTAGRAM", label: "Instagram Reels" },
  { value: "TIKTOK", label: "TikTok Ads" },
  { value: "WHATSAPP", label: "WhatsApp Status" },
];

export function ScriptGeneratorApp() {
  const [name, setName] = useState("");
  const [targetClient, setTargetClient] = useState("");
  const [angle, setAngle] = useState("");
  const [type, setType] = useState("UGC");
  const [tone, setTone] = useState("EMOTIONAL");
  const [platform, setPlatform] = useState("FACEBOOK");

  const [result, setResult] = useState<ScriptResult | null>(null);
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
        body: JSON.stringify({ name }),
      });
      const productBody = await productResponse.json();
      if (!productResponse.ok) throw new Error(productBody.error ?? "Produit invalide");

      const response = await fetch("/api/script-generator/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: productBody.product.id,
          type,
          tone,
          platform,
          targetClient: targetClient || undefined,
          angle: angle || undefined,
        }),
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
        <h1 className="text-2xl font-semibold tracking-tight">AI Script Generator</h1>
        <p className="text-sm text-muted-foreground">
          Générez des scripts vidéo publicitaires à haute conversion.
        </p>
      </div>

      <Card>
        <CardContent className="p-5">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5 sm:col-span-3">
              <Label htmlFor="sg-name">Produit</Label>
              <Input id="sg-name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Client cible (optionnel)</Label>
              <Input value={targetClient} onChange={(e) => setTargetClient(e.target.value)} placeholder="Ex : parents" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Angle marketing (optionnel)</Label>
              <Input value={angle} onChange={(e) => setAngle(e.target.value)} placeholder="Ex : protection familiale" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Plateforme</Label>
              <Select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                {PLATFORM_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Format</Label>
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Ton</Label>
              <Select value={tone} onChange={(e) => setTone(e.target.value)}>
                {TONE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>
            <Button type="submit" isLoading={isLoading} className="w-fit sm:col-span-3">
              <FileText className="h-4 w-4" /> Générer le script
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
          icon={<FileText className="h-8 w-8" />}
          title="Aucun script généré"
          description="Choisissez un format, un ton et une plateforme pour générer un script vidéo complet, minuté."
        />
      )}

      {result && (
        <Card className="animate-fade-in">
          <CardContent className="flex flex-col gap-3 p-5">
            <p className="text-base font-semibold">{result.title}</p>
            {result.segments.map((seg, i) => (
              <div key={i} className="flex gap-3 rounded-md border border-border p-3">
                <Badge variant="outline" className="h-fit shrink-0">
                  {seg.fromSeconds}-{seg.toSeconds}s
                </Badge>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">{seg.phase}</p>
                  <p className="mt-1 text-sm">{seg.content}</p>
                </div>
              </div>
            ))}
            <div className="mt-2 rounded-md bg-muted p-3 text-sm">
              <span className="font-medium">Légende suggérée : </span>
              {result.captionSuggestion}
            </div>
            {result.hashtags && result.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {result.hashtags.map((tag, i) => (
                  <Badge key={i}>#{tag.replace(/^#/, "")}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
