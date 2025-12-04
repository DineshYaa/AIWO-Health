import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SiHubspot, SiZoho } from "react-icons/si";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  PageViewTrendsChart,
  TopPagesChart,
  ConversionFunnelChart,
  ActivityHeatmap,
  RealTimeActiveUsersCard,
  DataRetentionSettings,
} from "@/components/dashboard/AnalyticsCharts";
import {
  Users,
  Calendar as CalendarIcon,
  IndianRupee,
  TrendingUp,
  Shield,
  Building,
  UserCog,
  BarChart3,
  MapPin,
  CheckCircle,
  Clock,
  XCircle,
  Activity,
  Database,
  Server,
  AlertTriangle,
  FileText,
  Search,
  RefreshCw,
  Zap,
  Heart,
  Eye,
  MousePointer,
  Globe,
  Gauge,
  Link2,
  Mail,
  MessageSquare,
  Bell,
  RotateCcw,
  Upload,
  Download,
  Lock,
  Wifi,
  WifiOff,
  Send,
  Plus,
  Edit,
  Trash2,
  Settings,
  Play,
  ArrowUp,
  ArrowDown,
  Minus,
  AlertCircle,
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";
import type { User as UserType, Booking, Payment } from "@shared/schema";

interface AdminStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  revenue: number;
  totalUsers: number;
  physicians: number;
  admins: number;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: { status: string; latency?: number };
    api: { status: string; latency?: number };
    memory: { status: string; usage?: number };
    websocket: { status: string; connections?: number };
  };
  version: string;
  uptime: number;
}

interface SystemMetrics {
  requests: { total: number; perMinute: number; errors: number };
  latency: { avg: number; p95: number; p99: number };
  memory: { used: number; total: number; percentage: number };
  activeUsers: number;
}

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  metadata: any;
  severity: string;
  phiAccessed?: boolean;
}

interface AuditSummary {
  totalActions: number;
  actionsByType: Record<string, number>;
  actionsByResource: Record<string, number>;
  topUsers: { userId: string; count: number }[];
  phiAccessCount: number;
  failedActions: number;
}

interface AnalyticsDashboard {
  summary: {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    avgHealthScore: number;
    totalProtocols: number;
    totalBookings: number;
    totalRevenue: number;
  };
  trends: {
    userGrowth: number;
    bookingGrowth: number;
    revenueGrowth: number;
    engagementRate: number;
  };
  topPages: { path: string; views: number }[];
}

interface PageStatsResponse {
  totalPageViews: number;
  uniqueVisitors: number;
  totalSessions: number;
  pageViews: Record<string, number>;
  avgPagesPerSession: number;
}

interface PageStatItem {
  path: string;
  views: number;
  uniqueVisitors?: number;
}

interface ConversionFunnel {
  landing: number;
  signup: number;
  profileComplete: number;
  biomarkerTest: number;
  protocolGenerated: number;
  bookingStarted: number;
  bookingCompleted: number;
}

interface CrmStatus {
  configured: boolean;
  providers: { name: string; configured: boolean }[];
  lastSync: string | null;
  pendingCount: number;
  failedCount: number;
}

interface CrmProviders {
  providers: string[];
  available: string[];
  configured: {
    hubspot: boolean;
    zoho: boolean;
  };
}

interface CrmSyncLog {
  id: string;
  provider: string;
  resourceType: string;
  resourceId: string;
  status: string;
  direction: string;
  syncedAt: string;
  errorMessage?: string;
}

interface WebSocketStatus {
  connected: boolean;
  connectionCount: number;
  authenticatedUsers: number;
  rooms: string[];
  uptime: number;
}

interface NotificationTemplate {
  id: string;
  name: string;
  type: string;
  subject?: string;
  body: string;
  variables: string[];
  isActive: boolean;
}

interface SecurityDashboard {
  metrics: {
    totalEvents: number;
    criticalEvents: number;
    highEvents: number;
    mediumEvents: number;
    lowEvents: number;
    failedLogins: number;
    suspiciousActivity: number;
    blockedIps: number;
    eventTrends: { date: string; events: number; critical: number; high: number }[];
  };
  threatSummary: {
    activeThreatLevel: string;
    failedLoginAttempts: number;
    suspiciousIpCount: number;
    blockedIpCount: number;
    recentThreats: string[];
    recommendations: string[];
  };
  generatedAt: string;
}

interface SecurityEvent {
  id: string;
  eventType: string;
  severity: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  metadata?: any;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  createdAt: string;
}

interface IpAccessRule {
  id: string;
  ipAddress: string;
  cidrRange?: string;
  ruleType: string;
  reason: string;
  expiresAt?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

interface SessionInfo {
  id: string;
  userId: string;
  deviceInfo?: string;
  ipAddress?: string;
  location?: string;
  userAgent?: string;
  lastActivity: string;
  expiresAt: string;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

interface SessionStats {
  activeSessions: number;
  uniqueUsers: number;
  avgSessionDuration: number;
  deviceBreakdown: { device: string; count: number }[];
  locationBreakdown: { location: string; count: number }[];
  peakHours: { hour: number; sessions: number }[];
}

interface GdprStats {
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  exportRequests: number;
  deletionRequests: number;
  avgProcessingDays: number;
}

interface DataRequest {
  id: string;
  userId: string;
  requestType: string;
  status: string;
  reason?: string;
  downloadUrl?: string;
  downloadExpiresAt?: string;
  scheduledDeletionAt?: string;
  rejectionReason?: string;
  processedBy?: string;
  processedAt?: string;
  createdAt: string;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

interface ComplianceStatus {
  hipaa: { status: string; lastCheck: string; score: number };
  soc2: { status: string; lastCheck: string; score: number };
  iso27001: { status: string; lastCheck: string; score: number };
  gdpr: { status: string; lastCheck: string; score: number };
  overallScore: number;
}

interface ComplianceCheck {
  id: string;
  checkType: string;
  status: string;
  score: number;
  performedBy: string;
  completedAt: string;
}

interface RealTimeMetrics {
  timestamp: string;
  uptime: number;
  systemHealth: {
    overall: 'healthy' | 'degraded' | 'unhealthy';
    cpu: { usage: number; status: string; loadAvg: number[] };
    memory: { usage: number; usedMB: number; totalMB: number; status: string };
    database: { latencyMs: number; status: string };
  };
  responseTimes: {
    avg: number;
    p50: number;
    p95: number;
    p99: number;
    min: number;
    max: number;
    samples: number;
    history: Array<{ timestamp: string; avg: number; p50: number; p95: number; p99: number }>;
  };
  requestMetrics: {
    total: number;
    perMinute: number;
    errors: number;
    errorRate: number;
    byStatus: Record<string, number>;
    byPath: Record<string, number>;
  };
  connections: {
    active: number;
    authenticated: number;
  };
  trends: {
    responseTime: 'up' | 'down' | 'stable';
    errorRate: 'up' | 'down' | 'stable';
    requestRate: 'up' | 'down' | 'stable';
  };
}

interface SystemAlertRule {
  id: string;
  name: string;
  description?: string;
  metricType: string;
  operator: string;
  threshold: number;
  severity: 'info' | 'warning' | 'critical';
  duration: number;
  cooldownMinutes: number;
  isEnabled: boolean;
  notifyEmail: boolean;
  notifyInApp: boolean;
  createdBy?: string;
  lastTriggeredAt?: string;
  triggerCount: number;
  createdAt: string;
  updatedAt: string;
}

interface SystemAlertHistoryEntry {
  id: string;
  ruleId: string;
  ruleName: string;
  metricType: string;
  severity: 'info' | 'warning' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved' | 'expired';
  triggeredValue: number;
  threshold: number;
  message: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolution?: string;
  createdAt: string;
}

interface LabImport {
  id: string;
  userId: string;
  labPartner: string;
  externalId?: string;
  status: 'pending' | 'received' | 'processed' | 'error';
  rawData?: any;
  parsedData?: {
    biomarkers?: {
      code: string;
      name: string;
      value: number;
      unit: string;
      category: string;
      referenceRange?: { low: number; high: number };
    }[];
    patientId?: string;
    testDate?: string;
    orderId?: string;
  };
  biomarkerTestId?: string;
  format?: string;
  errorMessage?: string;
  receivedAt: string;
  processedAt?: string;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

interface LabImportStats {
  total: number;
  pending: number;
  processed: number;
  error: number;
  byPartner: { partner: string; count: number }[];
}

interface ValidationRule {
  id: string;
  biomarkerCode: string;
  biomarkerName: string;
  category: string;
  minValue: number;
  maxValue: number;
  optimalMin: number;
  optimalMax: number;
  criticalLow?: number;
  criticalHigh?: number;
  unit: string;
  isRequired: boolean;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [auditSearchTerm, setAuditSearchTerm] = useState("");
  const [selectedResourceType, setSelectedResourceType] = useState<string>("all");
  const [showPhiOnly, setShowPhiOnly] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedBookingForRefund, setSelectedBookingForRefund] = useState<Booking | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [selectedCrmProvider, setSelectedCrmProvider] = useState<string>("hubspot");
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  
  const [analyticsDateRange, setAnalyticsDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });

  const { data: stats, isLoading: statsLoading, isError: statsError } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    retry: 1,
    throwOnError: false,
  });

  const { data: users = [], isLoading: usersLoading, isError: usersError } = useQuery<UserType[]>({
    queryKey: ["/api/admin/users"],
    retry: 1,
    throwOnError: false,
  });

  const { data: bookings = [], isLoading: bookingsLoading, isError: bookingsError } = useQuery<Booking[]>({
    queryKey: ["/api/admin/bookings"],
    retry: 1,
    throwOnError: false,
  });

  const { data: healthStatus, isLoading: healthLoading, refetch: refetchHealth } = useQuery<HealthStatus>({
    queryKey: ["/api/health"],
    refetchInterval: 30000,
    retry: 1,
  });

  const { data: metrics, isLoading: metricsLoading } = useQuery<SystemMetrics>({
    queryKey: ["/api/metrics"],
    refetchInterval: 15000,
    retry: 1,
  });

  const { data: auditLogs = [], isLoading: auditLoading, refetch: refetchAudit } = useQuery<AuditLog[]>({
    queryKey: ["/api/audit-logs", selectedResourceType, showPhiOnly],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedResourceType !== "all") {
        params.append("resourceType", selectedResourceType);
      }
      params.append("limit", "100");
      const endpoint = showPhiOnly ? "/api/audit-logs/phi" : "/api/audit-logs";
      const response = await fetch(`${endpoint}?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch audit logs");
      return response.json();
    },
    throwOnError: false,
  });

  const { data: auditSummary, isLoading: auditSummaryLoading } = useQuery<AuditSummary>({
    queryKey: ["/api/audit-logs/summary"],
  });

  const { data: analyticsDashboard, isLoading: analyticsLoading } = useQuery<AnalyticsDashboard>({
    queryKey: ["/api/analytics/dashboard"],
  });

  const { data: pageStatsResponse, isLoading: pageStatsLoading } = useQuery<PageStatsResponse>({
    queryKey: ["/api/analytics/page-stats"],
  });

  const pageStats: PageStatItem[] = pageStatsResponse?.pageViews 
    ? Object.entries(pageStatsResponse.pageViews).map(([path, views]) => ({ path, views }))
    : [];

  const { data: conversionFunnel, isLoading: funnelLoading } = useQuery<ConversionFunnel>({
    queryKey: ["/api/analytics/funnel"],
  });

  const { data: pageViewTrends = [], isLoading: trendsLoading } = useQuery<any[]>({
    queryKey: ["/api/analytics/page-view-trends", analyticsDateRange.from.toISOString(), analyticsDateRange.to.toISOString()],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: analyticsDateRange.from.toISOString(),
        endDate: analyticsDateRange.to.toISOString(),
      });
      const response = await fetch(`/api/analytics/page-view-trends?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch page view trends");
      return response.json();
    },
    throwOnError: false,
  });

  const { data: topPages = [], isLoading: topPagesLoading } = useQuery<any[]>({
    queryKey: ["/api/analytics/top-pages", analyticsDateRange.from.toISOString(), analyticsDateRange.to.toISOString()],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: analyticsDateRange.from.toISOString(),
        endDate: analyticsDateRange.to.toISOString(),
        limit: "10",
      });
      const response = await fetch(`/api/analytics/top-pages?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch top pages");
      return response.json();
    },
    throwOnError: false,
  });

  const { data: activityHeatmap = [], isLoading: heatmapLoading } = useQuery<any[]>({
    queryKey: ["/api/analytics/heatmap", analyticsDateRange.from.toISOString(), analyticsDateRange.to.toISOString()],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: analyticsDateRange.from.toISOString(),
        endDate: analyticsDateRange.to.toISOString(),
      });
      const response = await fetch(`/api/analytics/heatmap?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch activity heatmap");
      return response.json();
    },
    throwOnError: false,
  });

  const { data: activeUsersData, isLoading: activeUsersLoading, refetch: refetchActiveUsers } = useQuery<{ count: number; timestamp: string }>({
    queryKey: ["/api/analytics/active-users"],
    refetchInterval: 30000,
  });

  const { data: enhancedFunnel = [], isLoading: enhancedFunnelLoading } = useQuery<any[]>({
    queryKey: ["/api/analytics/enhanced-funnel", analyticsDateRange.from.toISOString(), analyticsDateRange.to.toISOString()],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: analyticsDateRange.from.toISOString(),
        endDate: analyticsDateRange.to.toISOString(),
      });
      const response = await fetch(`/api/analytics/enhanced-funnel?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch enhanced funnel");
      return response.json();
    },
    throwOnError: false,
  });

  const { data: dataRetentionSettings, isLoading: retentionLoading } = useQuery<any>({
    queryKey: ["/api/analytics/data-retention"],
    throwOnError: false,
  });

  const cleanupDataMutation = useMutation({
    mutationFn: async (retentionDays: number) => {
      const response = await apiRequest("POST", "/api/analytics/cleanup", { retentionDays });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Data Cleanup Complete",
        description: `Successfully deleted ${data.deletedCount} old events.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/data-retention"] });
    },
    onError: () => {
      toast({
        title: "Cleanup Failed",
        description: "Failed to clean up old analytics data.",
        variant: "destructive",
      });
    },
  });

  const { data: crmStatus } = useQuery<CrmStatus>({
    queryKey: ["/api/crm/status", selectedCrmProvider],
    queryFn: async () => {
      const response = await fetch(`/api/crm/status?provider=${selectedCrmProvider}`);
      if (!response.ok) throw new Error("Failed to fetch CRM status");
      return response.json();
    },
    throwOnError: false,
  });

  const { data: crmProviders } = useQuery<CrmProviders>({
    queryKey: ["/api/crm/providers"],
    throwOnError: false,
  });

  const { data: crmHistory = [] } = useQuery<CrmSyncLog[]>({
    queryKey: ["/api/crm/history", selectedCrmProvider],
    queryFn: async () => {
      const response = await fetch(`/api/crm/history?provider=${selectedCrmProvider}`);
      if (!response.ok) throw new Error("Failed to fetch CRM history");
      return response.json();
    },
    throwOnError: false,
  });

  const { data: crmSyncStats } = useQuery<{
    totalSyncs: number;
    successfulSyncs: number;
    failedSyncs: number;
    pendingSyncs: number;
    lastSyncAt: string | null;
    syncsByProvider: { provider: string; count: number; failed: number }[];
    syncsByResourceType: { type: string; count: number; failed: number }[];
    recentFailures: CrmSyncLog[];
  }>({
    queryKey: ["/api/admin/crm/sync-stats", selectedCrmProvider],
    queryFn: async () => {
      const response = await fetch(`/api/admin/crm/sync-stats?provider=${selectedCrmProvider}`, { credentials: 'include' });
      if (!response.ok) throw new Error("Failed to fetch sync stats");
      return response.json();
    },
    throwOnError: false,
  });

  const { data: wsStatus } = useQuery<WebSocketStatus>({
    queryKey: ["/api/websocket/status"],
    refetchInterval: 10000,
  });

  const { data: securityDashboard, isLoading: securityLoading, refetch: refetchSecurity } = useQuery<SecurityDashboard>({
    queryKey: ["/api/security/dashboard"],
    refetchInterval: 60000,
  });

  const { data: securityEvents = { events: [], total: 0 }, isLoading: securityEventsLoading } = useQuery<{ events: SecurityEvent[]; total: number }>({
    queryKey: ["/api/security/events"],
  });

  const { data: ipRules = [], isLoading: ipRulesLoading, refetch: refetchIpRules } = useQuery<IpAccessRule[]>({
    queryKey: ["/api/security/ip-rules"],
  });

  const { data: sessionsData = { sessions: [], total: 0 }, isLoading: sessionsLoading, refetch: refetchSessions } = useQuery<{ sessions: SessionInfo[]; total: number }>({
    queryKey: ["/api/sessions"],
  });

  const { data: sessionStats, isLoading: sessionStatsLoading } = useQuery<SessionStats>({
    queryKey: ["/api/sessions/dashboard"],
  });

  const { data: gdprStats, isLoading: gdprStatsLoading } = useQuery<GdprStats>({
    queryKey: ["/api/gdpr/dashboard"],
  });

  const { data: gdprRequests = { requests: [], total: 0 }, isLoading: gdprRequestsLoading, refetch: refetchGdprRequests } = useQuery<{ requests: DataRequest[]; total: number }>({
    queryKey: ["/api/gdpr/requests"],
  });

  const { data: complianceStatus, isLoading: complianceLoading } = useQuery<ComplianceStatus>({
    queryKey: ["/api/compliance/status"],
  });

  const { data: complianceChecks = { checks: [], total: 0 } } = useQuery<{ checks: ComplianceCheck[]; total: number }>({
    queryKey: ["/api/compliance/checks"],
  });

  // Advanced Monitoring & Alerting
  const { data: realtimeMetrics, isLoading: realtimeMetricsLoading, isError: realtimeMetricsError, refetch: refetchRealtimeMetrics } = useQuery<RealTimeMetrics>({
    queryKey: ["/api/admin/monitoring/realtime-metrics"],
    refetchInterval: 30000,
    retry: 1,
    staleTime: 10000,
  });

  const { data: alertRules = { rules: [] }, isLoading: alertRulesLoading, refetch: refetchAlertRules } = useQuery<{ rules: SystemAlertRule[] }>({
    queryKey: ["/api/admin/alerts"],
  });

  const { data: alertHistory = { alerts: [] }, isLoading: alertHistoryLoading, refetch: refetchAlertHistory } = useQuery<{ alerts: SystemAlertHistoryEntry[] }>({
    queryKey: ["/api/admin/alerts/history"],
    refetchInterval: 60000,
  });

  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [editingAlertRule, setEditingAlertRule] = useState<SystemAlertRule | null>(null);
  
  const [labImportPage, setLabImportPage] = useState(0);
  const [labImportStatusFilter, setLabImportStatusFilter] = useState<string>("all");
  const [labImportSearchTerm, setLabImportSearchTerm] = useState("");
  const [selectedLabImport, setSelectedLabImport] = useState<LabImport | null>(null);
  const [labImportDetailsOpen, setLabImportDetailsOpen] = useState(false);
  const [labReviewDialogOpen, setLabReviewDialogOpen] = useState(false);
  const [labReviewNotes, setLabReviewNotes] = useState("");
  const [manualImportDialogOpen, setManualImportDialogOpen] = useState(false);
  const [manualImportData, setManualImportData] = useState({
    data: '',
    format: 'JSON' as 'HL7' | 'FHIR' | 'JSON',
    userId: '',
    labPartner: 'manual_upload',
  });
  const [validationRulesDialogOpen, setValidationRulesDialogOpen] = useState(false);
  
  const { data: labImportsData = { imports: [], total: 0 }, isLoading: labImportsLoading, refetch: refetchLabImports } = useQuery<{ imports: LabImport[]; total: number }>({
    queryKey: ["/api/admin/lab/imports", labImportPage, labImportStatusFilter, labImportSearchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: "20",
        offset: String(labImportPage * 20),
        ...(labImportStatusFilter !== "all" && { status: labImportStatusFilter }),
        ...(labImportSearchTerm && { search: labImportSearchTerm }),
      });
      const response = await fetch(`/api/admin/lab/imports?${params}`, { credentials: 'include' });
      if (!response.ok) throw new Error("Failed to fetch lab imports");
      return response.json();
    },
    throwOnError: false,
  });

  const { data: pendingLabImports = [], isLoading: pendingLabImportsLoading } = useQuery<LabImport[]>({
    queryKey: ["/api/admin/lab/imports/pending"],
    queryFn: async () => {
      const response = await fetch("/api/admin/lab/imports/pending", { credentials: 'include' });
      if (!response.ok) throw new Error("Failed to fetch pending imports");
      return response.json();
    },
    throwOnError: false,
  });

  const { data: labImportStats, isLoading: labImportStatsLoading } = useQuery<LabImportStats>({
    queryKey: ["/api/admin/lab/stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/lab/stats", { credentials: 'include' });
      if (!response.ok) throw new Error("Failed to fetch lab stats");
      return response.json();
    },
    throwOnError: false,
  });

  const { data: validationRules = [], isLoading: validationRulesLoading } = useQuery<ValidationRule[]>({
    queryKey: ["/api/admin/lab/validation-rules"],
    queryFn: async () => {
      const response = await fetch("/api/admin/lab/validation-rules", { credentials: 'include' });
      if (!response.ok) throw new Error("Failed to fetch validation rules");
      return response.json();
    },
    enabled: validationRulesDialogOpen,
    throwOnError: false,
  });

  const reviewLabImportMutation = useMutation({
    mutationFn: async ({ importId, status, notes }: { importId: string; status: string; notes: string }) => {
      return await apiRequest("POST", `/api/admin/lab/import/review/${importId}`, { status, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/lab/imports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/lab/imports/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/lab/stats"] });
      setLabReviewDialogOpen(false);
      setSelectedLabImport(null);
      setLabReviewNotes("");
      toast({ title: "Lab import reviewed successfully" });
    },
    onError: () => {
      toast({ title: "Failed to review lab import", variant: "destructive" });
    },
  });

  const manualLabImportMutation = useMutation({
    mutationFn: async (data: typeof manualImportData) => {
      return await apiRequest("POST", "/api/admin/lab/import/manual", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/lab/imports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/lab/stats"] });
      setManualImportDialogOpen(false);
      setManualImportData({ data: '', format: 'JSON', userId: '', labPartner: 'manual_upload' });
      toast({ title: "Lab data imported successfully" });
    },
    onError: () => {
      toast({ title: "Failed to import lab data", variant: "destructive" });
    },
  });
  
  const [alertFormData, setAlertFormData] = useState({
    name: '',
    description: '',
    metricType: 'response_time_avg' as string,
    operator: 'gt' as string,
    threshold: 0,
    severity: 'warning' as 'info' | 'warning' | 'critical',
    cooldownMinutes: 5,
    isEnabled: true,
  });

  const createAlertRuleMutation = useMutation({
    mutationFn: async (data: typeof alertFormData) => {
      return await apiRequest("POST", "/api/admin/alerts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/alerts"] });
      setAlertDialogOpen(false);
      setAlertFormData({
        name: '', description: '', metricType: 'response_time_avg', operator: 'gt',
        threshold: 0, severity: 'warning', cooldownMinutes: 5, isEnabled: true,
      });
      toast({ title: "Alert rule created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create alert rule", variant: "destructive" });
    },
  });

  const updateAlertRuleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof alertFormData> }) => {
      return await apiRequest("PATCH", `/api/admin/alerts/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/alerts"] });
      setAlertDialogOpen(false);
      setEditingAlertRule(null);
      toast({ title: "Alert rule updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update alert rule", variant: "destructive" });
    },
  });

  const deleteAlertRuleMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/alerts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/alerts"] });
      toast({ title: "Alert rule deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete alert rule", variant: "destructive" });
    },
  });

  const acknowledgeAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      return await apiRequest("POST", `/api/admin/alerts/history/${alertId}/acknowledge`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/alerts/history"] });
      toast({ title: "Alert acknowledged" });
    },
    onError: () => {
      toast({ title: "Failed to acknowledge alert", variant: "destructive" });
    },
  });

  const resolveAlertMutation = useMutation({
    mutationFn: async ({ alertId, resolution }: { alertId: string; resolution: string }) => {
      return await apiRequest("POST", `/api/admin/alerts/history/${alertId}/resolve`, { resolution });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/alerts/history"] });
      toast({ title: "Alert resolved" });
    },
    onError: () => {
      toast({ title: "Failed to resolve alert", variant: "destructive" });
    },
  });

  const terminateSessionMutation = useMutation({
    mutationFn: async ({ sessionId, reason }: { sessionId: string; reason?: string }) => {
      return await apiRequest("POST", `/api/sessions/${sessionId}/terminate`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions/dashboard"] });
      toast({ title: "Session terminated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to terminate session", variant: "destructive" });
    },
  });

  const processGdprRequestMutation = useMutation({
    mutationFn: async ({ requestId, action, reason }: { requestId: string; action: string; reason?: string }) => {
      if (action === "export") {
        return await apiRequest("POST", `/api/gdpr/requests/${requestId}/export`);
      } else if (action === "delete") {
        return await apiRequest("POST", `/api/gdpr/requests/${requestId}/delete`);
      } else if (action === "reject") {
        return await apiRequest("POST", `/api/gdpr/requests/${requestId}/reject`, { reason });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gdpr/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gdpr/dashboard"] });
      toast({ title: "GDPR request processed successfully" });
    },
    onError: () => {
      toast({ title: "Failed to process GDPR request", variant: "destructive" });
    },
  });

  const runComplianceCheckMutation = useMutation({
    mutationFn: async ({ checkType, scope }: { checkType: string; scope?: string }) => {
      return await apiRequest("POST", "/api/compliance/check", { checkType, scope });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/checks"] });
      toast({ title: "Compliance check completed" });
    },
    onError: () => {
      toast({ title: "Failed to run compliance check", variant: "destructive" });
    },
  });

  // Demo Data Seeding
  const { data: demoDataStats, isLoading: demoDataStatsLoading, refetch: refetchDemoDataStats } = useQuery<{
    analyticsEvents: number;
    crmSyncLogs: number;
    labImports: number;
    auditLogs: number;
    securityEvents: number;
    systemMetrics: number;
    gdprRequests: number;
    complianceChecks: number;
  }>({
    queryKey: ["/api/admin/demo-data/stats"],
  });

  const seedAllDemoDataMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/admin/demo-data/seed-all");
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/demo-data/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/lab/imports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/lab/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/audit-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/security/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gdpr/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/checks"] });
      toast({ 
        title: "Demo data seeded successfully", 
        description: `Created ${data?.details?.total || 0} records across all modules.` 
      });
    },
    onError: () => {
      toast({ title: "Failed to seed demo data", variant: "destructive" });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return await apiRequest("PATCH", `/api/admin/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "User role updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update user role", variant: "destructive" });
    },
  });

  const updateBookingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Booking> }) => {
      return await apiRequest("PATCH", `/api/admin/bookings/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Booking updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update booking", variant: "destructive" });
    },
  });

  const reindexSearchMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/search/reindex");
    },
    onSuccess: () => {
      toast({ title: "Search index rebuild started" });
    },
    onError: () => {
      toast({ title: "Failed to start reindex", variant: "destructive" });
    },
  });

  const syncCrmUserMutation = useMutation({
    mutationFn: async ({ userId, provider }: { userId: string; provider: string }) => {
      return await apiRequest("POST", `/api/crm/sync/user/${userId}`, { provider });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/history"] });
      toast({ title: `User synced to ${selectedCrmProvider.charAt(0).toUpperCase() + selectedCrmProvider.slice(1)} successfully` });
    },
    onError: () => {
      toast({ title: "Failed to sync user to CRM", variant: "destructive" });
    },
  });

  const syncCrmBookingMutation = useMutation({
    mutationFn: async ({ bookingId, provider }: { bookingId: string; provider: string }) => {
      return await apiRequest("POST", `/api/crm/sync/booking/${bookingId}`, { provider });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/history"] });
      toast({ title: `Booking synced to ${selectedCrmProvider.charAt(0).toUpperCase() + selectedCrmProvider.slice(1)} successfully` });
    },
    onError: () => {
      toast({ title: "Failed to sync booking to CRM", variant: "destructive" });
    },
  });

  const testCrmConnectionMutation = useMutation({
    mutationFn: async (provider: string) => {
      const response = await fetch(`/api/admin/crm/test-connection/${provider}`, { credentials: 'include' });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: `${selectedCrmProvider === 'hubspot' ? 'HubSpot' : 'Zoho'} connection successful`, description: data.latency ? `Latency: ${data.latency}ms` : undefined });
      } else {
        toast({ title: `Connection failed`, description: data.message, variant: "destructive" });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/admin/crm/sync-stats"] });
    },
    onError: () => {
      toast({ title: "Failed to test connection", variant: "destructive" });
    },
  });

  const syncAllCrmMutation = useMutation({
    mutationFn: async ({ provider, resourceType }: { provider: string; resourceType?: string }) => {
      return await apiRequest("POST", "/api/admin/crm/sync-all", { provider, resourceType });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/crm/sync-stats"] });
      if (data.users && data.bookings) {
        toast({ 
          title: "Bulk sync completed", 
          description: `Users: ${data.users.synced}/${data.users.total} synced, Bookings: ${data.bookings.synced}/${data.bookings.total} synced` 
        });
      } else {
        toast({ 
          title: "Sync completed", 
          description: `${data.synced}/${data.total} synced successfully` 
        });
      }
    },
    onError: () => {
      toast({ title: "Failed to sync all", variant: "destructive" });
    },
  });

  const retryCrmSyncMutation = useMutation({
    mutationFn: async (logId: string) => {
      return await apiRequest("POST", `/api/admin/crm/retry/${logId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/crm/sync-stats"] });
      toast({ title: "Retry successful" });
    },
    onError: () => {
      toast({ title: "Retry failed", variant: "destructive" });
    },
  });

  const retryAllFailedMutation = useMutation({
    mutationFn: async (provider?: string) => {
      return await apiRequest("POST", "/api/admin/crm/retry-all", { provider });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/crm/sync-stats"] });
      toast({ 
        title: "Retry all completed", 
        description: `${data.retried}/${data.total} retried successfully` 
      });
    },
    onError: () => {
      toast({ title: "Failed to retry all", variant: "destructive" });
    },
  });

  const refundPaymentMutation = useMutation({
    mutationFn: async ({ paymentId, amount }: { paymentId: string; amount?: number }) => {
      return await apiRequest("POST", `/api/admin/payments/${paymentId}/refund`, { amount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setRefundDialogOpen(false);
      setSelectedBookingForRefund(null);
      setRefundAmount("");
      toast({ title: "Refund processed successfully" });
    },
    onError: () => {
      toast({ title: "Failed to process refund", variant: "destructive" });
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': case 'connected': case 'synced': return 'text-green-600';
      case 'degraded': case 'pending': return 'text-amber-600';
      case 'unhealthy': case 'disconnected': case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-700';
      case 'update': return 'bg-blue-100 text-blue-700';
      case 'delete': return 'bg-red-100 text-red-700';
      case 'view': case 'read': return 'bg-gray-100 text-gray-700';
      case 'login': case 'logout': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCrmSyncStatusColor = (status: string) => {
    switch (status) {
      case 'synced': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'failed': return 'bg-red-100 text-red-700';
      case 'skipped': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const locationStats = bookings.reduce((acc, booking) => {
    const loc = booking.locationName || 'Unknown';
    acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filteredAuditLogs = auditLogs.filter((log) => {
    if (!auditSearchTerm) return true;
    const search = auditSearchTerm.toLowerCase();
    return (
      log.userId?.toLowerCase().includes(search) ||
      log.action?.toLowerCase().includes(search) ||
      log.resourceType?.toLowerCase().includes(search) ||
      log.resourceId?.toLowerCase().includes(search)
    );
  });

  const handleRefundClick = (booking: Booking) => {
    setSelectedBookingForRefund(booking);
    setRefundAmount(String(booking.totalAmount || 0));
    setRefundDialogOpen(true);
  };

  const processRefund = () => {
    if (!selectedBookingForRefund) return;
    refundPaymentMutation.mutate({
      paymentId: selectedBookingForRefund.id,
      amount: refundAmount ? parseFloat(refundAmount) : undefined,
    });
  };

  if (statsError || usersError) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]" data-testid="admin-access-denied">
        <div className="text-center space-y-4">
          <Shield className="w-16 h-16 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground max-w-md">
            You don't have permission to access the Admin Dashboard. 
            Please contact your administrator if you believe this is an error.
          </p>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-admin-title">Admin Dashboard</h1>
          <p className="text-muted-foreground">Enterprise monitoring, analytics, and operations</p>
        </div>
        <div className="flex items-center gap-2">
          {healthStatus && (
            <Badge 
              variant="outline" 
              className={`flex items-center gap-2 px-3 py-1 ${getHealthStatusColor(healthStatus.status)}`}
            >
              {healthStatus.status === 'healthy' ? (
                <CheckCircle className="w-4 h-4" />
              ) : healthStatus.status === 'degraded' ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              System {healthStatus.status}
            </Badge>
          )}
          <Badge variant="outline" className="flex items-center gap-2 px-3 py-1">
            <Shield className="w-4 h-4" />
            Admin Portal
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-primary" data-testid="text-total-revenue">
                {formatCurrency(stats?.revenue || 0)}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">From paid bookings</p>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-total-users">{stats?.totalUsers || 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.physicians || 0} physicians, {stats?.admins || 0} admins
            </p>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-total-bookings">{stats?.total || 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.pending || 0} pending, {stats?.confirmed || 0} confirmed
            </p>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-completion-rate">
                {stats?.total ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">{stats?.completed || 0} completed</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="monitoring" className="space-y-4">
        <TabsList className="flex flex-wrap gap-1">
          <TabsTrigger value="monitoring" className="flex items-center gap-2" data-testid="tab-admin-monitoring">
            <Activity className="w-4 h-4" />
            System Health
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2" data-testid="tab-admin-analytics">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2" data-testid="tab-admin-audit">
            <FileText className="w-4 h-4" />
            Audit Logs
          </TabsTrigger>
          <TabsTrigger value="crm" className="flex items-center gap-2" data-testid="tab-admin-crm">
            <Link2 className="w-4 h-4" />
            CRM Integration
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2" data-testid="tab-admin-notifications">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex items-center gap-2" data-testid="tab-admin-bookings">
            <CalendarIcon className="w-4 h-4" />
            Bookings
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2" data-testid="tab-admin-users">
            <UserCog className="w-4 h-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2" data-testid="tab-admin-security">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2" data-testid="tab-admin-sessions">
            <Wifi className="w-4 h-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="gdpr" className="flex items-center gap-2" data-testid="tab-admin-gdpr">
            <Lock className="w-4 h-4" />
            GDPR
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2" data-testid="tab-admin-compliance">
            <CheckCircle className="w-4 h-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="lab-imports" className="flex items-center gap-2" data-testid="tab-admin-lab-imports">
            <Database className="w-4 h-4" />
            Lab Imports
          </TabsTrigger>
        </TabsList>

        {/* System Health Tab */}
        <TabsContent value="monitoring" className="space-y-4">
          {/* Header with refresh and demo data controls */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Real-Time System Monitoring
            </h3>
            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    data-testid="button-seed-demo-data"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Seed Demo Data
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Seed Demo Data</DialogTitle>
                    <DialogDescription>
                      Populate the admin dashboard with synthetic demonstration data for all Phase 2 modules.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    {demoDataStatsLoading ? (
                      <div className="space-y-2">
                        {[...Array(8)].map((_, i) => (
                          <Skeleton key={i} className="h-6 w-full" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Analytics Events:</span>
                          <Badge variant="outline">{demoDataStats?.analyticsEvents || 0}</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>CRM Sync Logs:</span>
                          <Badge variant="outline">{demoDataStats?.crmSyncLogs || 0}</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Lab Imports:</span>
                          <Badge variant="outline">{demoDataStats?.labImports || 0}</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Audit Logs:</span>
                          <Badge variant="outline">{demoDataStats?.auditLogs || 0}</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Security Events:</span>
                          <Badge variant="outline">{demoDataStats?.securityEvents || 0}</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>System Metrics:</span>
                          <Badge variant="outline">{demoDataStats?.systemMetrics || 0}</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>GDPR Requests:</span>
                          <Badge variant="outline">{demoDataStats?.gdprRequests || 0}</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Compliance Checks:</span>
                          <Badge variant="outline">{demoDataStats?.complianceChecks || 0}</Badge>
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => seedAllDemoDataMutation.mutate()}
                      disabled={seedAllDemoDataMutation.isPending}
                      data-testid="button-confirm-seed-all"
                    >
                      {seedAllDemoDataMutation.isPending ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Seeding...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Seed All Demo Data
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button 
                variant="outline" 
                onClick={() => refetchRealtimeMetrics()}
                disabled={realtimeMetricsLoading}
                data-testid="button-refresh-realtime-metrics"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${realtimeMetricsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Error state for metrics */}
          {realtimeMetricsError && (
            <Card className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
              <CardContent className="pt-6 flex items-center gap-4">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                <div>
                  <h4 className="font-medium text-red-800 dark:text-red-300">Unable to load real-time metrics</h4>
                  <p className="text-sm text-red-600 dark:text-red-400">There was an error fetching system metrics. Please try refreshing.</p>
                </div>
                <Button variant="outline" onClick={() => refetchRealtimeMetrics()} className="ml-auto">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}

          {/* System Health Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                <CardTitle className="text-sm font-medium">Overall Health</CardTitle>
                <Activity className={`w-4 h-4 ${
                  realtimeMetrics?.systemHealth?.overall === 'healthy' ? 'text-green-600' :
                  realtimeMetrics?.systemHealth?.overall === 'degraded' ? 'text-amber-500' : 'text-red-600'
                }`} />
              </CardHeader>
              <CardContent>
                {realtimeMetricsLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : realtimeMetricsError ? (
                  <div className="text-lg font-bold text-muted-foreground">N/A</div>
                ) : (
                  <>
                    <div className={`text-lg font-bold capitalize ${
                      realtimeMetrics?.systemHealth?.overall === 'healthy' ? 'text-green-600' :
                      realtimeMetrics?.systemHealth?.overall === 'degraded' ? 'text-amber-500' : 'text-red-600'
                    }`}>
                      {realtimeMetrics?.systemHealth?.overall || 'Unknown'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Uptime: {formatUptime(realtimeMetrics?.uptime || 0)}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                <Gauge className={`w-4 h-4 ${getHealthStatusColor(realtimeMetrics?.systemHealth?.cpu?.status || 'unknown')}`} />
              </CardHeader>
              <CardContent>
                {realtimeMetricsLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : realtimeMetricsError ? (
                  <div className="text-lg font-bold text-muted-foreground">N/A</div>
                ) : (
                  <>
                    <div className="text-lg font-bold">{realtimeMetrics?.systemHealth?.cpu?.usage || 0}%</div>
                    <Progress value={realtimeMetrics?.systemHealth?.cpu?.usage || 0} className="mt-2 h-2" />
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                <CardTitle className="text-sm font-medium">Memory</CardTitle>
                <Gauge className={`w-4 h-4 ${getHealthStatusColor(realtimeMetrics?.systemHealth?.memory?.status || 'unknown')}`} />
              </CardHeader>
              <CardContent>
                {realtimeMetricsLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : realtimeMetricsError ? (
                  <div className="text-lg font-bold text-muted-foreground">N/A</div>
                ) : (
                  <>
                    <div className="text-lg font-bold">{realtimeMetrics?.systemHealth?.memory?.usage || 0}%</div>
                    <Progress value={realtimeMetrics?.systemHealth?.memory?.usage || 0} className="mt-2 h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {realtimeMetrics?.systemHealth?.memory?.usedMB || 0}MB / {realtimeMetrics?.systemHealth?.memory?.totalMB || 0}MB
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                <CardTitle className="text-sm font-medium">DB Latency</CardTitle>
                <Database className={`w-4 h-4 ${getHealthStatusColor(realtimeMetrics?.systemHealth?.database?.status || 'unknown')}`} />
              </CardHeader>
              <CardContent>
                {realtimeMetricsLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : realtimeMetricsError ? (
                  <div className="text-lg font-bold text-muted-foreground">N/A</div>
                ) : (
                  <>
                    <div className="text-lg font-bold">{realtimeMetrics?.systemHealth?.database?.latencyMs || 0}ms</div>
                    <p className={`text-xs mt-1 capitalize ${getHealthStatusColor(realtimeMetrics?.systemHealth?.database?.status || 'unknown')}`}>
                      {realtimeMetrics?.systemHealth?.database?.status || 'Unknown'}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                <CardTitle className="text-sm font-medium">Connections</CardTitle>
                <Wifi className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                {realtimeMetricsLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : realtimeMetricsError ? (
                  <div className="text-lg font-bold text-muted-foreground">N/A</div>
                ) : (
                  <>
                    <div className="text-lg font-bold">{realtimeMetrics?.connections?.active || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {realtimeMetrics?.connections?.authenticated || 0} authenticated
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Response Time & Request Metrics */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Response Times
                  </span>
                  {!realtimeMetricsError && (
                    <div className="flex items-center gap-1 text-sm">
                      {realtimeMetrics?.trends?.responseTime === 'up' && <ArrowUp className="w-4 h-4 text-red-500" />}
                      {realtimeMetrics?.trends?.responseTime === 'down' && <ArrowDown className="w-4 h-4 text-green-500" />}
                      {realtimeMetrics?.trends?.responseTime === 'stable' && <Minus className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {realtimeMetricsLoading ? (
                  <Skeleton className="h-48 w-full" />
                ) : realtimeMetricsError ? (
                  <div className="h-48 flex items-center justify-center text-muted-foreground">
                    <p>Unable to load response time data</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-2 bg-muted/50 rounded-lg">
                        <div className="text-xl font-bold">{realtimeMetrics?.responseTimes?.avg || 0}ms</div>
                        <p className="text-xs text-muted-foreground">Avg</p>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded-lg">
                        <div className="text-xl font-bold">{realtimeMetrics?.responseTimes?.p50 || 0}ms</div>
                        <p className="text-xs text-muted-foreground">P50</p>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded-lg">
                        <div className="text-xl font-bold text-amber-600">{realtimeMetrics?.responseTimes?.p95 || 0}ms</div>
                        <p className="text-xs text-muted-foreground">P95</p>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded-lg">
                        <div className="text-xl font-bold text-red-600">{realtimeMetrics?.responseTimes?.p99 || 0}ms</div>
                        <p className="text-xs text-muted-foreground">P99</p>
                      </div>
                    </div>
                    {realtimeMetrics?.responseTimes?.history && realtimeMetrics.responseTimes.history.length > 0 ? (
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={realtimeMetrics.responseTimes.history.map((h, i) => ({
                            ...h,
                            time: format(new Date(h.timestamp), 'HH:mm')
                          }))}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="time" className="text-xs" />
                            <YAxis className="text-xs" />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="avg" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" name="Avg" />
                            <Area type="monotone" dataKey="p95" stroke="hsl(45, 93%, 47%)" fill="hsl(45, 93%, 47%, 0.2)" name="P95" />
                            <Area type="monotone" dataKey="p99" stroke="hsl(0, 84%, 60%)" fill="hsl(0, 84%, 60%, 0.2)" name="P99" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-48 flex items-center justify-center text-muted-foreground">
                        <p>No history data available yet</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Request Metrics
                  </span>
                  {!realtimeMetricsError && (
                    <div className="flex items-center gap-1 text-sm">
                      {realtimeMetrics?.trends?.errorRate === 'up' && <ArrowUp className="w-4 h-4 text-red-500" />}
                      {realtimeMetrics?.trends?.errorRate === 'down' && <ArrowDown className="w-4 h-4 text-green-500" />}
                      {realtimeMetrics?.trends?.errorRate === 'stable' && <Minus className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {realtimeMetricsLoading ? (
                  <Skeleton className="h-48 w-full" />
                ) : realtimeMetricsError ? (
                  <div className="h-48 flex items-center justify-center text-muted-foreground">
                    <p>Unable to load request metrics</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold">{realtimeMetrics?.requestMetrics?.total || 0}</div>
                        <p className="text-xs text-muted-foreground">Total Requests</p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold">{realtimeMetrics?.requestMetrics?.perMinute || 0}</div>
                        <p className="text-xs text-muted-foreground">Per Minute</p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{realtimeMetrics?.requestMetrics?.errors || 0}</div>
                        <p className="text-xs text-muted-foreground">Errors</p>
                      </div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium mb-2">Error Rate</p>
                      <div className="flex items-center gap-4">
                        <div className={`text-2xl font-bold ${
                          (realtimeMetrics?.requestMetrics?.errorRate || 0) > 5 ? 'text-red-600' :
                          (realtimeMetrics?.requestMetrics?.errorRate || 0) > 1 ? 'text-amber-500' : 'text-green-600'
                        }`}>
                          {realtimeMetrics?.requestMetrics?.errorRate || 0}%
                        </div>
                        <Progress 
                          value={Math.min(realtimeMetrics?.requestMetrics?.errorRate || 0, 100)} 
                          className="flex-1 h-3"
                        />
                      </div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium mb-2">Status Breakdown</p>
                      <div className="flex gap-4 flex-wrap">
                        {Object.entries(realtimeMetrics?.requestMetrics?.byStatus || {}).map(([status, count]) => (
                          <Badge key={status} variant={status.startsWith('2') ? 'default' : status.startsWith('4') ? 'secondary' : 'destructive'}>
                            {status}: {count}
                          </Badge>
                        ))}
                        {Object.keys(realtimeMetrics?.requestMetrics?.byStatus || {}).length === 0 && (
                          <span className="text-muted-foreground text-sm">No data</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Alert Rules & History */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Alert Rules
                  </span>
                  <Dialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" onClick={() => {
                        setEditingAlertRule(null);
                        setAlertFormData({
                          name: '', description: '', metricType: 'response_time_avg', operator: 'gt',
                          threshold: 0, severity: 'warning', cooldownMinutes: 5, isEnabled: true,
                        });
                      }} data-testid="button-add-alert-rule">
                        <Plus className="w-4 h-4 mr-1" />
                        Add Rule
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>{editingAlertRule ? 'Edit Alert Rule' : 'Create Alert Rule'}</DialogTitle>
                        <DialogDescription>Configure when this alert should trigger.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="alert-name">Name</Label>
                          <Input
                            id="alert-name"
                            value={alertFormData.name}
                            onChange={(e) => setAlertFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="High CPU Usage Alert"
                            data-testid="input-alert-name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="alert-metric">Metric Type</Label>
                          <Select value={alertFormData.metricType} onValueChange={(v) => setAlertFormData(prev => ({ ...prev, metricType: v }))}>
                            <SelectTrigger id="alert-metric" data-testid="select-alert-metric">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cpu_usage">CPU Usage (%)</SelectItem>
                              <SelectItem value="memory_usage">Memory Usage (%)</SelectItem>
                              <SelectItem value="db_latency">DB Latency (ms)</SelectItem>
                              <SelectItem value="response_time_avg">Avg Response Time (ms)</SelectItem>
                              <SelectItem value="response_time_p95">P95 Response Time (ms)</SelectItem>
                              <SelectItem value="response_time_p99">P99 Response Time (ms)</SelectItem>
                              <SelectItem value="error_rate">Error Rate (%)</SelectItem>
                              <SelectItem value="request_rate">Request Rate (/min)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="alert-operator">Condition</Label>
                            <Select value={alertFormData.operator} onValueChange={(v) => setAlertFormData(prev => ({ ...prev, operator: v }))}>
                              <SelectTrigger id="alert-operator" data-testid="select-alert-operator">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="gt">Greater than</SelectItem>
                                <SelectItem value="gte">Greater or equal</SelectItem>
                                <SelectItem value="lt">Less than</SelectItem>
                                <SelectItem value="lte">Less or equal</SelectItem>
                                <SelectItem value="eq">Equals</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="alert-threshold">Threshold</Label>
                            <Input
                              id="alert-threshold"
                              type="number"
                              value={alertFormData.threshold}
                              onChange={(e) => setAlertFormData(prev => ({ ...prev, threshold: parseFloat(e.target.value) || 0 }))}
                              data-testid="input-alert-threshold"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="alert-severity">Severity</Label>
                            <Select value={alertFormData.severity} onValueChange={(v: 'info' | 'warning' | 'critical') => setAlertFormData(prev => ({ ...prev, severity: v }))}>
                              <SelectTrigger id="alert-severity" data-testid="select-alert-severity">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="info">Info</SelectItem>
                                <SelectItem value="warning">Warning</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="alert-cooldown">Cooldown (min)</Label>
                            <Input
                              id="alert-cooldown"
                              type="number"
                              value={alertFormData.cooldownMinutes}
                              onChange={(e) => setAlertFormData(prev => ({ ...prev, cooldownMinutes: parseInt(e.target.value) || 5 }))}
                              data-testid="input-alert-cooldown"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={alertFormData.isEnabled}
                            onCheckedChange={(v) => setAlertFormData(prev => ({ ...prev, isEnabled: v }))}
                            data-testid="switch-alert-enabled"
                          />
                          <Label>Enabled</Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setAlertDialogOpen(false)}>Cancel</Button>
                        <Button 
                          onClick={() => {
                            if (editingAlertRule) {
                              updateAlertRuleMutation.mutate({ id: editingAlertRule.id, data: alertFormData });
                            } else {
                              createAlertRuleMutation.mutate(alertFormData);
                            }
                          }}
                          disabled={createAlertRuleMutation.isPending || updateAlertRuleMutation.isPending}
                          data-testid="button-save-alert-rule"
                        >
                          {editingAlertRule ? 'Update' : 'Create'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
                <CardDescription>Configure threshold-based monitoring alerts</CardDescription>
              </CardHeader>
              <CardContent>
                {alertRulesLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                  </div>
                ) : alertRules.rules.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No alert rules configured</p>
                  </div>
                ) : (
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {alertRules.rules.map((rule) => (
                        <div key={rule.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg" data-testid={`alert-rule-${rule.id}`}>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{rule.name}</span>
                              <Badge variant={rule.severity === 'critical' ? 'destructive' : rule.severity === 'warning' ? 'default' : 'secondary'} className="text-xs">
                                {rule.severity}
                              </Badge>
                              {!rule.isEnabled && <Badge variant="outline" className="text-xs">Disabled</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {rule.metricType.replace(/_/g, ' ')} {rule.operator} {rule.threshold}
                              {rule.triggerCount > 0 && ` • Triggered ${rule.triggerCount}x`}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingAlertRule(rule);
                                setAlertFormData({
                                  name: rule.name,
                                  description: rule.description || '',
                                  metricType: rule.metricType,
                                  operator: rule.operator,
                                  threshold: rule.threshold,
                                  severity: rule.severity,
                                  cooldownMinutes: rule.cooldownMinutes,
                                  isEnabled: rule.isEnabled,
                                });
                                setAlertDialogOpen(true);
                              }}
                              data-testid={`button-edit-rule-${rule.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteAlertRuleMutation.mutate(rule.id)}
                              disabled={deleteAlertRuleMutation.isPending}
                              data-testid={`button-delete-rule-${rule.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Alert History
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => refetchAlertHistory()} data-testid="button-refresh-alert-history">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </CardTitle>
                <CardDescription>Recent triggered alerts and their status</CardDescription>
              </CardHeader>
              <CardContent>
                {alertHistoryLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                  </div>
                ) : alertHistory.alerts.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50 text-green-600" />
                    <p>No alerts triggered</p>
                  </div>
                ) : (
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {alertHistory.alerts.map((alert) => (
                        <div key={alert.id} className="p-3 bg-muted/50 rounded-lg" data-testid={`alert-history-${alert.id}`}>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Badge variant={
                                alert.severity === 'critical' ? 'destructive' : 
                                alert.severity === 'warning' ? 'default' : 'secondary'
                              } className="text-xs">
                                {alert.severity}
                              </Badge>
                              <Badge variant={
                                alert.status === 'resolved' ? 'outline' :
                                alert.status === 'acknowledged' ? 'secondary' : 'destructive'
                              } className="text-xs">
                                {alert.status}
                              </Badge>
                            </div>
                            {alert.status === 'active' && (
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => acknowledgeAlertMutation.mutate(alert.id)}
                                  disabled={acknowledgeAlertMutation.isPending}
                                  data-testid={`button-ack-alert-${alert.id}`}
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  Ack
                                </Button>
                              </div>
                            )}
                          </div>
                          <p className="font-medium text-sm mt-2">{alert.ruleName}</p>
                          <p className="text-xs text-muted-foreground">{alert.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Search Index Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Search Index
              </CardTitle>
              <CardDescription>Manage the platform search index</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-muted-foreground">Version: {healthStatus?.version || '1.0.0'}</span>
                </div>
              </div>
              <Button 
                onClick={() => reindexSearchMutation.mutate()}
                disabled={reindexSearchMutation.isPending}
                data-testid="button-reindex-search"
              >
                {reindexSearchMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Rebuilding...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Rebuild Search Index
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-lg font-semibold">Analytics Dashboard</h3>
            <div className="flex items-center gap-3 flex-wrap">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal" data-testid="button-date-range">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(analyticsDateRange.from, "MMM d, yyyy")} - {format(analyticsDateRange.to, "MMM d, yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <div className="flex gap-2 p-3">
                    <div>
                      <p className="text-sm font-medium mb-2">Start Date</p>
                      <CalendarComponent
                        mode="single"
                        selected={analyticsDateRange.from}
                        onSelect={(date) => date && setAnalyticsDateRange(prev => ({ ...prev, from: date }))}
                        initialFocus
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">End Date</p>
                      <CalendarComponent
                        mode="single"
                        selected={analyticsDateRange.to}
                        onSelect={(date) => date && setAnalyticsDateRange(prev => ({ ...prev, to: date }))}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 p-3 border-t">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setAnalyticsDateRange({
                        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                        to: new Date()
                      })}
                    >
                      Last 7 days
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setAnalyticsDateRange({
                        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                        to: new Date()
                      })}
                    >
                      Last 30 days
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setAnalyticsDateRange({
                        from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
                        to: new Date()
                      })}
                    >
                      Last 90 days
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <RealTimeActiveUsersCard
              count={activeUsersData?.count || 0}
              isLoading={activeUsersLoading}
              onRefresh={() => refetchActiveUsers()}
            />
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold" data-testid="text-analytics-total-users">{analyticsDashboard?.summary?.totalUsers || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {analyticsDashboard?.summary?.newUsersToday || 0} new today
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                <CardTitle className="text-sm font-medium">Avg Health Score</CardTitle>
                <Heart className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-primary" data-testid="text-analytics-health-score">
                      {analyticsDashboard?.summary?.avgHealthScore?.toFixed(1) || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Platform average</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                <CardTitle className="text-sm font-medium">Protocols</CardTitle>
                <FileText className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold" data-testid="text-analytics-protocols">{analyticsDashboard?.summary?.totalProtocols || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">AI generated</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                <MousePointer className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold" data-testid="text-analytics-engagement">
                      {analyticsDashboard?.trends?.engagementRate ? (analyticsDashboard.trends.engagementRate * 100).toFixed(1) : 0}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Daily active rate</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <PageViewTrendsChart
              data={pageViewTrends ?? []}
              isLoading={trendsLoading}
            />
            <TopPagesChart
              data={topPages ?? []}
              isLoading={topPagesLoading}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ConversionFunnelChart
              data={enhancedFunnel ?? []}
              isLoading={enhancedFunnelLoading}
            />
            <ActivityHeatmap
              data={activityHeatmap ?? []}
              isLoading={heatmapLoading}
            />
          </div>

          <DataRetentionSettings
            settings={dataRetentionSettings}
            isLoading={retentionLoading}
            onCleanup={(days) => cleanupDataMutation.mutate(days)}
          />
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Audit Trail
                  </CardTitle>
                  <CardDescription>HIPAA-compliant activity logging</CardDescription>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={showPhiOnly} 
                      onCheckedChange={setShowPhiOnly}
                      data-testid="switch-phi-only"
                    />
                    <Label className="text-sm flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      PHI Access Only
                    </Label>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search logs..."
                      value={auditSearchTerm}
                      onChange={(e) => setAuditSearchTerm(e.target.value)}
                      className="pl-9 w-[200px]"
                      data-testid="input-audit-search"
                    />
                  </div>
                  <Select value={selectedResourceType} onValueChange={setSelectedResourceType}>
                    <SelectTrigger className="w-[150px]" data-testid="select-audit-resource">
                      <SelectValue placeholder="Resource Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Resources</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="biomarker">Biomarker</SelectItem>
                      <SelectItem value="protocol">Protocol</SelectItem>
                      <SelectItem value="booking">Booking</SelectItem>
                      <SelectItem value="appointment">Appointment</SelectItem>
                      <SelectItem value="consent">Consent</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={() => refetchAudit()} data-testid="button-refresh-audit">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4 mb-6">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{auditSummary?.totalActions || 0}</div>
                  <p className="text-xs text-muted-foreground">Total Actions</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-amber-600">{auditSummary?.phiAccessCount || 0}</div>
                  <p className="text-xs text-muted-foreground">PHI Access</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{auditSummary?.failedActions || 0}</div>
                  <p className="text-xs text-muted-foreground">Failed Actions</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{auditSummary?.topUsers?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">Active Users</p>
                </div>
              </div>

              {auditLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredAuditLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No audit logs found</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {filteredAuditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        data-testid={`audit-log-${log.id}`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <Badge className={getActionColor(log.action)}>
                              {log.action}
                            </Badge>
                            <Badge variant="outline">{log.resourceType}</Badge>
                            {log.phiAccessed && (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                PHI
                              </Badge>
                            )}
                            <span className="font-mono text-xs text-muted-foreground truncate max-w-[150px]">
                              {log.resourceId}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="font-mono text-xs truncate max-w-[100px]">{log.userId}</span>
                            <span title={log.timestamp}>
                              {log.timestamp ? formatDistanceToNow(new Date(log.timestamp), { addSuffix: true }) : 'Unknown'}
                            </span>
                          </div>
                        </div>
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <div className="mt-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded font-mono">
                            {JSON.stringify(log.metadata, null, 2).slice(0, 200)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CRM Integration Tab */}
        <TabsContent value="crm" className="space-y-4">
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Link2 className="w-5 h-5" />
                    CRM Integration
                  </CardTitle>
                  <CardDescription>Sync users and bookings to your CRM platform</CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Select value={selectedCrmProvider} onValueChange={setSelectedCrmProvider}>
                    <SelectTrigger className="w-[180px]" data-testid="select-crm-provider">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hubspot">
                        <div className="flex items-center gap-2">
                          <SiHubspot className="w-4 h-4 text-orange-500" />
                          HubSpot
                        </div>
                      </SelectItem>
                      <SelectItem value="zoho">
                        <div className="flex items-center gap-2">
                          <SiZoho className="w-4 h-4 text-red-500" />
                          Zoho CRM
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={() => testCrmConnectionMutation.mutate(selectedCrmProvider)}
                    disabled={testCrmConnectionMutation.isPending}
                    data-testid="button-test-crm-connection"
                  >
                    {testCrmConnectionMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Wifi className="w-4 h-4 mr-2" />
                    )}
                    Test Connection
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                <CardTitle className="text-sm font-medium">
                  {selectedCrmProvider === 'hubspot' ? 'HubSpot' : 'Zoho CRM'}
                </CardTitle>
                {selectedCrmProvider === 'hubspot' ? (
                  <SiHubspot className="w-5 h-5 text-orange-500" />
                ) : (
                  <SiZoho className="w-5 h-5 text-red-500" />
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {crmStatus?.configured || crmProviders?.configured?.[selectedCrmProvider as keyof typeof crmProviders.configured] ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-lg font-semibold text-green-600">Connected</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-muted-foreground" />
                      <span className="text-lg font-semibold text-muted-foreground">Not Configured</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {crmSyncStats?.lastSyncAt 
                    ? `Last sync: ${formatDistanceToNow(new Date(crmSyncStats.lastSyncAt), { addSuffix: true })}`
                    : 'No syncs yet'
                  }
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                <CardTitle className="text-sm font-medium">Total Syncs</CardTitle>
                <CheckCircle className="w-4 h-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{crmSyncStats?.successfulSyncs || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">of {crmSyncStats?.totalSyncs || 0} total</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="w-4 h-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">{crmSyncStats?.pendingSyncs || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Awaiting sync</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                <CardTitle className="text-sm font-medium">Failed</CardTitle>
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{crmSyncStats?.failedSyncs || 0}</div>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-muted-foreground">Need attention</p>
                  {(crmSyncStats?.failedSyncs || 0) > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => retryAllFailedMutation.mutate(selectedCrmProvider)}
                      disabled={retryAllFailedMutation.isPending}
                      className="h-6 text-xs"
                      data-testid="button-retry-all-failed"
                    >
                      {retryAllFailedMutation.isPending ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <>
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Retry All
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Bulk Sync
                </CardTitle>
                <CardDescription>Sync all data to {selectedCrmProvider === 'hubspot' ? 'HubSpot' : 'Zoho CRM'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={() => syncAllCrmMutation.mutate({ provider: selectedCrmProvider, resourceType: 'users' })}
                    disabled={syncAllCrmMutation.isPending}
                    variant="outline"
                    className="w-full justify-start"
                    data-testid="button-sync-all-users"
                  >
                    {syncAllCrmMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Users className="w-4 h-4 mr-2" />
                    )}
                    Sync All Users ({users.length})
                  </Button>
                  <Button 
                    onClick={() => syncAllCrmMutation.mutate({ provider: selectedCrmProvider, resourceType: 'bookings' })}
                    disabled={syncAllCrmMutation.isPending}
                    variant="outline"
                    className="w-full justify-start"
                    data-testid="button-sync-all-bookings"
                  >
                    {syncAllCrmMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CalendarIcon className="w-4 h-4 mr-2" />
                    )}
                    Sync All Bookings ({bookings.length})
                  </Button>
                  <Button 
                    onClick={() => syncAllCrmMutation.mutate({ provider: selectedCrmProvider })}
                    disabled={syncAllCrmMutation.isPending}
                    className="w-full"
                    data-testid="button-sync-all"
                  >
                    {syncAllCrmMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Sync Everything
                  </Button>
                </div>

                {!(crmProviders?.configured?.[selectedCrmProvider as keyof typeof crmProviders.configured]) && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                          {selectedCrmProvider === 'hubspot' ? 'HubSpot' : 'Zoho CRM'} Not Configured
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                          {selectedCrmProvider === 'hubspot' 
                            ? 'Add HUBSPOT_API_KEY to secrets.'
                            : 'Add Zoho OAuth credentials.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Individual Sync
                </CardTitle>
                <CardDescription>Sync specific records</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Sync User</Label>
                  <div className="flex gap-2">
                    <Select>
                      <SelectTrigger className="flex-1" data-testid="select-crm-user">
                        <SelectValue placeholder="Select user..." />
                      </SelectTrigger>
                      <SelectContent>
                        {users.slice(0, 10).map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      size="icon"
                      onClick={() => {
                        if (users[0]) syncCrmUserMutation.mutate({ userId: users[0].id, provider: selectedCrmProvider });
                      }}
                      disabled={syncCrmUserMutation.isPending}
                      data-testid="button-sync-user-crm"
                    >
                      {syncCrmUserMutation.isPending ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Sync Booking</Label>
                  <div className="flex gap-2">
                    <Select>
                      <SelectTrigger className="flex-1" data-testid="select-crm-booking">
                        <SelectValue placeholder="Select booking..." />
                      </SelectTrigger>
                      <SelectContent>
                        {bookings.slice(0, 10).map(booking => (
                          <SelectItem key={booking.id} value={booking.id}>
                            {booking.bookingNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      size="icon"
                      onClick={() => {
                        if (bookings[0]) syncCrmBookingMutation.mutate({ bookingId: bookings[0].id, provider: selectedCrmProvider });
                      }}
                      disabled={syncCrmBookingMutation.isPending}
                      data-testid="button-sync-booking-crm"
                    >
                      {syncCrmBookingMutation.isPending ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Sync Stats by Type
                </CardTitle>
                <CardDescription>Breakdown by resource type</CardDescription>
              </CardHeader>
              <CardContent>
                {crmSyncStats?.syncsByResourceType && crmSyncStats.syncsByResourceType.length > 0 ? (
                  <div className="space-y-3">
                    {crmSyncStats.syncsByResourceType.map((stat) => (
                      <div key={stat.type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {stat.type === 'contact' ? (
                            <Users className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className="text-sm capitalize">{stat.type}s</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">{stat.count} total</Badge>
                          {stat.failed > 0 && (
                            <Badge variant="destructive" className="text-xs">{stat.failed} failed</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No sync data yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Sync History
                </CardTitle>
                <CardDescription>Recent synchronization activity for {selectedCrmProvider === 'hubspot' ? 'HubSpot' : 'Zoho CRM'}</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ["/api/crm/history"] });
                  queryClient.invalidateQueries({ queryKey: ["/api/admin/crm/sync-stats"] });
                }}
                data-testid="button-refresh-crm-history"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {crmHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Link2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No sync history for {selectedCrmProvider === 'hubspot' ? 'HubSpot' : 'Zoho CRM'} yet</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Resource ID</TableHead>
                        <TableHead>Synced At</TableHead>
                        <TableHead>Error</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {crmHistory.slice(0, 20).map((log) => (
                        <TableRow key={log.id} data-testid={`crm-log-row-${log.id}`}>
                          <TableCell>
                            <Badge className={getCrmSyncStatusColor(log.status)}>
                              {log.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {log.provider === 'hubspot' ? (
                                <SiHubspot className="w-4 h-4 text-orange-500" />
                              ) : (
                                <SiZoho className="w-4 h-4 text-red-500" />
                              )}
                              <span className="capitalize">{log.provider}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">{log.resourceType}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-xs truncate max-w-[120px] block" title={log.resourceId}>
                              {log.resourceId?.slice(0, 12)}...
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {log.syncedAt ? formatDistanceToNow(new Date(log.syncedAt), { addSuffix: true }) : 'Pending'}
                            </span>
                          </TableCell>
                          <TableCell>
                            {log.errorMessage ? (
                              <span className="text-xs text-red-600 truncate max-w-[150px] block" title={log.errorMessage}>
                                {log.errorMessage.slice(0, 30)}...
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {log.status === 'failed' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => retryCrmSyncMutation.mutate(log.id)}
                                disabled={retryCrmSyncMutation.isPending}
                                data-testid={`button-retry-sync-${log.id}`}
                              >
                                {retryCrmSyncMutation.isPending ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <RotateCcw className="w-3 h-3" />
                                )}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Notification Templates
                  </CardTitle>
                  <CardDescription>Manage email, SMS, and push notification templates</CardDescription>
                </div>
                <Button 
                  onClick={() => {
                    setEditingTemplate(null);
                    setTemplateDialogOpen(true);
                  }}
                  data-testid="button-add-template"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card className="bg-muted/50">
                  <CardContent className="p-4 text-center">
                    <Mail className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold">8</div>
                    <p className="text-xs text-muted-foreground">Email Templates</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="p-4 text-center">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold">4</div>
                    <p className="text-xs text-muted-foreground">SMS Templates</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="p-4 text-center">
                    <Bell className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <div className="text-2xl font-bold">6</div>
                    <p className="text-xs text-muted-foreground">Push Templates</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                {[
                  { id: '1', name: 'Welcome Email', type: 'email', subject: 'Welcome to AIWO Healthcation!', isActive: true },
                  { id: '2', name: 'Booking Confirmation', type: 'email', subject: 'Your retreat booking is confirmed', isActive: true },
                  { id: '3', name: 'Appointment Reminder', type: 'sms', subject: null, isActive: true },
                  { id: '4', name: 'Protocol Generated', type: 'push', subject: null, isActive: true },
                  { id: '5', name: 'Weekly Health Digest', type: 'email', subject: 'Your Weekly Health Summary', isActive: false },
                ].map((template) => (
                  <div
                    key={template.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors flex items-center justify-between gap-4"
                    data-testid={`template-${template.id}`}
                  >
                    <div className="flex items-center gap-4">
                      {template.type === 'email' ? (
                        <Mail className="w-5 h-5 text-blue-600" />
                      ) : template.type === 'sms' ? (
                        <MessageSquare className="w-5 h-5 text-green-600" />
                      ) : (
                        <Bell className="w-5 h-5 text-purple-600" />
                      )}
                      <div>
                        <p className="font-medium">{template.name}</p>
                        {template.subject && (
                          <p className="text-sm text-muted-foreground">{template.subject}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={template.isActive ? "default" : "secondary"}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button variant="ghost" size="icon" data-testid={`button-edit-template-${template.id}`}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Bookings by Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(locationStats).length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No booking data yet</p>
                  ) : (
                    Object.entries(locationStats).map(([location, count]) => (
                      <div key={location} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{location}</span>
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">{stats?.confirmed || 0}</div>
                    <p className="text-sm text-muted-foreground">Confirmed</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-3xl font-bold text-amber-600">{stats?.pending || 0}</div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">{stats?.completed || 0}</div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-3xl font-bold text-primary">{stats?.physicians || 0}</div>
                    <p className="text-sm text-muted-foreground">Physicians</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Bookings</CardTitle>
              <CardDescription>Manage and update booking statuses, process refunds</CardDescription>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-4" />
                  <p>No bookings yet</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="p-4 border rounded-lg hover-elevate"
                        data-testid={`admin-booking-${booking.id}`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-medium">{booking.bookingNumber}</span>
                              <Badge className={getStatusColor(booking.status || 'pending')}>
                                {booking.status}
                              </Badge>
                              <Badge variant={booking.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                                {booking.paymentStatus}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {booking.programType?.replace(/_/g, ' ')} at {booking.locationName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {booking.startDate && format(new Date(booking.startDate), "PPP")} - {booking.endDate && format(new Date(booking.endDate), "PPP")}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="text-lg font-bold">{formatCurrency(booking.totalAmount || 0)}</div>
                            <div className="flex items-center gap-2">
                              <Select
                                value={booking.status || 'pending'}
                                onValueChange={(value) => updateBookingMutation.mutate({ id: booking.id, data: { status: value as any } })}
                              >
                                <SelectTrigger className="w-[140px]" data-testid={`select-status-${booking.id}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-4 h-4" />
                                      Pending
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="confirmed">
                                    <div className="flex items-center gap-2">
                                      <CheckCircle className="w-4 h-4" />
                                      Confirmed
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="in_progress">
                                    <div className="flex items-center gap-2">
                                      <TrendingUp className="w-4 h-4" />
                                      In Progress
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="completed">
                                    <div className="flex items-center gap-2">
                                      <CheckCircle className="w-4 h-4" />
                                      Completed
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="cancelled">
                                    <div className="flex items-center gap-2">
                                      <XCircle className="w-4 h-4" />
                                      Cancelled
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              {booking.paymentStatus === 'paid' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleRefundClick(booking)}
                                  data-testid={`button-refund-${booking.id}`}
                                >
                                  <RotateCcw className="w-4 h-4 mr-1" />
                                  Refund
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user roles and permissions, sync to CRM</CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4" />
                  <p>No users registered yet</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover-elevate flex-wrap gap-2"
                        data-testid={`admin-user-${user.id}`}
                      >
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={user.profileImageUrl || undefined} />
                            <AvatarFallback>
                              {user.firstName?.[0] || user.email?.[0] || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {user.firstName && user.lastName
                                ? `${user.firstName} ${user.lastName}`
                                : user.email}
                            </p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">
                            Joined {format(new Date(user.createdAt!), "MMM yyyy")}
                          </Badge>
                          <Select
                            value={user.role || 'user'}
                            onValueChange={(value) => updateRoleMutation.mutate({ userId: user.id, role: value })}
                          >
                            <SelectTrigger className="w-[130px]" data-testid={`select-role-${user.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  User
                                </div>
                              </SelectItem>
                              <SelectItem value="physician">
                                <div className="flex items-center gap-2">
                                  <UserCog className="w-4 h-4" />
                                  Physician
                                </div>
                              </SelectItem>
                              <SelectItem value="admin">
                                <div className="flex items-center gap-2">
                                  <Shield className="w-4 h-4" />
                                  Admin
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => syncCrmUserMutation.mutate({ userId: user.id, provider: selectedCrmProvider })}
                            disabled={syncCrmUserMutation.isPending}
                            title="Sync to CRM"
                            data-testid={`button-sync-crm-${user.id}`}
                          >
                            <Link2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Security Center</h3>
            <Button onClick={() => refetchSecurity()} variant="outline" size="sm" data-testid="button-refresh-security">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                <CardTitle className="text-sm font-medium">Threat Level</CardTitle>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                {securityLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <Badge 
                    variant={securityDashboard?.threatSummary?.activeThreatLevel === 'low' ? 'outline' : 'destructive'}
                    className="text-lg"
                    data-testid="badge-threat-level"
                  >
                    {securityDashboard?.threatSummary?.activeThreatLevel || 'Low'}
                  </Badge>
                )}
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                <CardTitle className="text-sm font-medium">Failed Logins (24h)</CardTitle>
                <Lock className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {securityLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold" data-testid="text-failed-logins">
                    {securityDashboard?.metrics?.failedLogins || 0}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
                <WifiOff className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {securityLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold" data-testid="text-blocked-ips">
                    {securityDashboard?.threatSummary?.blockedIpCount || 0}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
                <Shield className="w-4 h-4 text-destructive" />
              </CardHeader>
              <CardContent>
                {securityLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold" data-testid="text-critical-events">
                    {securityDashboard?.metrics?.criticalEvents || 0}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Recent Security Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                {securityEventsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : securityEvents.events.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-emerald-500" />
                    <p>No security events in the last 24 hours</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {securityEvents.events.slice(0, 10).map((event) => (
                        <div 
                          key={event.id} 
                          className="flex items-center justify-between p-3 border rounded-lg"
                          data-testid={`security-event-${event.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant={event.severity === 'critical' ? 'destructive' : event.severity === 'high' ? 'default' : 'outline'}>
                              {event.severity}
                            </Badge>
                            <div>
                              <p className="text-sm font-medium">{event.eventType}</p>
                              <p className="text-xs text-muted-foreground">{event.ipAddress || 'Unknown IP'}</p>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  IP Access Rules
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ipRulesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : ipRules.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Globe className="w-12 h-12 mx-auto mb-4" />
                    <p>No IP access rules configured</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {ipRules.map((rule) => (
                        <div 
                          key={rule.id} 
                          className="flex items-center justify-between p-3 border rounded-lg"
                          data-testid={`ip-rule-${rule.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant={rule.ruleType === 'block' ? 'destructive' : 'outline'}>
                              {rule.ruleType}
                            </Badge>
                            <div>
                              <p className="text-sm font-medium font-mono">{rule.ipAddress}</p>
                              <p className="text-xs text-muted-foreground">{rule.reason}</p>
                            </div>
                          </div>
                          <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>

          {securityDashboard?.threatSummary?.recommendations && securityDashboard.threatSummary.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Security Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {securityDashboard.threatSummary.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-1 text-emerald-500 shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Active Sessions</h3>
            <Button onClick={() => refetchSessions()} variant="outline" size="sm" data-testid="button-refresh-sessions">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                <Wifi className="w-4 h-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                {sessionStatsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold" data-testid="text-active-sessions">
                    {sessionStats?.activeSessions || sessionsData.sessions.length}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {sessionStatsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold" data-testid="text-unique-users">
                    {sessionStats?.uniqueUsers || 0}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                <CardTitle className="text-sm font-medium">Avg Session Duration</CardTitle>
                <Clock className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {sessionStatsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold" data-testid="text-avg-duration">
                    {sessionStats?.avgSessionDuration ? `${Math.round(sessionStats.avgSessionDuration / 60)}m` : 'N/A'}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                <CardTitle className="text-sm font-medium">Total Sessions Today</CardTitle>
                <Activity className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {sessionsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold" data-testid="text-total-sessions">
                    {sessionsData.total}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>View and manage all active user sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {sessionsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : sessionsData.sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Wifi className="w-12 h-12 mx-auto mb-4" />
                  <p>No active sessions</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {sessionsData.sessions.map((session) => (
                      <div 
                        key={session.id} 
                        className="flex items-center justify-between p-4 border rounded-lg hover-elevate flex-wrap gap-2"
                        data-testid={`session-${session.id}`}
                      >
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarFallback>
                              {session.user?.firstName?.[0] || session.userId?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {session.user?.firstName && session.user?.lastName
                                ? `${session.user.firstName} ${session.user.lastName}`
                                : session.user?.email || session.userId}
                            </p>
                            <p className="text-xs text-muted-foreground">{session.ipAddress || 'Unknown IP'}</p>
                            <p className="text-xs text-muted-foreground">{session.deviceInfo || 'Unknown device'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right text-sm">
                            <p className="text-muted-foreground">Last activity</p>
                            <p>{formatDistanceToNow(new Date(session.lastActivity), { addSuffix: true })}</p>
                          </div>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => terminateSessionMutation.mutate({ sessionId: session.id })}
                            disabled={terminateSessionMutation.isPending}
                            data-testid={`button-terminate-${session.id}`}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Terminate
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* GDPR Tab */}
        <TabsContent value="gdpr" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">GDPR Compliance Center</h3>
            <Button onClick={() => refetchGdprRequests()} variant="outline" size="sm" data-testid="button-refresh-gdpr">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <FileText className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {gdprStatsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold" data-testid="text-gdpr-total">
                    {gdprStats?.totalRequests || 0}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="w-4 h-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                {gdprStatsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold" data-testid="text-gdpr-pending">
                    {gdprStats?.pendingRequests || 0}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                <CardTitle className="text-sm font-medium">Export Requests</CardTitle>
                <Download className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {gdprStatsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold" data-testid="text-gdpr-exports">
                    {gdprStats?.exportRequests || 0}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                <CardTitle className="text-sm font-medium">Deletion Requests</CardTitle>
                <Trash2 className="w-4 h-4 text-destructive" />
              </CardHeader>
              <CardContent>
                {gdprStatsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold" data-testid="text-gdpr-deletions">
                    {gdprStats?.deletionRequests || 0}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Data Subject Requests</CardTitle>
              <CardDescription>Process GDPR data export and deletion requests</CardDescription>
            </CardHeader>
            <CardContent>
              {gdprRequestsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : gdprRequests.requests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4" />
                  <p>No data requests to process</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {gdprRequests.requests.map((request) => (
                      <div 
                        key={request.id} 
                        className="flex items-center justify-between p-4 border rounded-lg hover-elevate flex-wrap gap-2"
                        data-testid={`gdpr-request-${request.id}`}
                      >
                        <div className="flex items-center gap-4">
                          <Badge variant={request.requestType === 'deletion' ? 'destructive' : 'outline'}>
                            {request.requestType}
                          </Badge>
                          <div>
                            <p className="font-medium">
                              {request.user?.firstName && request.user?.lastName
                                ? `${request.user.firstName} ${request.user.lastName}`
                                : request.user?.email || request.userId}
                            </p>
                            <p className="text-xs text-muted-foreground">{request.reason || 'No reason provided'}</p>
                            <p className="text-xs text-muted-foreground">
                              Submitted {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={
                            request.status === 'pending' ? 'secondary' :
                            request.status === 'completed' ? 'default' :
                            request.status === 'rejected' ? 'destructive' :
                            'outline'
                          }>
                            {request.status}
                          </Badge>
                          {request.status === 'pending' && (
                            <>
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => processGdprRequestMutation.mutate({ 
                                  requestId: request.id, 
                                  action: request.requestType === 'deletion' ? 'delete' : 'export' 
                                })}
                                disabled={processGdprRequestMutation.isPending}
                                data-testid={`button-process-${request.id}`}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Process
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => processGdprRequestMutation.mutate({ 
                                  requestId: request.id, 
                                  action: 'reject',
                                  reason: 'Rejected by administrator'
                                })}
                                disabled={processGdprRequestMutation.isPending}
                                data-testid={`button-reject-${request.id}`}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Compliance Dashboard</h3>
            <div className="flex gap-2">
              <Select defaultValue="hipaa">
                <SelectTrigger className="w-[150px]" data-testid="select-compliance-type">
                  <SelectValue placeholder="Check type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hipaa">HIPAA</SelectItem>
                  <SelectItem value="soc2">SOC 2</SelectItem>
                  <SelectItem value="iso27001">ISO 27001</SelectItem>
                  <SelectItem value="gdpr">GDPR</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={() => runComplianceCheckMutation.mutate({ checkType: 'hipaa' })}
                disabled={runComplianceCheckMutation.isPending}
                data-testid="button-run-check"
              >
                <Play className="w-4 h-4 mr-2" />
                Run Check
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className={`hover-elevate ${complianceStatus?.hipaa?.status === 'compliant' ? 'border-emerald-500/50' : 'border-amber-500/50'}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                <CardTitle className="text-sm font-medium">HIPAA</CardTitle>
                {complianceStatus?.hipaa?.status === 'compliant' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                )}
              </CardHeader>
              <CardContent>
                {complianceLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold" data-testid="text-hipaa-score">
                      {complianceStatus?.hipaa?.score || 0}%
                    </div>
                    <Progress value={complianceStatus?.hipaa?.score || 0} className="mt-2" />
                  </>
                )}
              </CardContent>
            </Card>
            <Card className={`hover-elevate ${complianceStatus?.soc2?.status === 'compliant' ? 'border-emerald-500/50' : 'border-amber-500/50'}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                <CardTitle className="text-sm font-medium">SOC 2 Type II</CardTitle>
                {complianceStatus?.soc2?.status === 'compliant' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                )}
              </CardHeader>
              <CardContent>
                {complianceLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold" data-testid="text-soc2-score">
                      {complianceStatus?.soc2?.score || 0}%
                    </div>
                    <Progress value={complianceStatus?.soc2?.score || 0} className="mt-2" />
                  </>
                )}
              </CardContent>
            </Card>
            <Card className={`hover-elevate ${complianceStatus?.iso27001?.status === 'compliant' ? 'border-emerald-500/50' : 'border-amber-500/50'}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                <CardTitle className="text-sm font-medium">ISO 27001</CardTitle>
                {complianceStatus?.iso27001?.status === 'compliant' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                )}
              </CardHeader>
              <CardContent>
                {complianceLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold" data-testid="text-iso-score">
                      {complianceStatus?.iso27001?.score || 0}%
                    </div>
                    <Progress value={complianceStatus?.iso27001?.score || 0} className="mt-2" />
                  </>
                )}
              </CardContent>
            </Card>
            <Card className={`hover-elevate ${complianceStatus?.gdpr?.status === 'compliant' ? 'border-emerald-500/50' : 'border-amber-500/50'}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                <CardTitle className="text-sm font-medium">GDPR</CardTitle>
                {complianceStatus?.gdpr?.status === 'compliant' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                )}
              </CardHeader>
              <CardContent>
                {complianceLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold" data-testid="text-gdpr-score">
                      {complianceStatus?.gdpr?.score || 0}%
                    </div>
                    <Progress value={complianceStatus?.gdpr?.score || 0} className="mt-2" />
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle>Overall Compliance Score</CardTitle>
                <CardDescription>Enterprise security and regulatory compliance status</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-emerald-500" data-testid="text-overall-score">
                  {complianceStatus?.overallScore || 0}%
                </div>
                <p className="text-sm text-muted-foreground">Compliant</p>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={complianceStatus?.overallScore || 0} className="h-4" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Compliance Checks</CardTitle>
            </CardHeader>
            <CardContent>
              {complianceChecks.checks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4" />
                  <p>No compliance checks performed yet</p>
                </div>
              ) : (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {complianceChecks.checks.map((check) => (
                      <div 
                        key={check.id} 
                        className="flex items-center justify-between p-3 border rounded-lg"
                        data-testid={`compliance-check-${check.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant={check.status === 'pass' ? 'default' : 'destructive'}>
                            {check.checkType.toUpperCase()}
                          </Badge>
                          <div>
                            <p className="text-sm font-medium">Score: {check.score}%</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(check.completedAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <Badge variant={check.status === 'pass' ? 'outline' : 'destructive'}>
                          {check.status === 'pass' ? 'Passed' : 'Failed'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lab Imports Tab */}
        <TabsContent value="lab-imports" className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Database className="w-5 h-5" />
              Lab Integration Management
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setValidationRulesDialogOpen(true)}
                data-testid="button-validation-rules"
              >
                <Settings className="w-4 h-4 mr-2" />
                Validation Rules
              </Button>
              <Button
                onClick={() => setManualImportDialogOpen(true)}
                data-testid="button-manual-import"
              >
                <Upload className="w-4 h-4 mr-2" />
                Manual Import
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                <CardTitle className="text-sm font-medium">Total Imports</CardTitle>
                <Database className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {labImportStatsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold" data-testid="text-total-imports">
                    {labImportStats?.total || 0}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                <Clock className="w-4 h-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                {labImportStatsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold text-amber-500" data-testid="text-pending-imports">
                    {labImportStats?.pending || 0}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                <CardTitle className="text-sm font-medium">Processed</CardTitle>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                {labImportStatsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold text-emerald-500" data-testid="text-processed-imports">
                    {labImportStats?.processed || 0}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
                <CardTitle className="text-sm font-medium">Errors</CardTitle>
                <XCircle className="w-4 h-4 text-red-500" />
              </CardHeader>
              <CardContent>
                {labImportStatsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold text-red-500" data-testid="text-error-imports">
                    {labImportStats?.error || 0}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {pendingLabImports.length > 0 && (
            <Card className="border-amber-500/50">
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    Imports Pending Review
                  </CardTitle>
                  <CardDescription>These imports require clinician review before processing</CardDescription>
                </div>
                <Badge variant="secondary">{pendingLabImports.length} pending</Badge>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {pendingLabImports.map((imp) => (
                      <div
                        key={imp.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                        data-testid={`pending-import-${imp.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{imp.labPartner}</Badge>
                          <div>
                            <p className="text-sm font-medium">
                              {imp.user?.firstName} {imp.user?.lastName} ({imp.user?.email || imp.userId})
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(imp.receivedAt), 'MMM dd, yyyy HH:mm')}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedLabImport(imp);
                              setLabImportDetailsOpen(true);
                            }}
                            data-testid={`button-view-${imp.id}`}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedLabImport(imp);
                              setLabReviewDialogOpen(true);
                            }}
                            data-testid={`button-review-${imp.id}`}
                          >
                            Review
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <CardTitle>Import History</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search imports..."
                      className="pl-8 w-[200px]"
                      value={labImportSearchTerm}
                      onChange={(e) => {
                        setLabImportSearchTerm(e.target.value);
                        setLabImportPage(0);
                      }}
                      data-testid="input-lab-search"
                    />
                  </div>
                  <Select
                    value={labImportStatusFilter}
                    onValueChange={(value) => {
                      setLabImportStatusFilter(value);
                      setLabImportPage(0);
                    }}
                  >
                    <SelectTrigger className="w-[140px]" data-testid="select-lab-status-filter">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="processed">Processed</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => refetchLabImports()}
                    data-testid="button-refresh-imports"
                  >
                    <RefreshCw className={`w-4 h-4 ${labImportsLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {labImportsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : !labImportsData?.imports?.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="w-12 h-12 mx-auto mb-4" />
                  <p>No lab imports found</p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Import ID</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Lab Partner</TableHead>
                        <TableHead>Format</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Received</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {labImportsData.imports.map((imp) => (
                        <TableRow key={imp.id} data-testid={`row-import-${imp.id}`}>
                          <TableCell className="font-mono text-xs">
                            {imp.id.slice(0, 8)}...
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">
                                {imp.user?.firstName} {imp.user?.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {imp.user?.email || imp.userId}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{imp.labPartner}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{imp.format || 'Unknown'}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                imp.status === 'processed' ? 'default' :
                                imp.status === 'error' ? 'destructive' :
                                imp.status === 'pending' ? 'secondary' : 'outline'
                              }
                              className={
                                imp.status === 'processed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' :
                                imp.status === 'error' ? '' :
                                imp.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' : ''
                              }
                            >
                              {imp.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(imp.receivedAt), 'MMM dd, yyyy HH:mm')}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedLabImport(imp);
                                  setLabImportDetailsOpen(true);
                                }}
                                data-testid={`button-view-details-${imp.id}`}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {imp.status === 'pending' && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedLabImport(imp);
                                    setLabReviewDialogOpen(true);
                                  }}
                                  data-testid={`button-start-review-${imp.id}`}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {labImportPage * 20 + 1} - {Math.min((labImportPage + 1) * 20, labImportsData.total)} of {labImportsData.total}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={labImportPage === 0}
                        onClick={() => setLabImportPage(p => p - 1)}
                        data-testid="button-prev-page"
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={(labImportPage + 1) * 20 >= labImportsData.total}
                        onClick={() => setLabImportPage(p => p + 1)}
                        data-testid="button-next-page"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {labImportStats?.byPartner && labImportStats.byPartner.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Imports by Lab Partner</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 flex-wrap">
                  {labImportStats.byPartner.map((partner) => (
                    <div
                      key={partner.partner}
                      className="flex items-center gap-2 p-3 border rounded-lg"
                      data-testid={`partner-stat-${partner.partner}`}
                    >
                      <Building className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{partner.partner}</p>
                        <p className="text-sm text-muted-foreground">{partner.count} imports</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Lab Import Details Dialog */}
      <Dialog open={labImportDetailsOpen} onOpenChange={setLabImportDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lab Import Details</DialogTitle>
            <DialogDescription>
              Import ID: {selectedLabImport?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedLabImport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">User</Label>
                  <p className="font-medium">
                    {selectedLabImport.user?.firstName} {selectedLabImport.user?.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedLabImport.user?.email || selectedLabImport.userId}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Lab Partner</Label>
                  <p className="font-medium">{selectedLabImport.labPartner}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Format</Label>
                  <p className="font-medium">{selectedLabImport.format || 'Unknown'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge
                    variant={
                      selectedLabImport.status === 'processed' ? 'default' :
                      selectedLabImport.status === 'error' ? 'destructive' : 'secondary'
                    }
                  >
                    {selectedLabImport.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Received</Label>
                  <p className="font-medium">{format(new Date(selectedLabImport.receivedAt), 'PPpp')}</p>
                </div>
                {selectedLabImport.processedAt && (
                  <div>
                    <Label className="text-muted-foreground">Processed</Label>
                    <p className="font-medium">{format(new Date(selectedLabImport.processedAt), 'PPpp')}</p>
                  </div>
                )}
              </div>

              {selectedLabImport.errorMessage && (
                <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                  <Label className="text-red-600">Error Message</Label>
                  <p className="text-sm text-red-700 dark:text-red-300">{selectedLabImport.errorMessage}</p>
                </div>
              )}

              {selectedLabImport.parsedData?.biomarkers && selectedLabImport.parsedData.biomarkers.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Parsed Biomarkers ({selectedLabImport.parsedData.biomarkers.length})</Label>
                  <ScrollArea className="h-[300px] border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Biomarker</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Reference Range</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedLabImport.parsedData.biomarkers.map((bio, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{bio.name}</TableCell>
                            <TableCell className="font-mono text-xs">{bio.code}</TableCell>
                            <TableCell className="font-bold">{bio.value}</TableCell>
                            <TableCell>{bio.unit}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{bio.category}</Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {bio.referenceRange
                                ? `${bio.referenceRange.low} - ${bio.referenceRange.high}`
                                : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              )}

              {(selectedLabImport.rawData as any)?.reviewNotes && (
                <div className="p-3 bg-muted rounded-lg">
                  <Label className="text-muted-foreground">Review Notes</Label>
                  <p className="text-sm">{(selectedLabImport.rawData as any).reviewNotes}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Reviewed: {(selectedLabImport.rawData as any).reviewedAt}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setLabImportDetailsOpen(false)}>
              Close
            </Button>
            {selectedLabImport?.status === 'pending' && (
              <Button
                onClick={() => {
                  setLabImportDetailsOpen(false);
                  setLabReviewDialogOpen(true);
                }}
                data-testid="button-review-from-details"
              >
                Review Import
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lab Review Dialog */}
      <Dialog open={labReviewDialogOpen} onOpenChange={setLabReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Lab Import</DialogTitle>
            <DialogDescription>
              Review and approve or reject this lab data import
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedLabImport && (
              <div className="p-3 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">User:</span>
                  <span className="font-medium">
                    {selectedLabImport.user?.firstName} {selectedLabImport.user?.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Lab Partner:</span>
                  <span className="font-medium">{selectedLabImport.labPartner}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Biomarkers:</span>
                  <span className="font-medium">
                    {selectedLabImport.parsedData?.biomarkers?.length || 0}
                  </span>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="review-notes">Review Notes</Label>
              <Textarea
                id="review-notes"
                value={labReviewNotes}
                onChange={(e) => setLabReviewNotes(e.target.value)}
                placeholder="Enter review notes (required for rejection)"
                rows={3}
                data-testid="input-review-notes"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setLabReviewDialogOpen(false);
                setLabReviewNotes("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              className="text-amber-600 border-amber-600"
              onClick={() => {
                if (selectedLabImport) {
                  reviewLabImportMutation.mutate({
                    importId: selectedLabImport.id,
                    status: 'needs_revision',
                    notes: labReviewNotes,
                  });
                }
              }}
              disabled={reviewLabImportMutation.isPending}
              data-testid="button-needs-revision"
            >
              Needs Revision
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedLabImport && labReviewNotes) {
                  reviewLabImportMutation.mutate({
                    importId: selectedLabImport.id,
                    status: 'rejected',
                    notes: labReviewNotes,
                  });
                } else if (!labReviewNotes) {
                  toast({
                    title: "Notes required",
                    description: "Please provide notes for rejection",
                    variant: "destructive",
                  });
                }
              }}
              disabled={reviewLabImportMutation.isPending}
              data-testid="button-reject-import"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => {
                if (selectedLabImport) {
                  reviewLabImportMutation.mutate({
                    importId: selectedLabImport.id,
                    status: 'approved',
                    notes: labReviewNotes,
                  });
                }
              }}
              disabled={reviewLabImportMutation.isPending}
              data-testid="button-approve-import"
            >
              {reviewLabImportMutation.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Import Dialog */}
      <Dialog open={manualImportDialogOpen} onOpenChange={setManualImportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manual Lab Data Import</DialogTitle>
            <DialogDescription>
              Upload lab data in HL7, FHIR, or JSON format
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="manual-user-id">User ID</Label>
              <Input
                id="manual-user-id"
                value={manualImportData.userId}
                onChange={(e) => setManualImportData(d => ({ ...d, userId: e.target.value }))}
                placeholder="Enter user ID for this import"
                data-testid="input-manual-user-id"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Format</Label>
                <Select
                  value={manualImportData.format}
                  onValueChange={(value) => setManualImportData(d => ({ ...d, format: value as any }))}
                >
                  <SelectTrigger data-testid="select-manual-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JSON">JSON</SelectItem>
                    <SelectItem value="HL7">HL7</SelectItem>
                    <SelectItem value="FHIR">FHIR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Lab Partner</Label>
                <Select
                  value={manualImportData.labPartner}
                  onValueChange={(value) => setManualImportData(d => ({ ...d, labPartner: value }))}
                >
                  <SelectTrigger data-testid="select-manual-partner">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual_upload">Manual Upload</SelectItem>
                    <SelectItem value="quest_diagnostics">Quest Diagnostics</SelectItem>
                    <SelectItem value="labcorp">LabCorp</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="manual-data">Lab Data</Label>
              <Textarea
                id="manual-data"
                value={manualImportData.data}
                onChange={(e) => setManualImportData(d => ({ ...d, data: e.target.value }))}
                placeholder={
                  manualImportData.format === 'JSON'
                    ? '{"results": [{"code": "GLUCOSE", "name": "Fasting Glucose", "value": 95, "unit": "mg/dL"}]}'
                    : manualImportData.format === 'HL7'
                    ? 'MSH|^~\\&|LAB|FACILITY|...\\r\\nOBX|1|NM|GLUCOSE||95|mg/dL|...'
                    : '{"resourceType": "Bundle", "entry": [...]}'
                }
                className="font-mono text-sm"
                rows={10}
                data-testid="input-manual-data"
              />
              <p className="text-xs text-muted-foreground">
                Paste your lab data in the selected format above
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setManualImportDialogOpen(false);
                setManualImportData({ data: '', format: 'JSON', userId: '', labPartner: 'manual_upload' });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => manualLabImportMutation.mutate(manualImportData)}
              disabled={manualLabImportMutation.isPending || !manualImportData.data || !manualImportData.userId}
              data-testid="button-submit-import"
            >
              {manualLabImportMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Validation Rules Dialog */}
      <Dialog open={validationRulesDialogOpen} onOpenChange={setValidationRulesDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Biomarker Validation Rules</DialogTitle>
            <DialogDescription>
              Configure acceptable value ranges and requirements for biomarkers
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {validationRulesLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Biomarker</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Normal Range</TableHead>
                      <TableHead>Optimal Range</TableHead>
                      <TableHead>Critical Limits</TableHead>
                      <TableHead>Required</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validationRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">{rule.biomarkerName}</TableCell>
                        <TableCell className="font-mono text-xs">{rule.biomarkerCode}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{rule.category}</Badge>
                        </TableCell>
                        <TableCell>
                          {rule.minValue} - {rule.maxValue} {rule.unit}
                        </TableCell>
                        <TableCell className="text-emerald-600">
                          {rule.optimalMin} - {rule.optimalMax} {rule.unit}
                        </TableCell>
                        <TableCell className="text-red-600">
                          {rule.criticalLow !== undefined && `<${rule.criticalLow}`}
                          {rule.criticalLow !== undefined && rule.criticalHigh !== undefined && ' / '}
                          {rule.criticalHigh !== undefined && `>${rule.criticalHigh}`}
                          {rule.criticalLow === undefined && rule.criticalHigh === undefined && '-'}
                        </TableCell>
                        <TableCell>
                          {rule.isRequired ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setValidationRulesDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Process a refund for booking {selectedBookingForRefund?.bookingNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Original Amount</Label>
              <div className="text-lg font-bold">
                {formatCurrency(selectedBookingForRefund?.totalAmount || 0)}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="refund-amount">Refund Amount</Label>
              <Input
                id="refund-amount"
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="Enter refund amount"
                data-testid="input-refund-amount"
              />
              <p className="text-xs text-muted-foreground">
                Leave as full amount for complete refund, or enter partial amount
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={processRefund}
              disabled={refundPaymentMutation.isPending}
              data-testid="button-confirm-refund"
            >
              {refundPaymentMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Process Refund
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
