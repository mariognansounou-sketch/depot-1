"use client";

import { useState } from "react";
import { PenTool, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  FacebookAdsCopy,
  ShopifyCopy,
  TikTokCopy,
  WhatsAppCopy,
} from "../schemas";
import type { CopyChannel } from "../use-cases/generate-copy.use-case";

const CHANNELS: { value: CopyChannel; label: string }[] = [
  { value: "FACEBOOK_ADS", label: "Facebook Ads" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "SHOPIFY", label: "Shopify" },
  { value: "TIKTOK", label: "TikTok" },
];

type AnyCopyResult = FacebookAdsCopy | WhatsAppCopy | ShopifyCopy | TikTokCopy;

export function CopywriterApp() {
  const [name, setName] = useState("");
  const [channel, setChannel] = useState<CopyChannel>("FACEBOOK_ADS");

  const [result, setResult] = useState<AnyCopyResult | null>(null);
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

      const response = await fetch("/api/copywriter/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: productBody.product.id, channel }),
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
        <h1 className="text-2xl font-semibold tracking-tight">AI Copywriter E-commerce</h1>
        <p className="text-sm text-muted-foreground">
          Générez automatiquement tous les textes nécessaires pour vendre.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-5">
          <Tabs value={channel} onValueChange={(v) => setChannel(v as CopyChannel)}>
            <TabsList>
              {CHANNELS.map((c) => (
                <TabsTrigger key={c.value} value={c.value}>
                  {c.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="cw-name">Produit</Label>
              <Input id="cw-name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <Button type="submit" isLoading={isLoading}>
              <PenTool className="h-4 w-4" /> Générer les textes
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
          icon={<PenTool className="h-8 w-8" />}
          title="Aucun texte généré"
          description="Choisissez un canal et renseignez votre produit pour générer les textes prêts à l'emploi."
        />
      )}

      {result && channel === "FACEBOOK_ADS" && <FacebookView copy={result as FacebookAdsCopy} />}
      {result && channel === "WHATSAPP" && <WhatsAppView copy={result as WhatsAppCopy} />}
      {result && channel === "SHOPIFY" && <ShopifyView copy={result as ShopifyCopy} />}
      {result && channel === "TIKTOK" && <TikTokView copy={result as TikTokCopy} />}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 whitespace-pre-wrap rounded-md bg-muted p-2.5 text-sm">{value}</p>
    </div>
  );
}

function FacebookView({ copy }: { copy: FacebookAdsCopy }) {
  return (
    <Card className="animate-fade-in">
      <CardContent className="flex flex-col gap-3 p-5">
        <Field label="Titre (Headline)" value={copy.headline} />
        <Field label="Texte principal" value={copy.primaryText} />
        <Field label="Description" value={copy.description} />
        <Field label="CTA" value={copy.cta} />
      </CardContent>
    </Card>
  );
}

function WhatsAppView({ copy }: { copy: WhatsAppCopy }) {
  return (
    <Card className="animate-fade-in">
      <CardContent className="flex flex-col gap-4 p-5">
        <Field label="Message d'accueil" value={copy.welcomeMessage} />
        <ListField label="Réponses automatiques" items={copy.autoReplies} />
        <ListField label="Messages de relance" items={copy.followUpMessages} />
        <ListField label="Messages de fermeture" items={copy.closingMessages} />
      </CardContent>
    </Card>
  );
}

function ShopifyView({ copy }: { copy: ShopifyCopy }) {
  return (
    <Card className="animate-fade-in">
      <CardContent className="flex flex-col gap-4 p-5">
        <Field label="Titre produit" value={copy.productTitle} />
        <Field label="Description" value={copy.description} />
        <ListField label="Bénéfices" items={copy.benefits} />
        <div>
          <p className="text-xs font-medium text-muted-foreground">FAQ</p>
          <div className="mt-1 flex flex-col gap-2">
            {copy.faq.map((f, i) => (
              <div key={i} className="rounded-md bg-muted p-2.5 text-sm">
                <p className="font-medium">{f.question}</p>
                <p className="text-muted-foreground">{f.answer}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Objections</p>
          <div className="mt-1 flex flex-col gap-2">
            {copy.objections.map((o, i) => (
              <div key={i} className="rounded-md bg-muted p-2.5 text-sm">
                <p className="font-medium">{o.objection}</p>
                <p className="text-muted-foreground">{o.response}</p>
              </div>
            ))}
          </div>
        </div>
        <ListField label="Garanties" items={copy.guarantees} />
      </CardContent>
    </Card>
  );
}

function TikTokView({ copy }: { copy: TikTokCopy }) {
  return (
    <Card className="animate-fade-in">
      <CardContent className="flex flex-col gap-3 p-5">
        <Field label="Hook" value={copy.hook} />
        <Field label="Description courte" value={copy.shortDescription} />
        <div className="flex flex-wrap gap-1.5">
          {copy.hashtags.map((tag, i) => (
            <Badge key={i}>#{tag.replace(/^#/, "")}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ListField({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <ul className="mt-1 flex flex-col gap-1 text-sm text-muted-foreground">
        {items.map((item, i) => (
          <li key={i}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
