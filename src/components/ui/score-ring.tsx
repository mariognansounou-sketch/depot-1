import { cn } from "@/lib/utils";

/**
 * Circular score indicator used across every scoring module (Winner Score,
 * Product Validator, Market Opportunity, Ad Performance...).
 */
export function ScoreRing({
  value,
  max = 100,
  size = 72,
  strokeWidth = 6,
  label,
  className,
}: {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.min(Math.max(value / max, 0), 1);
  const offset = circumference * (1 - ratio);

  const colorClass =
    ratio >= 0.75 ? "text-success" : ratio >= 0.5 ? "text-warning" : "text-destructive";

  return (
    <div className={cn("relative inline-flex flex-col items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="fill-none stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn("fill-none transition-all duration-700 ease-out", colorClass)}
          stroke="currentColor"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-lg font-semibold leading-none">{Math.round(value)}</span>
        {label && <span className="mt-0.5 text-[10px] text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}
