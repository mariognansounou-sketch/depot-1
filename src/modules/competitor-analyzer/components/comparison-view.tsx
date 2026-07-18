import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { CompetitorComparisonResult } from "../schemas";

export function ComparisonView({ comparison }: { comparison: CompetitorComparisonResult }) {
  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Concurrent</th>
                <th className="px-4 py-3">Angle principal</th>
                <th className="px-4 py-3">Force</th>
                <th className="px-4 py-3">Faiblesse</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {comparison.rows.map((row, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 font-medium">{row.competitorLabel}</td>
                  <td className="px-4 py-3">{row.mainAngle}</td>
                  <td className="px-4 py-3 text-success">{row.strength}</td>
                  <td className="px-4 py-3 text-destructive">{row.weakness}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex items-start gap-3 p-5">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold text-primary">
              Opportunité inexploitée : {comparison.opportunityAngle.name}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{comparison.opportunityAngle.reasoning}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
