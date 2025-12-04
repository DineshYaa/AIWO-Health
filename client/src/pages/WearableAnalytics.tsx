import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Heart,
  Activity,
  Moon,
  Droplets,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Watch,
  Zap,
  Brain,
  Footprints,
  ThermometerSun,
  CheckCircle2,
  XCircle,
  Bell,
  ChevronRight,
} from "lucide-react";
import { SiApple, SiFitbit, SiGarmin } from "react-icons/si";
import type { WearableConnection, WearableData, WearableAlert, WearableAnalytics as WearableAnalyticsType } from "@shared/schema";

const deviceIcons: Record<string, any> = {
  oura: Watch,
  whoop: Activity,
  apple_health: SiApple,
  fitbit: SiFitbit,
  garmin: SiGarmin,
  cgm: ThermometerSun,
};

const deviceNames: Record<string, string> = {
  oura: "Oura Ring",
  whoop: "WHOOP",
  apple_health: "Apple Health",
  fitbit: "Fitbit",
  garmin: "Garmin",
  cgm: "Continuous Glucose Monitor",
};

const metricConfig: Record<string, { label: string; icon: any; color: string; unit: string }> = {
  heart_rate: { label: "Heart Rate", icon: Heart, color: "#ef4444", unit: "bpm" },
  heart_rate_variability: { label: "HRV", icon: Activity, color: "#8b5cf6", unit: "ms" },
  resting_heart_rate: { label: "Resting HR", icon: Heart, color: "#f97316", unit: "bpm" },
  steps: { label: "Steps", icon: Footprints, color: "#22c55e", unit: "steps" },
  sleep_duration: { label: "Sleep Duration", icon: Moon, color: "#6366f1", unit: "hours" },
  sleep_quality: { label: "Sleep Quality", icon: Moon, color: "#8b5cf6", unit: "score" },
  deep_sleep: { label: "Deep Sleep", icon: Moon, color: "#3b82f6", unit: "hours" },
  rem_sleep: { label: "REM Sleep", icon: Brain, color: "#a855f7", unit: "hours" },
  blood_oxygen: { label: "Blood Oxygen", icon: Droplets, color: "#0ea5e9", unit: "%" },
  stress_level: { label: "Stress Level", icon: Zap, color: "#f59e0b", unit: "score" },
  blood_glucose: { label: "Blood Glucose", icon: ThermometerSun, color: "#ec4899", unit: "mg/dL" },
};

const severityColors: Record<string, string> = {
  low: "bg-blue-500/10 text-blue-600 border-blue-200",
  medium: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  high: "bg-orange-500/10 text-orange-600 border-orange-200",
  critical: "bg-red-500/10 text-red-600 border-red-200",
};

function getInsightsSummary(insights: unknown): string | null {
  if (!insights || typeof insights !== "object") return null;
  const summary = (insights as Record<string, unknown>).summary;
  return typeof summary === "string" ? summary : null;
}

// Generate 30 days of time-series data for each metric
function generateTimeSeriesData(metric: string, days: number = 30): WearableData[] {
  const data: WearableData[] = [];
  const now = Date.now();
  
  for (let i = days; i >= 0; i--) {
    const timestamp = new Date(now - 86400000 * i);
    let value: number;
    let source: string;
    
    switch (metric) {
      case "heart_rate":
        value = 58 + Math.random() * 15 + Math.sin(i / 7) * 3;
        source = "oura";
        break;
      case "heart_rate_variability":
        value = 42 + Math.random() * 25 + Math.sin(i / 5) * 8;
        source = "whoop";
        break;
      case "resting_heart_rate":
        value = 52 + Math.random() * 8 - (i / days) * 3;
        source = "apple_health";
        break;
      case "steps":
        value = 6500 + Math.random() * 8000 + (i % 7 === 0 || i % 7 === 6 ? -2000 : 1500);
        source = "fitbit";
        break;
      case "sleep_duration":
        value = 6.5 + Math.random() * 2.5 + (i % 7 === 5 ? 1 : 0);
        source = "oura";
        break;
      case "sleep_quality":
        value = 72 + Math.random() * 25;
        source = "whoop";
        break;
      case "deep_sleep":
        value = 1.2 + Math.random() * 1.3;
        source = "oura";
        break;
      case "rem_sleep":
        value = 1.5 + Math.random() * 1.2;
        source = "oura";
        break;
      case "blood_oxygen":
        value = 96 + Math.random() * 3;
        source = "apple_health";
        break;
      case "stress_level":
        value = 25 + Math.random() * 40 + (i % 7 === 1 ? 15 : 0);
        source = "garmin";
        break;
      case "blood_glucose":
        value = 85 + Math.random() * 30 + Math.sin(i / 3) * 10;
        source = "cgm";
        break;
      default:
        value = 50 + Math.random() * 50;
        source = "oura";
    }
    
    data.push({
      id: `wd-${metric}-${i}`,
      userId: "user1",
      connectionId: `conn-${source}`,
      metricType: metric,
      value: Math.round(value * 10) / 10,
      unit: metricConfig[metric]?.unit || "units",
      source,
      recordedAt: timestamp,
      createdAt: timestamp,
    });
  }
  
  return data;
}

const mockConnections: WearableConnection[] = [
  {
    id: "conn-oura",
    userId: "user1",
    deviceType: "oura",
    deviceName: "Oura Ring Gen 3",
    status: "connected",
    lastSyncAt: new Date(Date.now() - 3600000),
    accessToken: null,
    refreshToken: null,
    tokenExpiresAt: null,
    createdAt: new Date(Date.now() - 86400000 * 180),
    updatedAt: new Date(Date.now() - 3600000),
  },
  {
    id: "conn-whoop",
    userId: "user1",
    deviceType: "whoop",
    deviceName: "WHOOP 4.0",
    status: "connected",
    lastSyncAt: new Date(Date.now() - 7200000),
    accessToken: null,
    refreshToken: null,
    tokenExpiresAt: null,
    createdAt: new Date(Date.now() - 86400000 * 120),
    updatedAt: new Date(Date.now() - 7200000),
  },
  {
    id: "conn-apple",
    userId: "user1",
    deviceType: "apple_health",
    deviceName: "Apple Watch Series 9",
    status: "connected",
    lastSyncAt: new Date(Date.now() - 1800000),
    accessToken: null,
    refreshToken: null,
    tokenExpiresAt: null,
    createdAt: new Date(Date.now() - 86400000 * 365),
    updatedAt: new Date(Date.now() - 1800000),
  },
  {
    id: "conn-cgm",
    userId: "user1",
    deviceType: "cgm",
    deviceName: "Dexcom G7",
    status: "connected",
    lastSyncAt: new Date(Date.now() - 900000),
    accessToken: null,
    refreshToken: null,
    tokenExpiresAt: null,
    createdAt: new Date(Date.now() - 86400000 * 45),
    updatedAt: new Date(Date.now() - 900000),
  },
  {
    id: "conn-fitbit",
    userId: "user1",
    deviceType: "fitbit",
    deviceName: "Fitbit Sense 2",
    status: "connected",
    lastSyncAt: new Date(Date.now() - 5400000),
    accessToken: null,
    refreshToken: null,
    tokenExpiresAt: null,
    createdAt: new Date(Date.now() - 86400000 * 90),
    updatedAt: new Date(Date.now() - 5400000),
  },
  {
    id: "conn-garmin",
    userId: "user1",
    deviceType: "garmin",
    deviceName: "Garmin Fenix 8",
    status: "connected",
    lastSyncAt: new Date(Date.now() - 10800000),
    accessToken: null,
    refreshToken: null,
    tokenExpiresAt: null,
    createdAt: new Date(Date.now() - 86400000 * 60),
    updatedAt: new Date(Date.now() - 10800000),
  },
];

const mockWearableData: WearableData[] = [
  ...generateTimeSeriesData("heart_rate"),
  ...generateTimeSeriesData("heart_rate_variability"),
  ...generateTimeSeriesData("resting_heart_rate"),
  ...generateTimeSeriesData("steps"),
  ...generateTimeSeriesData("sleep_duration"),
  ...generateTimeSeriesData("sleep_quality"),
  ...generateTimeSeriesData("deep_sleep"),
  ...generateTimeSeriesData("rem_sleep"),
  ...generateTimeSeriesData("blood_oxygen"),
  ...generateTimeSeriesData("stress_level"),
  ...generateTimeSeriesData("blood_glucose"),
];

const mockAlerts: WearableAlert[] = [
  {
    id: "alert1",
    userId: "user1",
    alertType: "anomaly",
    metricType: "heart_rate_variability",
    severity: "medium",
    message: "HRV dropped 23% below your 7-day average. Consider prioritizing recovery today.",
    threshold: 35,
    actualValue: 28,
    isRead: false,
    isResolved: false,
    createdAt: new Date(Date.now() - 3600000 * 2),
    resolvedAt: null,
  },
  {
    id: "alert2",
    userId: "user1",
    alertType: "goal",
    metricType: "steps",
    severity: "low",
    message: "Great job! You exceeded your daily step goal of 10,000 steps yesterday.",
    threshold: 10000,
    actualValue: 14523,
    isRead: true,
    isResolved: true,
    createdAt: new Date(Date.now() - 86400000),
    resolvedAt: new Date(Date.now() - 43200000),
  },
  {
    id: "alert3",
    userId: "user1",
    alertType: "anomaly",
    metricType: "blood_glucose",
    severity: "high",
    message: "Post-meal glucose spike detected (167 mg/dL). Consider reducing carbohydrate intake at dinner.",
    threshold: 140,
    actualValue: 167,
    isRead: false,
    isResolved: false,
    createdAt: new Date(Date.now() - 3600000 * 8),
    resolvedAt: null,
  },
  {
    id: "alert4",
    userId: "user1",
    alertType: "trend",
    metricType: "sleep_quality",
    severity: "medium",
    message: "Sleep quality has declined 15% over the past week. Review sleep hygiene practices.",
    threshold: 80,
    actualValue: 68,
    isRead: false,
    isResolved: false,
    createdAt: new Date(Date.now() - 3600000 * 12),
    resolvedAt: null,
  },
  {
    id: "alert5",
    userId: "user1",
    alertType: "improvement",
    metricType: "resting_heart_rate",
    severity: "low",
    message: "Resting heart rate improved by 4 bpm over 30 days. Your cardiovascular fitness is improving!",
    threshold: 58,
    actualValue: 54,
    isRead: true,
    isResolved: true,
    createdAt: new Date(Date.now() - 86400000 * 3),
    resolvedAt: new Date(Date.now() - 86400000 * 2),
  },
  {
    id: "alert6",
    userId: "user1",
    alertType: "anomaly",
    metricType: "blood_oxygen",
    severity: "medium",
    message: "Blood oxygen dropped to 94% during sleep. Consider checking sleep position or altitude changes.",
    threshold: 95,
    actualValue: 94,
    isRead: false,
    isResolved: false,
    createdAt: new Date(Date.now() - 3600000 * 18),
    resolvedAt: null,
  },
  {
    id: "alert7",
    userId: "user1",
    alertType: "trend",
    metricType: "stress_level",
    severity: "high",
    message: "Stress levels elevated for 3 consecutive days. Consider breathwork or meditation sessions.",
    threshold: 50,
    actualValue: 68,
    isRead: false,
    isResolved: false,
    createdAt: new Date(Date.now() - 3600000 * 6),
    resolvedAt: null,
  },
  {
    id: "alert8",
    userId: "user1",
    alertType: "goal",
    metricType: "sleep_duration",
    severity: "low",
    message: "You achieved 7+ hours of sleep for 5 consecutive nights. Keep up the great sleep routine!",
    threshold: 7,
    actualValue: 7.8,
    isRead: true,
    isResolved: true,
    createdAt: new Date(Date.now() - 86400000 * 2),
    resolvedAt: new Date(Date.now() - 86400000),
  },
  {
    id: "alert9",
    userId: "user1",
    alertType: "improvement",
    metricType: "deep_sleep",
    severity: "low",
    message: "Deep sleep duration increased 18% this week. Your sleep architecture is optimizing!",
    threshold: 1.5,
    actualValue: 2.1,
    isRead: true,
    isResolved: true,
    createdAt: new Date(Date.now() - 86400000 * 4),
    resolvedAt: new Date(Date.now() - 86400000 * 3),
  },
  {
    id: "alert10",
    userId: "user1",
    alertType: "anomaly",
    metricType: "heart_rate",
    severity: "medium",
    message: "Elevated resting heart rate detected (72 bpm vs 54 bpm average). Monitor for signs of overtraining or illness.",
    threshold: 65,
    actualValue: 72,
    isRead: false,
    isResolved: false,
    createdAt: new Date(Date.now() - 3600000 * 4),
    resolvedAt: null,
  },
];

const mockAnalytics: WearableAnalyticsType = {
  id: "analytics1",
  userId: "user1",
  date: new Date(),
  metrics: {
    heart_rate: { avg: 62, min: 48, max: 145, trend: "stable" },
    heart_rate_variability: { avg: 48, min: 28, max: 72, trend: "improving" },
    resting_heart_rate: { avg: 54, min: 52, max: 58, trend: "improving" },
    steps: { avg: 9847, min: 4521, max: 16234, trend: "stable" },
    sleep_duration: { avg: 7.4, min: 5.8, max: 9.2, trend: "stable" },
    sleep_quality: { avg: 82, min: 65, max: 94, trend: "declining" },
    deep_sleep: { avg: 1.8, min: 0.9, max: 2.6, trend: "stable" },
    rem_sleep: { avg: 2.1, min: 1.4, max: 2.8, trend: "improving" },
    blood_oxygen: { avg: 97.5, min: 95, max: 99, trend: "stable" },
    stress_level: { avg: 38, min: 18, max: 72, trend: "improving" },
    blood_glucose: { avg: 94, min: 72, max: 145, trend: "stable" },
  },
  insights: {
    summary: "Your overall health metrics are trending positively. HRV and resting heart rate improvements indicate better recovery. Focus on sleep hygiene to address the slight decline in sleep quality.",
    recommendations: [
      "Maintain your current Zone 2 cardio routine - it's clearly working",
      "Consider earlier dinner times to improve glucose response",
      "Add 10 minutes of evening meditation to boost sleep quality",
      "Your HRV recovery is excellent - you can increase training load slightly"
    ],
    highlights: [
      { metric: "Resting HR", change: -4, unit: "bpm", period: "30 days", positive: true },
      { metric: "HRV", change: +12, unit: "ms", period: "30 days", positive: true },
      { metric: "Average Steps", change: +1240, unit: "steps", period: "7 days", positive: true },
    ],
    concerns: [
      { metric: "Sleep Quality", change: -8, unit: "score", period: "7 days", suggestion: "Review evening screen time and caffeine intake" },
    ]
  },
  createdAt: new Date(),
};

export default function WearableAnalytics() {
  const { toast } = useToast();
  const [selectedMetric, setSelectedMetric] = useState<string>("heart_rate");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: apiConnections, isLoading: connectionsLoading } = useQuery<WearableConnection[]>({
    queryKey: ["/api/wearables/connections"],
  });
  const connections = apiConnections && apiConnections.length > 0 ? apiConnections : mockConnections;

  const { data: apiWearableData, isLoading: dataLoading } = useQuery<WearableData[]>({
    queryKey: ["/api/wearables/data"],
  });
  const wearableData = apiWearableData && apiWearableData.length > 0 ? apiWearableData : mockWearableData;

  const { data: apiAlerts, isLoading: alertsLoading } = useQuery<WearableAlert[]>({
    queryKey: ["/api/wearables/alerts"],
  });
  const alerts = apiAlerts && apiAlerts.length > 0 ? apiAlerts : mockAlerts;

  const { data: apiAnalytics, isLoading: analyticsLoading } = useQuery<WearableAnalyticsType | null>({
    queryKey: ["/api/wearables/analytics/latest"],
  });
  const analytics = apiAnalytics || mockAnalytics;

  const syncMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      return await apiRequest("POST", `/api/wearables/sync/${connectionId}`);
    },
    onSuccess: (data: any) => {
      toast({
        title: "Sync Complete",
        description: `${data.dataPointsCreated} data points synced successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wearables/data"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wearables/connections"] });
    },
    onError: () => {
      toast({
        title: "Sync Failed",
        description: "Failed to sync wearable data. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateAnalyticsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/wearables/analytics/generate");
    },
    onSuccess: (data: any) => {
      toast({
        title: "Analytics Generated",
        description: `Daily summary created with ${data.alertsCreated} new alerts detected.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wearables/analytics/latest"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wearables/alerts"] });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate analytics. Ensure you have synced data first.",
        variant: "destructive",
      });
    },
  });

  const acknowledgeAlertMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: string }) => {
      return await apiRequest("PATCH", `/api/wearables/alerts/${id}`, { action });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wearables/alerts"] });
    },
  });

  const connectDeviceMutation = useMutation({
    mutationFn: async (deviceType: string) => {
      return await apiRequest("POST", `/api/wearables/connect/${deviceType}`, { 
        deviceName: deviceNames[deviceType] 
      });
    },
    onSuccess: () => {
      toast({
        title: "Device Connected",
        description: "Wearable device connected successfully. You can now sync data.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wearables/connections"] });
    },
    onError: () => {
      toast({
        title: "Connection Failed",
        description: "Failed to connect device. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getFilteredChartData = (metricType: string) => {
    if (!wearableData) return [];
    return wearableData
      .filter(d => d.metricType === metricType)
      .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
      .slice(-48)
      .map(d => ({
        time: new Date(d.recordedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        value: d.value,
      }));
  };

  const getMetricStats = (metricType: string) => {
    if (!wearableData) return null;
    const filtered = wearableData.filter(d => d.metricType === metricType);
    if (filtered.length === 0) return null;
    const values = filtered.map(d => d.value);
    return {
      avg: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10,
      min: Math.min(...values),
      max: Math.max(...values),
      latest: values[values.length - 1],
      count: values.length,
    };
  };

  const activeAlerts = alerts?.filter(a => a.status === 'active') || [];
  const connectedDevices = connections || [];

  const availableDevices = ['oura', 'whoop', 'apple_health', 'fitbit', 'garmin', 'cgm']
    .filter(d => !connectedDevices.some(c => c.deviceType === d));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Wearable Analytics</h1>
          <p className="text-muted-foreground">
            Real-time health metrics from your connected devices
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => generateAnalyticsMutation.mutate()}
            disabled={generateAnalyticsMutation.isPending || !wearableData?.length}
            data-testid="button-generate-analytics"
          >
            {generateAnalyticsMutation.isPending ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <TrendingUp className="w-4 h-4 mr-2" />
            )}
            Generate Insights
          </Button>
        </div>
      </div>

      {activeAlerts.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <CardTitle className="text-base">Active Health Alerts</CardTitle>
              <Badge variant="destructive" className="ml-auto">
                {activeAlerts.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeAlerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${severityColors[alert.severity || 'medium']}`}
                data-testid={`alert-${alert.id}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium">{alert.title}</p>
                    <p className="text-sm opacity-80 mt-1">{alert.message}</p>
                    {alert.recommendation && (
                      <p className="text-xs mt-2 opacity-70">{alert.recommendation}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => acknowledgeAlertMutation.mutate({ id: alert.id, action: 'acknowledge' })}
                      data-testid={`button-acknowledge-${alert.id}`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => acknowledgeAlertMutation.mutate({ id: alert.id, action: 'dismiss' })}
                      data-testid={`button-dismiss-${alert.id}`}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="devices" data-testid="tab-devices">Devices</TabsTrigger>
          <TabsTrigger value="metrics" data-testid="tab-metrics">Metrics</TabsTrigger>
          <TabsTrigger value="alerts" data-testid="tab-alerts">
            Alerts
            {activeAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {activeAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {analytics && (
            <Card className="hover-elevate">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Daily Wellness Score</CardTitle>
                  <Badge variant="outline" className="text-lg font-bold">
                    {analytics.score || 0}/100
                  </Badge>
                </div>
                <CardDescription>
                  {new Date(analytics.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={analytics.score || 0} className="h-3" />
                {(() => {
                  const summary = getInsightsSummary(analytics.insights);
                  return summary ? (
                    <div className="mt-4 text-sm text-muted-foreground">
                      {summary}
                    </div>
                  ) : null;
                })()}
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['heart_rate', 'heart_rate_variability', 'steps', 'sleep_quality'].map((metric) => {
              const stats = getMetricStats(metric);
              const config = metricConfig[metric];
              const Icon = config?.icon || Activity;
              return (
                <Card key={metric} className="hover-elevate cursor-pointer" onClick={() => {
                  setSelectedMetric(metric);
                  setActiveTab('metrics');
                }}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4" style={{ color: config?.color }} />
                      <span className="text-sm font-medium">{config?.label}</span>
                    </div>
                    {dataLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : stats ? (
                      <>
                        <div className="text-2xl font-bold" data-testid={`stat-${metric}`}>
                          {metric === 'steps' ? stats.avg.toLocaleString() : stats.avg}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {config?.unit} avg
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground">No data</div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {wearableData && wearableData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Heart Rate Trend (Last 24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getFilteredChartData('heart_rate')}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                      <YAxis domain={['dataMin - 10', 'dataMax + 10']} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#ef4444"
                        fill="#ef4444"
                        fillOpacity={0.2}
                        name="Heart Rate"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {(!wearableData || wearableData.length === 0) && !dataLoading && (
            <Card>
              <CardContent className="py-12 text-center">
                <Watch className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Wearable Data Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Connect a device and sync to start tracking your health metrics.
                </p>
                <Button onClick={() => setActiveTab('devices')}>
                  Connect Device
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Connected Devices</CardTitle>
                <CardDescription>
                  Manage your wearable device connections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {connectionsLoading ? (
                  <>
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                  </>
                ) : connectedDevices.length > 0 ? (
                  connectedDevices.map((connection) => {
                    const Icon = deviceIcons[connection.deviceType] || Watch;
                    return (
                      <div
                        key={connection.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                        data-testid={`device-${connection.deviceType}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{deviceNames[connection.deviceType]}</p>
                            <p className="text-xs text-muted-foreground">
                              Last sync: {connection.lastSync 
                                ? new Date(connection.lastSync).toLocaleString()
                                : 'Never'}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => syncMutation.mutate(connection.id)}
                          disabled={syncMutation.isPending}
                          data-testid={`button-sync-${connection.deviceType}`}
                        >
                          {syncMutation.isPending ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No devices connected yet
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Available Devices</CardTitle>
                <CardDescription>
                  Connect new wearable devices to track more metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {availableDevices.map((deviceType) => {
                  const Icon = deviceIcons[deviceType] || Watch;
                  return (
                    <div
                      key={deviceType}
                      className="flex items-center justify-between p-3 rounded-lg border hover-elevate cursor-pointer"
                      onClick={() => connectDeviceMutation.mutate(deviceType)}
                      data-testid={`connect-${deviceType}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <Icon className="w-5 h-5" />
                        </div>
                        <p className="font-medium">{deviceNames[deviceType]}</p>
                      </div>
                      <Button size="sm" variant="ghost">
                        Connect
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(metricConfig).map(([key, config]) => {
              const Icon = config.icon;
              const hasData = getMetricStats(key) !== null;
              return (
                <Button
                  key={key}
                  variant={selectedMetric === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMetric(key)}
                  disabled={!hasData}
                  className={!hasData ? "opacity-50" : ""}
                  data-testid={`metric-button-${key}`}
                >
                  <Icon className="w-4 h-4 mr-1" style={{ color: selectedMetric === key ? undefined : config.color }} />
                  {config.label}
                </Button>
              );
            })}
          </div>

          {selectedMetric && (
            <>
              <div className="grid md:grid-cols-4 gap-4">
                {(() => {
                  const stats = getMetricStats(selectedMetric);
                  const config = metricConfig[selectedMetric];
                  if (!stats) return null;
                  return (
                    <>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-sm text-muted-foreground mb-1">Average</div>
                          <div className="text-2xl font-bold" style={{ color: config?.color }}>
                            {stats.avg} <span className="text-sm font-normal">{config?.unit}</span>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-sm text-muted-foreground mb-1">Minimum</div>
                          <div className="text-2xl font-bold">
                            {stats.min} <span className="text-sm font-normal">{config?.unit}</span>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-sm text-muted-foreground mb-1">Maximum</div>
                          <div className="text-2xl font-bold">
                            {stats.max} <span className="text-sm font-normal">{config?.unit}</span>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-sm text-muted-foreground mb-1">Data Points</div>
                          <div className="text-2xl font-bold">
                            {stats.count}
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  );
                })()}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{metricConfig[selectedMetric]?.label} Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getFilteredChartData(selectedMetric)}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={metricConfig[selectedMetric]?.color}
                          strokeWidth={2}
                          dot={false}
                          name={metricConfig[selectedMetric]?.label}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="flex gap-2 mb-4">
            <Badge variant="outline">All</Badge>
            <Badge variant="destructive">{activeAlerts.length} Active</Badge>
            <Badge variant="secondary">
              {alerts?.filter(a => a.status === 'acknowledged').length || 0} Acknowledged
            </Badge>
            <Badge variant="secondary">
              {alerts?.filter(a => a.status === 'resolved').length || 0} Resolved
            </Badge>
          </div>

          {alertsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          ) : alerts && alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Card key={alert.id} className={alert.status === 'active' ? '' : 'opacity-60'}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          alert.status === 'active' ? 'bg-destructive/10' : 'bg-muted'
                        }`}>
                          <Bell className={`w-4 h-4 ${
                            alert.status === 'active' ? 'text-destructive' : 'text-muted-foreground'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium">{alert.title}</p>
                            <Badge className={severityColors[alert.severity || 'medium']}>
                              {alert.severity}
                            </Badge>
                            <Badge variant="outline">
                              {metricConfig[alert.metricType]?.label || alert.metricType}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                          {alert.recommendation && (
                            <p className="text-xs text-muted-foreground mt-2 italic">
                              {alert.recommendation}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(alert.createdAt!).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {alert.status === 'active' && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => acknowledgeAlertMutation.mutate({ id: alert.id, action: 'acknowledge' })}
                          >
                            Acknowledge
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => acknowledgeAlertMutation.mutate({ id: alert.id, action: 'resolve' })}
                          >
                            Resolve
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto text-chart-2 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Alerts</h3>
                <p className="text-muted-foreground">
                  All your health metrics are within normal ranges.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
