"use client";

import { useState } from "react";
import { MessageSquareText, AlertTriangle, HelpCircle, ShieldAlert, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { CommentAnalysisResult } from "@/modules/competitor-analyzer/schemas";

export function CommentAnalyzerApp() {
  const [label, setLabel] = useState("");
  const [commentsText, setCommentsText] = useState("");

  const [result, setResult] = useState<CommentAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const comments = commentsText
        .split("\n")
        .map((c) => c.trim())
        .filter(Boolean);

      const response = await fetch("/api/comment-analyzer/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, comments }),
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
        <h1 className="text-2xl font-semibold tracking-tight">AI Comment Analyzer</h1>
        <p className="text-sm text-muted-foreground">
          Extrayez questions, objections et motivations des commentaires sous vos publicités.
        </p>
      </div>

      <Card>
        <CardContent className="p-5">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ca-label">Source des commentaires</Label>
              <Input
                id="ca-label"
                required
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ex : Publicité concurrente GPS Tracker"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ca-comments">Commentaires (un par ligne)</Label>
              <Textarea
                id="ca-comments"
                required
                rows={8}
                value={commentsText}
                onChange={(e) => setCommentsText(e.target.value)}
                placeholder={"Est-ce disponible au Bénin ?\nTrop cher pour moi\nÇa fonctionne vraiment ?"}
              />
            </div>
            <Button type="submit" isLoading={isLoading} className="w-fit">
              <MessageSquareText className="h-4 w-4" /> Analyser les commentaires
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
          title="Aucune analyse pour l'instant"
          description="Collez des commentaires pour en extraire les questions fréquentes, objections et motivations d'achat."
        />
      )}

      {result && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="animate-fade-in">
            <CardContent className="flex flex-col gap-2 p-5">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <HelpCircle className="h-4 w-4 text-primary" /> Questions fréquentes
              </p>
              <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                {result.questions.map((q, i) => (
                  <li key={i}>• {q}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="animate-fade-in">
            <CardContent className="flex flex-col gap-2 p-5">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <ShieldAlert className="h-4 w-4 text-destructive" /> Objections
              </p>
              <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                {result.objections.map((o, i) => (
                  <li key={i}>• {o}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="animate-fade-in">
            <CardContent className="flex flex-col gap-2 p-5">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <Heart className="h-4 w-4 text-warning" /> Motivations
              </p>
              <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                {result.motivations.map((m, i) => (
                  <li key={i}>• {m}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
