import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  FunnelChart,
  Funnel,
  LabelList,
  Area,
  AreaChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Eye, Activity, Clock, Database, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface PageViewTrendData {
  date: string;
  views: number;
  uniqueVisitors: number;
}

interface TopPageData {
  path: string;
  views: number;
  uniqueVisitors: number;
}

interface FunnelStage {
  stage: string;
  label: string;
  count: number;
  percentage: number;
}

interface HeatmapData {
  day: string;
  hour: number;
  value: number;
}

interface RetentionSettings {
  pageViewsRetentionDays: number;
  eventsRetentionDays: number;
  systemMetricsRetentionDays: number;
  lastCleanup: string;
  totalEventsCount: number;
}

export function PageViewTrendsChart({ 
  data, 
  isLoading 
}: { 
  data: PageViewTrendData[]; 
  isLoading: boolean;
}) {
  const safeData = data || [];
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Page View Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          Page View Trends
        </CardTitle>
        <CardDescription>Daily page views and unique visitors over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={safeData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <defs>
                <linearGradient id="pageViewGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="visitorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(172, 66%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(172, 66%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickFormatter={(value) => {
                  if (!value) return '';
                  try {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  } catch {
                    return '';
                  }
                }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  padding: "12px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                formatter={(value: number, name: string) => [
                  value,
                  name === 'views' ? 'Page Views' : 'Unique Visitors'
                ]}
              />
              <Area
                type="monotone"
                dataKey="views"
                stroke="hsl(160, 84%, 39%)"
                fill="url(#pageViewGradient)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="uniqueVisitors"
                stroke="hsl(172, 66%, 50%)"
                strokeWidth={2}
                dot={{ fill: "hsl(172, 66%, 50%)", strokeWidth: 2, r: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(160, 84%, 39%)" }} />
            <span>Page Views</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(172, 66%, 50%)" }} />
            <span>Unique Visitors</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TopPagesChart({ 
  data, 
  isLoading 
}: { 
  data: TopPageData[]; 
  isLoading: boolean;
}) {
  const safeData = data || [];
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Eye className="w-5 h-5 text-emerald-500" />
            Top Pages by Views
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const COLORS = [
    "hsl(160, 84%, 39%)",
    "hsl(160, 70%, 45%)",
    "hsl(160, 60%, 50%)",
    "hsl(172, 66%, 50%)",
    "hsl(172, 60%, 55%)",
    "hsl(180, 55%, 50%)",
    "hsl(180, 50%, 55%)",
    "hsl(188, 45%, 55%)",
    "hsl(188, 40%, 60%)",
    "hsl(196, 35%, 60%)",
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Eye className="w-5 h-5 text-emerald-500" />
          Top Pages by Views
        </CardTitle>
        <CardDescription>Most visited pages in the selected period</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={safeData} 
              layout="vertical"
              margin={{ top: 10, right: 20, left: 80, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis
                type="number"
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis
                type="category"
                dataKey="path"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={{ stroke: "hsl(var(--border))" }}
                width={75}
                tickFormatter={(value) => value && value.length > 12 ? `${value.slice(0, 12)}...` : (value || '')}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  padding: "12px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                formatter={(value: number, name: string) => [
                  value,
                  name === 'views' ? 'Views' : 'Unique'
                ]}
              />
              <Bar dataKey="views" radius={[0, 4, 4, 0]}>
                {safeData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function ConversionFunnelChart({ 
  data, 
  isLoading 
}: { 
  data: FunnelStage[]; 
  isLoading: boolean;
}) {
  const safeData = data || [];
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-500" />
            Conversion Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-500" />
          Conversion Funnel
        </CardTitle>
        <CardDescription>User journey from landing to payment</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {safeData.map((stage, index) => {
            const widthPercentage = Math.max(stage.percentage, 5);
            const bgColor = `hsl(${160 + index * 5}, ${84 - index * 6}%, ${39 + index * 3}%)`;
            
            return (
              <div key={stage.stage} className="relative" data-testid={`funnel-stage-${stage.stage}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{stage.label}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {stage.count.toLocaleString()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{stage.percentage}%</span>
                  </div>
                </div>
                <div className="relative h-8 bg-muted rounded-md overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-md transition-all duration-500"
                    style={{ 
                      width: `${widthPercentage}%`,
                      backgroundColor: bgColor
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function ActivityHeatmap({ 
  data, 
  isLoading 
}: { 
  data: HeatmapData[]; 
  isLoading: boolean;
}) {
  const safeData = data || [];
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-500" />
            User Activity Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  const maxValue = Math.max(...safeData.map(d => d.value), 1);

  const getColor = (value: number) => {
    if (value === 0) return "hsl(var(--muted))";
    const intensity = value / maxValue;
    if (intensity < 0.25) return "hsl(160, 84%, 85%)";
    if (intensity < 0.5) return "hsl(160, 84%, 65%)";
    if (intensity < 0.75) return "hsl(160, 84%, 49%)";
    return "hsl(160, 84%, 39%)";
  };

  const getValue = (day: string, hour: number) => {
    const item = safeData.find(d => d.day === day && d.hour === hour);
    return item?.value || 0;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-500" />
          User Activity Heatmap
        </CardTitle>
        <CardDescription>Activity patterns by day and hour</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="flex items-center mb-2">
              <div className="w-12" />
              {hours.filter((_, i) => i % 3 === 0).map(hour => (
                <div 
                  key={hour} 
                  className="flex-1 text-center text-xs text-muted-foreground"
                  style={{ minWidth: `${100/24*3}%` }}
                >
                  {hour}:00
                </div>
              ))}
            </div>
            {days.map(day => (
              <div key={day} className="flex items-center mb-1">
                <div className="w-12 text-xs text-muted-foreground font-medium pr-2">{day}</div>
                <div className="flex-1 flex gap-0.5">
                  {hours.map(hour => {
                    const value = getValue(day, hour);
                    return (
                      <div
                        key={`${day}-${hour}`}
                        className="flex-1 h-5 rounded-sm transition-colors cursor-pointer hover:ring-1 hover:ring-foreground/20"
                        style={{ backgroundColor: getColor(value) }}
                        title={`${day} ${hour}:00 - ${value} events`}
                        data-testid={`heatmap-cell-${day}-${hour}`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: "hsl(var(--muted))" }} />
              <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: "hsl(160, 84%, 85%)" }} />
              <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: "hsl(160, 84%, 65%)" }} />
              <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: "hsl(160, 84%, 49%)" }} />
              <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: "hsl(160, 84%, 39%)" }} />
              <span>More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function RealTimeActiveUsersCard({ 
  count, 
  isLoading,
  onRefresh 
}: { 
  count: number; 
  isLoading: boolean;
  onRefresh?: () => void;
}) {
  return (
    <Card className="hover-elevate">
      <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
        <CardTitle className="text-sm font-medium">Active Users Now</CardTitle>
        <Users className="w-4 h-4 text-emerald-500" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold" data-testid="text-active-users-count">
              {count}
            </div>
            <div className="flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs text-muted-foreground">Live</span>
            </div>
          </div>
        )}
        {onRefresh && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-2 text-xs"
            onClick={onRefresh}
            data-testid="button-refresh-active-users"
          >
            Refresh
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function DataRetentionSettings({ 
  settings, 
  isLoading,
  onCleanup 
}: { 
  settings: RetentionSettings | null; 
  isLoading: boolean;
  onCleanup?: (retentionDays: number) => void;
}) {
  const [retentionDays, setRetentionDays] = useState(90);

  if (isLoading || !settings) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-500" />
            Data Retention Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-500" />
          Data Retention Settings
        </CardTitle>
        <CardDescription>Configure how long analytics data is stored</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-3 border rounded-lg">
            <div className="text-sm text-muted-foreground">Page Views Retention</div>
            <div className="text-xl font-semibold" data-testid="text-page-views-retention">
              {settings.pageViewsRetentionDays} days
            </div>
          </div>
          <div className="p-3 border rounded-lg">
            <div className="text-sm text-muted-foreground">Events Retention</div>
            <div className="text-xl font-semibold" data-testid="text-events-retention">
              {settings.eventsRetentionDays} days
            </div>
          </div>
          <div className="p-3 border rounded-lg">
            <div className="text-sm text-muted-foreground">Total Events</div>
            <div className="text-xl font-semibold" data-testid="text-total-events">
              {settings.totalEventsCount.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Last cleanup: {new Date(settings.lastCleanup).toLocaleDateString()}
            </span>
          </div>
        </div>

        {onCleanup && (
          <div className="flex items-end gap-4 p-4 border rounded-lg">
            <div className="flex-1">
              <Label htmlFor="retention-days" className="text-sm">Delete events older than</Label>
              <Input
                id="retention-days"
                type="number"
                value={retentionDays}
                onChange={(e) => setRetentionDays(parseInt(e.target.value) || 90)}
                min={7}
                max={365}
                className="mt-1"
                data-testid="input-retention-days"
              />
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => onCleanup(retentionDays)}
              data-testid="button-cleanup-data"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clean Up Data
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AnalyticsOverviewCards({
  totalPageViews,
  uniqueVisitors,
  totalSessions,
  avgPagesPerSession,
  isLoading,
}: {
  totalPageViews: number;
  uniqueVisitors: number;
  totalSessions: number;
  avgPagesPerSession: number;
  isLoading: boolean;
}) {
  const cards = [
    { label: "Total Page Views", value: totalPageViews, icon: Eye, testId: "text-total-page-views" },
    { label: "Unique Visitors", value: uniqueVisitors, icon: Users, testId: "text-unique-visitors" },
    { label: "Total Sessions", value: totalSessions, icon: Activity, testId: "text-total-sessions" },
    { label: "Avg Pages/Session", value: avgPagesPerSession.toFixed(1), icon: TrendingUp, testId: "text-avg-pages-per-session" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
            <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
            <card.icon className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold" data-testid={card.testId}>
                {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
