import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function ComingSoon({
  icon: Icon,
  title,
  moduleLabel,
  description,
  roadmap,
}: {
  icon: LucideIcon;
  title: string;
  moduleLabel: string;
  description: string;
  roadmap: string[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <Badge variant="secondary">Bientôt disponible</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-medium">{moduleLabel}</p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              L&apos;architecture (modèles de données, contrats d&apos;API) est déjà en place pour ce
              module — l&apos;interface et le moteur IA arrivent dans une prochaine itération.
            </p>
          </div>
          <ul className="mt-2 flex flex-col gap-1.5 text-left text-xs text-muted-foreground">
            {roadmap.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
