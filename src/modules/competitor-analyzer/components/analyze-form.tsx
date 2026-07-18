"use client";

import { useState } from "react";
import { ChevronDown, Link2, Tag, Store, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CompetitorInputMode, ManualAdInput } from "../types";

const MODES: { value: CompetitorInputMode; label: string; icon: typeof Link2; placeholder: string }[] = [
  { value: "AD_URL", label: "Lien publicité", icon: Link2, placeholder: "https://www.facebook.com/ads/library/?id=..." },
  { value: "PRODUCT_NAME", label: "Nom du produit", icon: Tag, placeholder: "Ex : GPS tracker moto" },
  { value: "STORE_URL", label: "Boutique concurrente", icon: Store, placeholder: "https://boutique-concurrente.com" },
  { value: "BRAND_NAME", label: "Nom de marque", icon: Building2, placeholder: "Ex : TrackerPro" },
];

export function AnalyzeForm({
  productName,
  onProductNameChange,
  onSubmit,
  isLoading,
}: {
  productName: string;
  onProductNameChange: (value: string) => void;
  onSubmit: (args: { mode: CompetitorInputMode; value?: string; manualAd?: ManualAdInput }) => void;
  isLoading: boolean;
}) {
  const [mode, setMode] = useState<CompetitorInputMode>("PRODUCT_NAME");
  const [value, setValue] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [manualAd, setManualAd] = useState<ManualAdInput>({});
  const [commentsText, setCommentsText] = useState("");

  const activeMode = MODES.find((m) => m.value === mode)!;

  function updateManual<K extends keyof ManualAdInput>(key: K, val: ManualAdInput[K]) {
    setManualAd((prev) => ({ ...prev, [key]: val }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const comments = commentsText
      .split("\n")
      .map((c) => c.trim())
      .filter(Boolean);

    onSubmit({
      mode,
      value: showManual ? undefined : value,
      manualAd: showManual ? { ...manualAd, comments: comments.length ? comments : undefined } : undefined,
    });
  }

  return (
    <Card>
      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="productName">Produit analysé</Label>
            <Input
              id="productName"
              required
              value={productName}
              onChange={(e) => onProductNameChange(e.target.value)}
              placeholder="Ex : GPS Tracker moto"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Comment voulez-vous analyser ce concurrent ?</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {MODES.map((m) => (
                <button
                  type="button"
                  key={m.value}
                  onClick={() => setMode(m.value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-md border p-3 text-xs font-medium transition-colors",
                    mode === m.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:bg-secondary",
                  )}
                >
                  <m.icon className="h-4 w-4" />
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {!showManual && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="value">{activeMode.label}</Label>
              <Input
                id="value"
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={activeMode.placeholder}
              />
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowManual((s) => !s)}
            className="flex items-center gap-1 self-start text-xs font-medium text-primary"
          >
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showManual && "rotate-180")} />
            {showManual ? "Masquer la saisie manuelle" : "Coller les données de la publicité manuellement"}
          </button>

          {showManual && (
            <div className="grid grid-cols-1 gap-3 rounded-md border border-border bg-surface-raised p-4 sm:grid-cols-2 animate-fade-in">
              <div className="flex flex-col gap-1.5">
                <Label>Nom de la page</Label>
                <Input value={manualAd.pageName ?? ""} onChange={(e) => updateManual("pageName", e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Titre / Headline</Label>
                <Input value={manualAd.headline ?? ""} onChange={(e) => updateManual("headline", e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label>Texte principal</Label>
                <Textarea
                  value={manualAd.primaryText ?? ""}
                  onChange={(e) => updateManual("primaryText", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Description</Label>
                <Input value={manualAd.description ?? ""} onChange={(e) => updateManual("description", e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>CTA</Label>
                <Input value={manualAd.cta ?? ""} onChange={(e) => updateManual("cta", e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Type de média</Label>
                <Select
                  value={manualAd.mediaType ?? "UNKNOWN"}
                  onChange={(e) => updateManual("mediaType", e.target.value as ManualAdInput["mediaType"])}
                >
                  <option value="UNKNOWN">Inconnu</option>
                  <option value="VIDEO">Vidéo</option>
                  <option value="IMAGE">Image</option>
                  <option value="CAROUSEL">Carrousel</option>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Nombre de variantes</Label>
                <Input
                  type="number"
                  min={1}
                  value={manualAd.variantsCount ?? 1}
                  onChange={(e) => updateManual("variantsCount", Number(e.target.value))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Date de début</Label>
                <Input type="date" value={manualAd.startDate ?? ""} onChange={(e) => updateManual("startDate", e.target.value)} />
              </div>
              <div className="flex items-end gap-2 pb-1.5">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={manualAd.isActive ?? true}
                    onChange={(e) => updateManual("isActive", e.target.checked)}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                  Toujours active
                </label>
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label>Commentaires clients observés (un par ligne, optionnel)</Label>
                <Textarea
                  value={commentsText}
                  onChange={(e) => setCommentsText(e.target.value)}
                  placeholder={"Est-ce disponible au Bénin ?\nTrop cher pour moi\nJe veux gagner du temps"}
                />
              </div>
            </div>
          )}

          <Button type="submit" isLoading={isLoading} className="w-fit">
            Analyser ce concurrent
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
