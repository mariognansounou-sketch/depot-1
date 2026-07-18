"use client";

import { useState } from "react";
import { ChevronDown, Zap, Heart, Users, ThumbsUp, ThumbsDown, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/ui/score-ring";
import { cn } from "@/lib/utils";
import type { AnalyzedAd } from "../use-cases/analyze-competitor.use-case";

const PHASE_LABELS: Record<string, string> = {
  INTRODUCTION: "Introduction",
  PROBLEME: "Problème",
  AGITATION: "Agitation",
  PRESENTATION_PRODUIT: "Présentation produit",
  DEMONSTRATION: "Démonstration",
  PREUVE: "Preuve",
  BENEFICES: "Bénéfices",
  APPEL_A_ACTION: "Appel à l'action",
};

export function AnalyzedAdCard({
  item,
  selected,
  onToggleSelect,
}: {
  item: AnalyzedAd;
  selected: boolean;
  onToggleSelect: (adId: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const { analysis } = item;

  return (
    <Card className={cn("animate-fade-in", selected && "ring-2 ring-primary")}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelect(item.adId)}
              className="mt-1 h-4 w-4 rounded border-border accent-primary"
              aria-label="Sélectionner pour la stratégie / le comparatif"
            />
            <div>
              <p className="font-semibold leading-tight">{item.competitorLabel}</p>
              <p className="text-xs text-muted-foreground">{item.ad.headline || "Sans titre"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ScoreRing value={analysis.performanceScore} size={52} strokeWidth={5} label="/100" />
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="rounded-md p-1.5 hover:bg-secondary"
              aria-label="Déplier"
            >
              <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
            </button>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 flex flex-col gap-4 border-t border-border pt-4">
            <div className="grid grid-cols-5 gap-2 text-center">
              {Object.entries(analysis.scoreBreakdown).map(([key, val]) => (
                <div key={key} className="rounded-md bg-muted p-2">
                  <p className="text-sm font-semibold">{val}/20</p>
                  <p className="text-[10px] capitalize text-muted-foreground">{key}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <Zap className="h-3.5 w-3.5 text-primary" /> Hook ({analysis.hook.score}/10)
              </p>
              <p className="mt-1 text-sm text-muted-foreground">&laquo;{analysis.hook.text}&raquo;</p>
              <p className="mt-1 text-xs text-muted-foreground">{analysis.hook.reasoning}</p>
            </div>

            <div>
              <p className="text-sm font-medium">Structure de la publicité</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {analysis.structure.map((seg, i) => (
                  <div key={i} className="rounded-md border border-border bg-surface-raised px-2.5 py-1.5 text-xs">
                    <span className="font-medium">{PHASE_LABELS[seg.label] ?? seg.label}</span>
                    {seg.fromSeconds !== null && seg.toSeconds !== null && (
                      <span className="ml-1 text-muted-foreground">
                        ({seg.fromSeconds}-{seg.toSeconds}s)
                      </span>
                    )}
                    <p className="mt-0.5 max-w-[220px] text-muted-foreground">{seg.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium">Angle marketing</p>
                <Badge className="mt-1">{analysis.angle.name}</Badge>
                <p className="mt-1 text-xs text-muted-foreground">{analysis.angle.explanation}</p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-sm font-medium">
                  <Heart className="h-3.5 w-3.5 text-destructive" /> Émotion dominante
                </p>
                <Badge variant="outline" className="mt-1">
                  {analysis.emotion.primary}
                </Badge>
                <p className="mt-1 text-xs text-muted-foreground">{analysis.emotion.reasoning}</p>
              </div>
            </div>

            <div>
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <Users className="h-3.5 w-3.5 text-primary" /> Client cible
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{analysis.targetAudience.profile}</p>
              <p className="text-xs text-muted-foreground">
                {analysis.targetAudience.demographics} — problème principal :{" "}
                {analysis.targetAudience.mainProblem}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ListBlock icon={<ThumbsUp className="h-3.5 w-3.5 text-success" />} title="Forces" items={analysis.strengths} />
              <ListBlock
                icon={<ThumbsDown className="h-3.5 w-3.5 text-destructive" />}
                title="Faiblesses"
                items={analysis.weaknesses}
              />
              <ListBlock
                icon={<Lightbulb className="h-3.5 w-3.5 text-warning" />}
                title="Améliorations"
                items={analysis.improvements}
              />
            </div>

            {item.comments && (
              <div className="grid grid-cols-1 gap-4 rounded-md bg-muted p-3 sm:grid-cols-3">
                <ListBlock title="Questions clients" items={item.comments.questions} />
                <ListBlock title="Objections" items={item.comments.objections} />
                <ListBlock title="Motivations" items={item.comments.motivations} />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ListBlock({ icon, title, items }: { icon?: React.ReactNode; title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-medium">
        {icon}
        {title}
      </p>
      <ul className="mt-1 flex flex-col gap-0.5 text-xs text-muted-foreground">
        {items.map((item, i) => (
          <li key={i}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
