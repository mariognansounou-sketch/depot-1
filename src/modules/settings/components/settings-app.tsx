"use client";

import { useEffect, useState } from "react";
import { KeyRound, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { COUNTRY_OPTIONS } from "@/lib/constants";

interface ApiKeyItem {
  id: string;
  provider: "META" | "ANTHROPIC" | "OPENAI" | "TIKTOK";
  label: string | null;
  createdAt: string;
}

const PROVIDER_LABELS: Record<ApiKeyItem["provider"], string> = {
  META: "Meta Ad Library API",
  ANTHROPIC: "Anthropic (Claude)",
  OPENAI: "OpenAI",
  TIKTOK: "TikTok Ads",
};

export function SettingsApp() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [provider, setProvider] = useState<ApiKeyItem["provider"]>("META");
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [defaultCountry, setDefaultCountry] = useState("BJ");
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  useEffect(() => {
    fetch("/api/settings/api-keys")
      .then((r) => r.json())
      .then((body) => setKeys(body.keys ?? []));
    fetch("/api/settings")
      .then((r) => r.json())
      .then((body) => setDefaultCountry(body.settings?.defaultCountry ?? "BJ"));
  }, []);

  async function handleAddKey(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    const response = await fetch("/api/settings/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, label: label || undefined, value }),
    });
    setIsSaving(false);
    if (response.ok) {
      const body = await response.json();
      setKeys((prev) => [body.key, ...prev]);
      setValue("");
      setLabel("");
    }
  }

  async function handleDeleteKey(id: string) {
    setKeys((prev) => prev.filter((k) => k.id !== id));
    await fetch(`/api/settings/api-keys/${id}`, { method: "DELETE" });
  }

  async function handleSavePrefs() {
    setIsSavingPrefs(true);
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ defaultCountry }),
    });
    setIsSavingPrefs(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Paramètres</h1>
        <p className="text-sm text-muted-foreground">Clés API, préférences et sécurité de votre compte.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-4 w-4" /> Clés API
          </CardTitle>
          <CardDescription>
            Chiffrées avec AES-256-GCM avant stockage. Requises pour activer la recherche Meta Ad Library
            en temps réel.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form onSubmit={handleAddKey} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <Select value={provider} onChange={(e) => setProvider(e.target.value as ApiKeyItem["provider"])}>
              {Object.entries(PROVIDER_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Input placeholder="Label (optionnel)" value={label} onChange={(e) => setLabel(e.target.value)} />
            <Input
              placeholder="Valeur de la clé"
              type="password"
              required
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="sm:col-span-1"
            />
            <Button type="submit" isLoading={isSaving}>
              <Plus className="h-4 w-4" /> Ajouter
            </Button>
          </form>

          <div className="flex flex-col divide-y divide-border">
            {keys.length === 0 && <p className="py-4 text-sm text-muted-foreground">Aucune clé enregistrée.</p>}
            {keys.map((key) => (
              <div key={key.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">
                    {PROVIDER_LABELS[key.provider]} {key.label && `— ${key.label}`}
                  </p>
                  <Badge variant="outline" className="mt-1">
                    Ajoutée le {new Date(key.createdAt).toLocaleDateString("fr-FR")}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteKey(key.id)} aria-label="Supprimer">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Préférences</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 sm:w-64">
            <Label>Pays par défaut</Label>
            <Select value={defaultCountry} onChange={(e) => setDefaultCountry(e.target.value)}>
              {COUNTRY_OPTIONS.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>
          <Button onClick={handleSavePrefs} isLoading={isSavingPrefs} className="w-fit">
            Enregistrer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
