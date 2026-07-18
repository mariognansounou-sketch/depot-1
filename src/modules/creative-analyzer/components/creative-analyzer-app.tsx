"use client";

import { useState } from "react";
import { Clapperboard, AlertTriangle, Upload, ThumbsUp, ThumbsDown, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScoreRing } from "@/components/ui/score-ring";
import { EmptyState } from "@/components/ui/empty-state";
import type { CreativeAnalysisResult } from "../schemas";

const PHASE_LABELS: Record<string, string> = {
  DEBUT: "Début",
  PROBLEME: "Problème",
  DEMONSTRATION: "Démonstration",
  BENEFICES: "Bénéfices",
  PREUVE: "Preuve",
  APPEL_A_ACTION: "Appel à l'action",
};

function fileToBase64(file: File): Promise<{ base64: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] ?? "";
      resolve({ base64, mediaType: file.type });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function CreativeAnalyzerApp() {
  const [sourceType, setSourceType] = useState<"IMAGE" | "VIDEO">("IMAGE");
  const [productContext, setProductContext] = useState("");
  const [manualDescription, setManualDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [result, setResult] = useState<CreativeAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const image = imageFile ? await fileToBase64(imageFile) : undefined;

      const response = await fetch("/api/creative-analyzer/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType,
          productContext: productContext || undefined,
          manualDescription: manualDescription || undefined,
          image: image
            ? { base64: image.base64, mediaType: image.mediaType }
            : undefined,
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Analyse impossible");
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
        <h1 className="text-2xl font-semibold tracking-tight">AI Creative Analyzer</h1>
        <p className="text-sm text-muted-foreground">
          Importez une image publicitaire (ou décrivez votre vidéo) pour une analyse complète.
        </p>
      </div>

      <Card>
        <CardContent className="p-5">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label>Type de créative</Label>
                <Select value={sourceType} onChange={(e) => setSourceType(e.target.value as "IMAGE" | "VIDEO")}>
                  <option value="IMAGE">Image</option>
                  <option value="VIDEO">Vidéo</option>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Contexte produit (optionnel)</Label>
                <Input
                  value={productContext}
                  onChange={(e) => setProductContext(e.target.value)}
                  placeholder="Ex : GPS tracker moto, 15000 FCFA"
                />
              </div>
            </div>

            {sourceType === "IMAGE" ? (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="creative-file">Image de la publicité</Label>
                <label
                  htmlFor="creative-file"
                  className="flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed border-border bg-surface-raised p-6 text-center text-sm text-muted-foreground hover:bg-secondary"
                >
                  {imagePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imagePreview} alt="Aperçu" className="max-h-48 rounded-md object-contain" />
                  ) : (
                    <>
                      <Upload className="h-6 w-6" />
                      Cliquez pour importer une image (JPG, PNG, WEBP)
                    </>
                  )}
                </label>
                <input
                  id="creative-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleFileChange}
                  required={sourceType === "IMAGE"}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="creative-description">
                  Description détaillée de la vidéo (l&apos;analyse vidéo native n&apos;est pas disponible —
                  décrivez le hook, les scènes, le rythme et le CTA)
                </Label>
                <Textarea
                  id="creative-description"
                  required={sourceType === "VIDEO"}
                  rows={6}
                  value={manualDescription}
                  onChange={(e) => setManualDescription(e.target.value)}
                  placeholder="0-3s : la vidéo montre... 3-15s : démonstration du produit..."
                />
                <p className="text-xs text-muted-foreground">
                  Vous pouvez aussi joindre une image (miniature ou capture d&apos;écran) en repassant sur
                  &laquo; Image &raquo; pour une analyse visuelle complémentaire.
                </p>
              </div>
            )}

            <Button type="submit" isLoading={isLoading} className="w-fit">
              <Clapperboard className="h-4 w-4" /> Analyser la créative
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
          icon={<Clapperboard className="h-8 w-8" />}
          title="Aucune créative analysée"
          description="Importez une image ou décrivez votre vidéo pour obtenir un score d'attention, une analyse visuelle et persuasive, et des pistes d'amélioration."
        />
      )}

      {result && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <ScoreRing value={result.hookAttention.score * 10} size={72} strokeWidth={6} label="hook" />
              <div>
                <p className="text-sm font-medium">Hook Attention : {result.hookAttention.score}/10</p>
                <p className="mt-1 text-sm text-muted-foreground">{result.hookAttention.reasoning}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="mb-2 text-sm font-medium">Structure</p>
              <div className="flex flex-wrap gap-2">
                {result.structure.map((seg, i) => (
                  <div key={i} className="max-w-[240px] rounded-md border border-border bg-surface-raised px-3 py-2 text-xs">
                    <span className="font-medium">{PHASE_LABELS[seg.phase] ?? seg.phase}</span>
                    <p className="mt-1 text-muted-foreground">{seg.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="flex flex-col gap-2 p-5 text-sm">
                <p className="font-medium">Analyse visuelle</p>
                <p>
                  <span className="text-muted-foreground">Qualité : </span>
                  {result.visualAnalysis.quality}
                </p>
                <p>
                  <span className="text-muted-foreground">Clarté produit : </span>
                  {result.visualAnalysis.productClarity}
                </p>
                <p>
                  <span className="text-muted-foreground">Démonstration : </span>
                  {result.visualAnalysis.demonstration}
                </p>
                <p>
                  <span className="text-muted-foreground">Présence humaine : </span>
                  {result.visualAnalysis.humanPresence}
                </p>
                <p>
                  <span className="text-muted-foreground">Émotion : </span>
                  {result.visualAnalysis.emotion}
                </p>
                <p>
                  <span className="text-muted-foreground">Avant/après : </span>
                  {result.visualAnalysis.beforeAfter}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col gap-2 p-5 text-sm">
                <p className="font-medium">Analyse persuasive</p>
                <p>
                  <span className="text-muted-foreground">Preuve sociale : </span>
                  {result.persuasionAnalysis.socialProof}
                </p>
                <p>
                  <span className="text-muted-foreground">Urgence : </span>
                  {result.persuasionAnalysis.urgency}
                </p>
                <p>
                  <span className="text-muted-foreground">Rareté : </span>
                  {result.persuasionAnalysis.scarcity}
                </p>
                <p>
                  <span className="text-muted-foreground">Garantie : </span>
                  {result.persuasionAnalysis.guarantee}
                </p>
                <p>
                  <span className="text-muted-foreground">Confiance : </span>
                  {result.persuasionAnalysis.trust}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="flex flex-col gap-2 p-5">
                <p className="flex items-center gap-1.5 text-sm font-medium">
                  <ThumbsUp className="h-4 w-4 text-success" /> Points forts
                </p>
                <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
                  {result.strengths.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col gap-2 p-5">
                <p className="flex items-center gap-1.5 text-sm font-medium">
                  <ThumbsDown className="h-4 w-4 text-destructive" /> Points faibles
                </p>
                <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
                  {result.weaknesses.map((w, i) => (
                    <li key={i}>• {w}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col gap-2 p-5">
                <p className="flex items-center gap-1.5 text-sm font-medium">
                  <Lightbulb className="h-4 w-4 text-warning" /> Améliorations
                </p>
                <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
                  {result.improvements.map((imp, i) => (
                    <li key={i}>• {imp}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
