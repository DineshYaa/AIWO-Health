import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  color?: "primary" | "chart-1" | "chart-2" | "chart-3" | "chart-4" | "destructive";
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = "primary",
}: MetricCardProps) {
  const colorMap = {
    primary: "bg-primary/10 text-primary",
    "chart-1": "bg-chart-1/10 text-chart-1",
    "chart-2": "bg-chart-2/10 text-chart-2",
    "chart-3": "bg-chart-3/10 text-chart-3",
    "chart-4": "bg-chart-4/10 text-chart-4",
    destructive: "bg-destructive/10 text-destructive",
  };

  const trendColors = {
    up: "text-chart-2",
    down: "text-destructive",
    stable: "text-muted-foreground",
  };

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <Card className="hover-elevate transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold" data-testid={`text-metric-${title.toLowerCase().replace(/\s+/g, '-')}`}>
                {value}
              </span>
              {subtitle && (
                <span className="text-sm text-muted-foreground">{subtitle}</span>
              )}
            </div>
            {trend && trendValue && (
              <div className={`mt-2 flex items-center gap-1 text-sm ${trendColors[trend]}`}>
                <TrendIcon className="w-4 h-4" />
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${colorMap[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
