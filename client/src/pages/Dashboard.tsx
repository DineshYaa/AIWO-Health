import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { HealthScoreGauge } from "@/components/dashboard/HealthScoreGauge";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { BiomarkerTrendChart } from "@/components/dashboard/BiomarkerTrendChart";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import {
  Activity,
  Heart,
  Flame,
  Moon,
  Droplets,
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowRight,
  Pill,
  Dumbbell,
  TestTube,
  Brain,
  Zap,
  Shield,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  BarChart3,
  Utensils,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import type { BiomarkerTest, Protocol } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: latestTest, isLoading: testLoading } = useQuery<BiomarkerTest>({
    queryKey: ["/api/biomarkers/latest"],
    retry: false,
  });

  const { data: activeProtocol, isLoading: protocolLoading } = useQuery<Protocol>({
    queryKey: ["/api/protocols/active"],
    retry: false,
  });

  const healthMetrics = {
    biologicalAge: 35,
    chronologicalAge: 42,
    healthScore: 87,
    ageReversed: 7,
    percentileRank: 94,
    inflammationScore: 92,
    metabolicScore: 84,
    cardiovascularScore: 89,
    immuneScore: 86,
    hormonalBalance: 81,
    nutritionalStatus: 88,
    detoxCapacity: 79,
    sleepQuality: 8.2,
    stressResilience: 76,
    cognitivePerformance: 91,
    gutHealth: 83,
    muscularSkeletal: 85,
  };

  const biomarkerSummary = {
    total: 412,
    optimal: 324,
    normal: 52,
    borderline: 28,
    concerning: 6,
    critical: 2,
  };

  const hbA1cTrendData = [
    { date: "Jun", value: 5.9 },
    { date: "Jul", value: 5.8 },
    { date: "Aug", value: 5.6 },
    { date: "Sep", value: 5.5 },
    { date: "Oct", value: 5.4 },
    { date: "Nov", value: 5.3 },
  ];

  const vitaminDTrendData = [
    { date: "Jun", value: 28 },
    { date: "Jul", value: 32 },
    { date: "Aug", value: 38 },
    { date: "Sep", value: 42 },
    { date: "Oct", value: 48 },
    { date: "Nov", value: 52 },
  ];

  const recentActivity = [
    {
      id: "1",
      type: "biomarker" as const,
      title: "Comprehensive Biomarker Panel Completed",
      description: "412 markers analyzed including advanced longevity panels, metabolomics, and proteomics",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: "success" as const,
    },
    {
      id: "2",
      type: "protocol" as const,
      title: "AI Protocol Generated - v2.4",
      description: "Personalized optimization plan targeting Vitamin D, inflammation markers, and metabolic health",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: "success" as const,
    },
    {
      id: "3",
      type: "wearable" as const,
      title: "Oura Ring Gen 3 Synced",
      description: "Sleep score 89, HRV 68ms, Readiness 92 - Excellent recovery detected",
      timestamp: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000),
      status: "success" as const,
    },
    {
      id: "4",
      type: "compliance" as const,
      title: "Weekly Protocol Compliance: 94%",
      description: "Outstanding adherence! Supplements 96%, Nutrition 92%, Exercise 94%, Sleep 93%",
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      status: "info" as const,
    },
    {
      id: "5",
      type: "wearable" as const,
      title: "WHOOP 4.0 Recovery Analysis",
      description: "Strain score optimized, HRV trending up 12% over past 30 days",
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: "info" as const,
    },
    {
      id: "6",
      type: "biomarker" as const,
      title: "CGM Glucose Insights",
      description: "Average glucose 94 mg/dL, Time in range 96%, Glucose variability optimal",
      timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      status: "success" as const,
    },
    {
      id: "7",
      type: "protocol" as const,
      title: "Physician Review Completed",
      description: "Dr. Sharma approved protocol adjustments. Testosterone support added.",
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: "success" as const,
    },
    {
      id: "8",
      type: "compliance" as const,
      title: "30-Day Streak Achieved",
      description: "Congratulations! You've maintained protocol compliance for 30 consecutive days",
      timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      status: "info" as const,
    },
  ];

  const todayProtocol = [
    { name: "Vitamin D3 + K2", dosage: "5000 IU / 200mcg", timing: "Morning with fat", status: "taken", icon: Pill, color: "chart-2" },
    { name: "Omega-3 EPA/DHA", dosage: "3g Total", timing: "With lunch", status: "taken", icon: Pill, color: "chart-1" },
    { name: "NAD+ Precursor (NMN)", dosage: "500mg", timing: "Morning, empty stomach", status: "taken", icon: Zap, color: "chart-3" },
    { name: "Creatine Monohydrate", dosage: "5g", timing: "Post-workout", status: "pending", icon: Dumbbell, color: "chart-4" },
    { name: "Zone 2 Cardio", dosage: "45 min", timing: "Heart rate 120-140 bpm", status: "pending", icon: Heart, color: "chart-1" },
    { name: "Strength Training", dosage: "Upper Body", timing: "Progressive overload", status: "pending", icon: Dumbbell, color: "chart-2" },
    { name: "Magnesium Glycinate", dosage: "400mg", timing: "Before bed", status: "evening", icon: Moon, color: "chart-4" },
    { name: "Glycine + L-Theanine", dosage: "3g / 200mg", timing: "30 min before sleep", status: "evening", icon: Brain, color: "chart-3" },
  ];

  const upcomingAppointments = [
    { type: "Telemedicine", provider: "Dr. Priya Sharma, MD", specialty: "Longevity Medicine", date: "Nov 28, 2024", time: "10:00 AM IST" },
    { type: "In-Person", provider: "Dr. Rajesh Kumar, MD", specialty: "Cardiology", date: "Dec 5, 2024", time: "2:30 PM IST" },
  ];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const complianceScore = 94;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-greeting">
            {greeting()}, {user?.firstName || "there"}
          </h1>
          <p className="text-muted-foreground">
            Your personalized health intelligence dashboard
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/biomarkers">
            <Button variant="outline" data-testid="button-view-biomarkers">
              <TestTube className="w-4 h-4 mr-2" />
              View Biomarkers
            </Button>
          </Link>
          <Link href="/booking">
            <Button data-testid="button-book-healthcation">
              <Calendar className="w-4 h-4 mr-2" />
              Book Healthcation
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-1 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HealthScoreGauge
              score={healthMetrics.healthScore}
              biologicalAge={healthMetrics.biologicalAge}
              chronologicalAge={healthMetrics.chronologicalAge}
            />
            <div className="mt-4 pt-4 border-t border-primary/10 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Age Reversed</span>
                <span className="font-semibold text-chart-2">-{healthMetrics.ageReversed} years</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Percentile Rank</span>
                <span className="font-semibold">Top {100 - healthMetrics.percentileRank}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            title="Inflammation Index"
            value={healthMetrics.inflammationScore}
            subtitle="/100"
            icon={Flame}
            trend="up"
            trendValue="+5% from baseline"
            color="chart-2"
          />
          <MetricCard
            title="Metabolic Health"
            value={healthMetrics.metabolicScore}
            subtitle="/100"
            icon={Activity}
            trend="up"
            trendValue="+12% improvement"
            color="chart-1"
          />
          <MetricCard
            title="Cardiovascular"
            value={healthMetrics.cardiovascularScore}
            subtitle="/100"
            icon={Heart}
            trend="stable"
            trendValue="Optimal range"
            color="chart-3"
          />
          <MetricCard
            title="Immune Function"
            value={healthMetrics.immuneScore}
            subtitle="/100"
            icon={Shield}
            trend="up"
            trendValue="+8% this quarter"
            color="chart-4"
          />
          <MetricCard
            title="Cognitive Score"
            value={healthMetrics.cognitivePerformance}
            subtitle="/100"
            icon={Brain}
            trend="up"
            trendValue="+6% improvement"
            color="chart-1"
          />
          <MetricCard
            title="Sleep Quality"
            value={healthMetrics.sleepQuality.toString()}
            subtitle="hrs avg"
            icon={Moon}
            trend="up"
            trendValue="+0.5 hrs this week"
            color="chart-4"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Biomarker Trends
              </CardTitle>
              <Link href="/biomarkers">
                <Button variant="ghost" size="sm" data-testid="link-all-biomarkers">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <BiomarkerTrendChart
                title="HbA1c (Glycated Hemoglobin)"
                data={hbA1cTrendData}
                unit="%"
                optimalMin={4.0}
                optimalMax={5.4}
                referenceMin={4.0}
                referenceMax={5.7}
                color="hsl(var(--chart-1))"
              />
              <BiomarkerTrendChart
                title="Vitamin D (25-OH)"
                data={vitaminDTrendData}
                unit="ng/mL"
                optimalMin={50}
                optimalMax={80}
                referenceMin={30}
                referenceMax={100}
                color="hsl(var(--chart-2))"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Protocol Compliance
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary" data-testid="text-compliance-score">{complianceScore}%</div>
              <p className="text-sm text-muted-foreground">Weekly Adherence</p>
            </div>
            <Progress value={complianceScore} className="h-2" />
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-lg font-semibold text-chart-2">96%</div>
                <p className="text-xs text-muted-foreground">Supplements</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-lg font-semibold text-chart-1">92%</div>
                <p className="text-xs text-muted-foreground">Nutrition</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-lg font-semibold text-chart-3">94%</div>
                <p className="text-xs text-muted-foreground">Exercise</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-lg font-semibold text-chart-4">93%</div>
                <p className="text-xs text-muted-foreground">Sleep</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-chart-2/10 border border-chart-2/20">
              <Sparkles className="w-4 h-4 text-chart-2" />
              <span className="text-sm font-medium text-chart-2">30-Day Streak Active</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Pill className="w-5 h-5 text-primary" />
                  Today's Protocol
                </CardTitle>
                <CardDescription>Your personalized health optimization plan</CardDescription>
              </div>
              <Link href="/protocols">
                <Button variant="ghost" size="sm" data-testid="link-view-protocol">
                  View Full Protocol
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              {todayProtocol.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-${item.color}/10 flex items-center justify-center`}>
                        <IconComponent className={`w-4 h-4 text-${item.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.dosage} - {item.timing}</p>
                      </div>
                    </div>
                    {item.status === "taken" && (
                      <Badge variant="secondary" className="text-chart-2 bg-chart-2/10">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Done
                      </Badge>
                    )}
                    {item.status === "pending" && (
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                    {item.status === "evening" && (
                      <Badge variant="secondary" className="text-chart-4 bg-chart-4/10">
                        <Moon className="w-3 h-3 mr-1" />
                        Evening
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingAppointments.map((apt, index) => (
              <div key={index} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant={apt.type === "Telemedicine" ? "default" : "secondary"} className="text-xs">
                    {apt.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{apt.time}</span>
                </div>
                <p className="text-sm font-medium">{apt.provider}</p>
                <p className="text-xs text-muted-foreground">{apt.specialty}</p>
                <p className="text-xs text-primary mt-1">{apt.date}</p>
              </div>
            ))}
            <Link href="/telemedicine">
              <Button variant="outline" className="w-full" size="sm" data-testid="button-schedule-appointment">
                Schedule New Appointment
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid sm:grid-cols-4 gap-4">
          <Card className="hover-elevate">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-chart-2/10 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-5 h-5 text-chart-2" />
              </div>
              <div className="text-2xl font-bold mb-1 text-chart-2" data-testid="text-optimal-markers">{biomarkerSummary.optimal}</div>
              <p className="text-xs text-muted-foreground">Optimal</p>
            </CardContent>
          </Card>
          <Card className="hover-elevate">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-chart-3/10 flex items-center justify-center mx-auto mb-3">
                <Activity className="w-5 h-5 text-chart-3" />
              </div>
              <div className="text-2xl font-bold mb-1 text-chart-3" data-testid="text-normal-markers">{biomarkerSummary.normal}</div>
              <p className="text-xs text-muted-foreground">Normal</p>
            </CardContent>
          </Card>
          <Card className="hover-elevate">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold mb-1 text-yellow-600" data-testid="text-borderline-markers">{biomarkerSummary.borderline}</div>
              <p className="text-xs text-muted-foreground">Borderline</p>
            </CardContent>
          </Card>
          <Card className="hover-elevate">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-5 h-5 text-destructive" />
              </div>
              <div className="text-2xl font-bold mb-1 text-destructive" data-testid="text-action-markers">{biomarkerSummary.concerning + biomarkerSummary.critical}</div>
              <p className="text-xs text-muted-foreground">Need Attention</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Droplets className="w-4 h-4 text-primary" />
              Biomarker Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Markers Analyzed</span>
              <span className="font-semibold">{biomarkerSummary.total}</span>
            </div>
            <Progress value={(biomarkerSummary.optimal / biomarkerSummary.total) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {Math.round((biomarkerSummary.optimal / biomarkerSummary.total) * 100)}% of biomarkers in optimal range
            </p>
          </CardContent>
        </Card>
      </div>

      <ActivityTimeline items={recentActivity} />

      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Ready for Your Next Health Transformation?</h3>
              </div>
              <p className="text-muted-foreground">
                Book an exclusive wellness retreat at our luxury partner destinations. Experience comprehensive biomarker analysis,
                personalized AI protocols, and world-class physician consultations.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/chat">
                <Button variant="outline" data-testid="button-ask-siva">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Ask Siva
                </Button>
              </Link>
              <Link href="/booking">
                <Button size="lg" data-testid="button-cta-healthcation">
                  Book Healthcation
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
