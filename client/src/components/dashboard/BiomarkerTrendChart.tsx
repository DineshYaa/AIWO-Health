import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DataPoint {
  date: string;
  value: number;
}

interface BiomarkerTrendChartProps {
  title: string;
  data: DataPoint[];
  unit: string;
  optimalMin: number;
  optimalMax: number;
  referenceMin: number;
  referenceMax: number;
  color?: string;
}

export function BiomarkerTrendChart({
  title,
  data,
  unit,
  optimalMin,
  optimalMax,
  referenceMin,
  referenceMax,
  color = "hsl(var(--chart-1))",
}: BiomarkerTrendChartProps) {
  const enhancedData = data.map((point) => ({
    ...point,
    optimalRange: [optimalMin, optimalMax],
    referenceRange: [referenceMin, referenceMax],
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={enhancedData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
              <defs>
                <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={{ stroke: "hsl(var(--border))" }}
                domain={[referenceMin * 0.8, referenceMax * 1.2]}
                tickFormatter={(value) => `${value}${unit}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  padding: "12px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                formatter={(value: number) => [`${value} ${unit}`, title]}
              />
              <ReferenceLine
                y={optimalMin}
                stroke="hsl(var(--chart-2))"
                strokeDasharray="5 5"
                opacity={0.6}
              />
              <ReferenceLine
                y={optimalMax}
                stroke="hsl(var(--chart-2))"
                strokeDasharray="5 5"
                opacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="none"
                fill={`url(#gradient-${title})`}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={3}
                dot={{ fill: color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span>Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 border-t-2 border-dashed border-chart-2" />
            <span>Optimal Range</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
