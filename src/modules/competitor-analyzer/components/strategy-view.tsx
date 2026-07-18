import { ArrowRight, FileText, MessageSquareQuote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { StrategyResult } from "../schemas";

export function StrategyView({ strategy }: { strategy: StrategyResult }) {
  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nouveau positionnement</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center">
          <span className="rounded-md bg-muted px-3 py-2 text-muted-foreground line-through">
            {strategy.positioning.old}
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
          <span className="rounded-md bg-primary/10 px-3 py-2 font-medium text-primary">
            {strategy.positioning.new}
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nouveaux hooks</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {strategy.hooks.map((hook, i) => (
            <div key={i} className="flex items-start gap-2 rounded-md border border-border p-3 text-sm">
              <MessageSquareQuote className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {hook}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" /> Script vidéo — {strategy.videoScript.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {strategy.videoScript.segments.map((segment, i) => (
            <div key={i} className="flex gap-3 rounded-md border border-border p-3">
              <Badge variant="outline" className="h-fit shrink-0">
                {segment.fromSeconds}-{segment.toSeconds}s
              </Badge>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">{segment.phase}</p>
                <p className="mt-1 text-sm">{segment.voiceover}</p>
                <p className="mt-1 text-xs italic text-muted-foreground">🎬 {segment.visualDirection}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Texte publicitaire</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <Field label="Headline" value={strategy.adCopy.headline} />
          <Field label="Texte principal" value={strategy.adCopy.primaryText} />
          <Field label="Description" value={strategy.adCopy.description} />
          <Field label="CTA" value={strategy.adCopy.cta} />
        </CardContent>
      </Card>

      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4 text-sm">
          <span className="font-medium">Pourquoi ça devrait mieux marcher : </span>
          {strategy.rationale}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 whitespace-pre-wrap rounded-md bg-muted p-2.5">{value}</p>
    </div>
  );
}
