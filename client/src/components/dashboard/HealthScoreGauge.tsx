import { useMemo } from "react";

interface HealthScoreGaugeProps {
  score: number;
  biologicalAge: number;
  chronologicalAge: number;
}

export function HealthScoreGauge({ score, biologicalAge, chronologicalAge }: HealthScoreGaugeProps) {
  const ageDifference = chronologicalAge - biologicalAge;
  
  const { color, label } = useMemo(() => {
    if (score >= 85) return { color: "hsl(var(--chart-2))", label: "Excellent" };
    if (score >= 70) return { color: "hsl(var(--chart-1))", label: "Good" };
    if (score >= 55) return { color: "hsl(var(--chart-4))", label: "Fair" };
    return { color: "hsl(var(--destructive))", label: "Needs Attention" };
  }, [score]);

  const radius = 70;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth / 2;
  const arcLength = Math.PI * normalizedRadius;
  const strokeDashoffset = arcLength - (score / 100) * arcLength;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-44 h-24">
        <svg 
          className="w-full h-full" 
          viewBox="0 0 160 90"
          overflow="visible"
        >
          <path
            d={`M ${strokeWidth / 2} 80 A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${160 - strokeWidth / 2} 80`}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <path
            d={`M ${strokeWidth / 2} 80 A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${160 - strokeWidth / 2} 80`}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-0">
          <span className="text-5xl font-bold" style={{ color }} data-testid="text-health-score">
            {score}
          </span>
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
      </div>
      
      <div className="mt-2 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl font-semibold" data-testid="text-biological-age">{biologicalAge}</span>
          <span className="text-muted-foreground">biological age</span>
        </div>
        <div className="mt-1 flex items-center justify-center gap-1">
          <span className="text-sm text-muted-foreground">vs. {chronologicalAge} chronological</span>
          {ageDifference > 0 && (
            <span className="text-sm font-medium text-chart-2" data-testid="text-age-difference">
              ({ageDifference} years younger)
            </span>
          )}
          {ageDifference < 0 && (
            <span className="text-sm font-medium text-destructive" data-testid="text-age-difference">
              ({Math.abs(ageDifference)} years older)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
