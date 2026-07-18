"use client";

import { useState } from "react";
import { MessageSquareText, AlertTriangle, Flame, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { WhatsAppAssistantResult } from "../schemas";
import type { ConversationMessage } from "../use-cases/analyze-conversation.use-case";

const STATUS_VARIANT: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  HOT: "success",
  WARM: "warning",
  HESITANT: "secondary",
  COLD: "destructive",
};

const STATUS_LABEL: Record<string, string> = {
  HOT: "Prospect chaud",
  WARM: "Prospect intéressé",
  HESITANT: "Prospect hésitant",
  COLD: "Prospect froid",
};

function parseConversation(text: string): ConversationMessage[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(client|moi|vendeur)\s*:\s*(.+)$/i);
      if (match) {
        const from = match[1]!.toLowerCase() === "client" ? "client" : "vendeur";
        return { from, text: match[2]! } as ConversationMessage;
      }
      return { from: "client", text: line } as ConversationMessage;
    });
}

export function WhatsAppAssistantApp() {
  const [contactName, setContactName] = useState("");
  const [productContext, setProductContext] = useState("");
  const [conversationText, setConversationText] = useState("");

  const [result, setResult] = useState<WhatsAppAssistantResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const messages = parseConversation(conversationText);
      const response = await fetch("/api/whatsapp-assistant/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactName: contactName || undefined,
          productContext: productContext || undefined,
          messages,
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
        <h1 className="text-2xl font-semibold tracking-tight">AI WhatsApp Sales Assistant</h1>
        <p className="text-sm text-muted-foreground">
          Convertissez plus de prospects grâce à la détection d&apos;intention et aux réponses suggérées.
        </p>
      </div>

      <Card>
        <CardContent className="p-5">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label>Nom du contact (optionnel)</Label>
                <Input value={contactName} onChange={(e) => setContactName(e.target.value)} />
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
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="wa-conversation">
                Conversation (préfixez chaque ligne par &laquo; Client : &raquo; ou &laquo; Moi : &raquo;)
              </Label>
              <Textarea
                id="wa-conversation"
                required
                rows={8}
                value={conversationText}
                onChange={(e) => setConversationText(e.target.value)}
                placeholder={"Client : Bonjour, le produit est encore disponible ?\nMoi : Oui, il reste 3 exemplaires !\nClient : C'est trop cher pour moi..."}
              />
            </div>
            <Button type="submit" isLoading={isLoading} className="w-fit">
              <MessageSquareText className="h-4 w-4" /> Analyser la conversation
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
          icon={<MessageSquareText className="h-8 w-8" />}
          title="Aucune conversation analysée"
          description="Collez une conversation WhatsApp pour classer le prospect et obtenir la meilleure réponse à envoyer."
        />
      )}

      {result && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <Card>
            <CardContent className="flex items-start gap-3 p-5">
              <Flame className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
              <div>
                <Badge variant={STATUS_VARIANT[result.prospectStatus]}>
                  {STATUS_LABEL[result.prospectStatus]}
                </Badge>
                <p className="mt-1 text-sm text-muted-foreground">{result.statusReasoning}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="flex flex-col gap-2 p-5">
                <p className="text-sm font-medium">Objections détectées</p>
                <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                  {result.detectedObjections.length === 0 && <li>Aucune objection détectée.</li>}
                  {result.detectedObjections.map((o, i) => (
                    <li key={i}>• {o}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col gap-2 p-5">
                <p className="text-sm font-medium">Signaux d&apos;intention d&apos;achat</p>
                <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                  {result.purchaseIntentSignals.length === 0 && <li>Aucun signal fort détecté.</li>}
                  {result.purchaseIntentSignals.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="flex items-start gap-3 p-5">
              <Send className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium text-primary">Réponse idéale à envoyer maintenant</p>
                <p className="mt-1 text-sm">{result.suggestedReply}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="flex flex-col gap-2 p-5">
                <p className="text-sm font-medium">Messages de relance</p>
                <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                  {result.followUpMessages.map((m, i) => (
                    <li key={i} className="rounded-md bg-muted p-2">
                      {m}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col gap-2 p-5">
                <p className="text-sm font-medium">Réponses rapides réutilisables</p>
                <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                  {result.quickReplies.map((m, i) => (
                    <li key={i} className="rounded-md bg-muted p-2">
                      {m}
                    </li>
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
