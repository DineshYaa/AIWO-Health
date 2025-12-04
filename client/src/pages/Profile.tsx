import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Settings,
  Watch,
  Bell,
  Shield,
  Camera,
  Save,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Activity,
  Heart,
  Lock,
  FileText,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format, formatDistanceToNow } from "date-fns";
import type { Profile, WearableConnection, UserConsent } from "@shared/schema";

const wearableDevices = [
  { id: "oura", name: "Oura Ring", icon: "💍", connected: true, lastSync: "2 hours ago" },
  { id: "whoop", name: "WHOOP Strap", icon: "⌚", connected: false, lastSync: null },
  { id: "apple_health", name: "Apple Health", icon: "🍎", connected: true, lastSync: "5 mins ago" },
  { id: "fitbit", name: "Fitbit", icon: "📱", connected: false, lastSync: null },
  { id: "garmin", name: "Garmin", icon: "🏃", connected: false, lastSync: null },
  { id: "cgm", name: "CGM Device", icon: "💉", connected: false, lastSync: null },
];

const consentTypes = [
  {
    id: "health_data_processing",
    title: "Health Data Processing",
    description: "Allow us to process your health data including biomarkers, wearable data, and health assessments to provide personalized protocols.",
    required: true,
    category: "essential",
  },
  {
    id: "ai_analysis",
    title: "AI-Powered Health Analysis",
    description: "Allow our AI systems to analyze your health data and generate personalized recommendations, protocols, and insights.",
    required: true,
    category: "essential",
  },
  {
    id: "physician_sharing",
    title: "Physician Data Sharing",
    description: "Allow physicians on our platform to access your health data during telemedicine consultations.",
    required: false,
    category: "healthcare",
  },
  {
    id: "lab_partner_sharing",
    title: "Lab Partner Integration",
    description: "Allow automatic import of lab results from our partner laboratories (Quest Diagnostics, LabCorp, etc.).",
    required: false,
    category: "healthcare",
  },
  {
    id: "wearable_sync",
    title: "Wearable Device Sync",
    description: "Allow continuous syncing of health metrics from your connected wearable devices.",
    required: false,
    category: "healthcare",
  },
  {
    id: "marketing_communications",
    title: "Marketing Communications",
    description: "Receive promotional emails about new programs, wellness retreats, and special offers.",
    required: false,
    category: "marketing",
  },
  {
    id: "research_participation",
    title: "Anonymous Research Contribution",
    description: "Contribute anonymized health data to longevity research studies and scientific publications.",
    required: false,
    category: "research",
  },
  {
    id: "third_party_analytics",
    title: "Third-Party Analytics",
    description: "Allow anonymized usage data to be shared with analytics providers to improve our services.",
    required: false,
    category: "analytics",
  },
];

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "",
    heightCm: "",
    weightKg: "",
    bloodType: "",
    allergies: "",
    medications: "",
  });

  const [notifications, setNotifications] = useState({
    protocolReminders: true,
    supplementAlerts: true,
    weeklyReports: true,
    appointmentReminders: true,
    marketingEmails: false,
  });

  const [consents, setConsents] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    consentTypes.forEach(ct => {
      initial[ct.id] = ct.required;
    });
    return initial;
  });

  const { data: profile } = useQuery<Profile>({
    queryKey: ["/api/profile"],
    retry: false,
  });

  const { data: wearables } = useQuery<WearableConnection[]>({
    queryKey: ["/api/wearables/connections"],
    retry: false,
  });

  const { data: userConsents = [] } = useQuery<UserConsent[]>({
    queryKey: ["/api/consents"],
    retry: false,
  });

  useEffect(() => {
    if (userConsents.length > 0) {
      const consentMap: Record<string, boolean> = {};
      consentTypes.forEach(ct => {
        const existing = userConsents.find(uc => uc.consentType === ct.id);
        consentMap[ct.id] = existing ? true : ct.required;
      });
      setConsents(consentMap);
    }
  }, [userConsents]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("PATCH", "/api/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const connectWearableMutation = useMutation({
    mutationFn: async (deviceType: string) => {
      return await apiRequest("POST", `/api/wearables/connect/${deviceType}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wearables/connections"] });
      toast({
        title: "Device Connected",
        description: "Your wearable device has been connected successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Connection Failed",
        description: "Failed to connect device. Please try again.",
        variant: "destructive",
      });
    },
  });

  const grantConsentMutation = useMutation({
    mutationFn: async ({ consentType, metadata }: { consentType: string; metadata?: any }) => {
      return await apiRequest("POST", "/api/consents", { consentType, metadata });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consents"] });
      toast({
        title: "Consent Updated",
        description: "Your consent preferences have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update consent. Please try again.",
        variant: "destructive",
      });
    },
  });

  const revokeConsentMutation = useMutation({
    mutationFn: async (consentType: string) => {
      return await apiRequest("DELETE", `/api/consents/${consentType}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consents"] });
      toast({
        title: "Consent Revoked",
        description: "Your consent has been revoked successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Revocation Failed",
        description: "Failed to revoke consent. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleConsentChange = (consentType: string, granted: boolean) => {
    const consentDef = consentTypes.find(ct => ct.id === consentType);
    if (consentDef?.required && !granted) {
      toast({
        title: "Required Consent",
        description: "This consent is required to use our services.",
        variant: "destructive",
      });
      return;
    }

    setConsents(prev => ({ ...prev, [consentType]: granted }));

    if (granted) {
      grantConsentMutation.mutate({ 
        consentType, 
        metadata: { 
          source: 'profile_page',
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        } 
      });
    } else {
      revokeConsentMutation.mutate(consentType);
    }
  };

  const getInitials = () => {
    if (!user) return "U";
    const first = user.firstName?.charAt(0) || "";
    const last = user.lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U";
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(formData);
  };

  const getConsentCategoryIcon = (category: string) => {
    switch (category) {
      case 'essential': return <Shield className="w-4 h-4 text-primary" />;
      case 'healthcare': return <Heart className="w-4 h-4 text-red-500" />;
      case 'marketing': return <Bell className="w-4 h-4 text-blue-500" />;
      case 'research': return <FileText className="w-4 h-4 text-purple-500" />;
      case 'analytics': return <Activity className="w-4 h-4 text-green-500" />;
      default: return <Lock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'essential': return 'Essential';
      case 'healthcare': return 'Healthcare';
      case 'marketing': return 'Marketing';
      case 'research': return 'Research';
      case 'analytics': return 'Analytics';
      default: return 'Other';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account, health preferences, and privacy
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage src={user?.profileImageUrl || undefined} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                data-testid="button-change-photo"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-semibold" data-testid="text-user-full-name">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                <Badge variant="secondary">
                  <Heart className="w-3 h-3 mr-1" />
                  Health Score: 85
                </Badge>
                <Badge variant="outline">
                  Member since Nov 2024
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personal" className="flex items-center gap-2" data-testid="tab-personal">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Personal</span>
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2" data-testid="tab-health">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Health</span>
          </TabsTrigger>
          <TabsTrigger value="wearables" className="flex items-center gap-2" data-testid="tab-wearables">
            <Watch className="w-4 h-4" />
            <span className="hidden sm:inline">Wearables</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2" data-testid="tab-notifications">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2" data-testid="tab-privacy">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="mt-2"
                    data-testid="input-profile-first-name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="mt-2"
                    data-testid="input-profile-last-name"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-2"
                    data-testid="input-profile-email"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-2"
                    placeholder="+91 98765 43210"
                    data-testid="input-profile-phone"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveProfile}
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-save-profile"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Health Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="heightCm">Height (cm)</Label>
                  <Input
                    id="heightCm"
                    type="number"
                    value={formData.heightCm}
                    onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                    className="mt-2"
                    placeholder="175"
                    data-testid="input-height"
                  />
                </div>
                <div>
                  <Label htmlFor="weightKg">Weight (kg)</Label>
                  <Input
                    id="weightKg"
                    type="number"
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                    className="mt-2"
                    placeholder="70"
                    data-testid="input-weight"
                  />
                </div>
                <div>
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <Select
                    value={formData.bloodType}
                    onValueChange={(v) => setFormData({ ...formData, bloodType: v })}
                  >
                    <SelectTrigger className="mt-2" data-testid="select-blood-type">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="allergies">Known Allergies</Label>
                <Input
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  className="mt-2"
                  placeholder="e.g., Penicillin, Shellfish"
                  data-testid="input-allergies"
                />
              </div>

              <div>
                <Label htmlFor="medications">Current Medications</Label>
                <Input
                  id="medications"
                  value={formData.medications}
                  onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                  className="mt-2"
                  placeholder="e.g., Metformin 500mg, Lisinopril 10mg"
                  data-testid="input-medications"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveProfile}
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-save-health"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wearables">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Watch className="w-5 h-5 text-primary" />
                Connected Devices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {wearableDevices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                    data-testid={`wearable-${device.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{device.icon}</span>
                      <div>
                        <p className="font-medium">{device.name}</p>
                        {device.connected && device.lastSync && (
                          <p className="text-sm text-muted-foreground">
                            Last synced: {device.lastSync}
                          </p>
                        )}
                      </div>
                    </div>
                    {device.connected ? (
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-chart-2">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                        <Button variant="outline" size="sm">
                          Disconnect
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => connectWearableMutation.mutate(device.id)}
                        disabled={connectWearableMutation.isPending}
                        data-testid={`button-connect-${device.id}`}
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Protocol Reminders</p>
                    <p className="text-sm text-muted-foreground">Daily reminders for your health protocol</p>
                  </div>
                  <Switch
                    checked={notifications.protocolReminders}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, protocolReminders: checked })}
                    data-testid="switch-protocol-reminders"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Supplement Alerts</p>
                    <p className="text-sm text-muted-foreground">Notifications when it's time to take supplements</p>
                  </div>
                  <Switch
                    checked={notifications.supplementAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, supplementAlerts: checked })}
                    data-testid="switch-supplement-alerts"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weekly Reports</p>
                    <p className="text-sm text-muted-foreground">Summary of your health progress</p>
                  </div>
                  <Switch
                    checked={notifications.weeklyReports}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReports: checked })}
                    data-testid="switch-weekly-reports"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Appointment Reminders</p>
                    <p className="text-sm text-muted-foreground">Reminders for upcoming consultations</p>
                  </div>
                  <Switch
                    checked={notifications.appointmentReminders}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, appointmentReminders: checked })}
                    data-testid="switch-appointment-reminders"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Marketing Emails</p>
                    <p className="text-sm text-muted-foreground">Updates about new programs and offers</p>
                  </div>
                  <Switch
                    checked={notifications.marketingEmails}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, marketingEmails: checked })}
                    data-testid="switch-marketing-emails"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button data-testid="button-save-notifications">
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy & Consent Tab */}
        <TabsContent value="privacy">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  Data Consent Management
                </CardTitle>
                <CardDescription>
                  Control how your personal and health data is used. Required consents are necessary for core platform functionality.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6">
                  <Shield className="w-4 h-4" />
                  <AlertDescription>
                    We comply with GDPR, HIPAA, and other data protection regulations. You can withdraw consent at any time, except for required consents.
                  </AlertDescription>
                </Alert>

                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {['essential', 'healthcare', 'marketing', 'research', 'analytics'].map(category => {
                      const categoryConsents = consentTypes.filter(ct => ct.category === category);
                      if (categoryConsents.length === 0) return null;

                      return (
                        <div key={category} className="space-y-3">
                          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            {getConsentCategoryIcon(category)}
                            {getCategoryLabel(category)} Consents
                          </div>

                          {categoryConsents.map(consent => {
                            const existingConsent = userConsents.find(uc => uc.consentType === consent.id);

                            return (
                              <div
                                key={consent.id}
                                className="p-4 border rounded-lg space-y-3"
                                data-testid={`consent-${consent.id}`}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <p className="font-medium">{consent.title}</p>
                                      {consent.required && (
                                        <Badge variant="secondary" className="text-xs">Required</Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{consent.description}</p>
                                    {existingConsent && (
                                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        Granted {formatDistanceToNow(new Date(existingConsent.grantedAt!), { addSuffix: true })}
                                      </p>
                                    )}
                                  </div>
                                  <Switch
                                    checked={consents[consent.id] || false}
                                    onCheckedChange={(checked) => handleConsentChange(consent.id, checked)}
                                    disabled={consent.required || grantConsentMutation.isPending || revokeConsentMutation.isPending}
                                    data-testid={`switch-consent-${consent.id}`}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Data Portability & Rights
                </CardTitle>
                <CardDescription>
                  Exercise your GDPR rights to access, export, or delete your data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Download className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">Export Your Data</p>
                          <p className="text-sm text-muted-foreground">Download all your health and personal data</p>
                        </div>
                      </div>
                      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full" data-testid="button-export-data">
                            <Download className="w-4 h-4 mr-2" />
                            Request Data Export
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Export Your Data</DialogTitle>
                            <DialogDescription>
                              We'll prepare a comprehensive export of all your data including health records, protocols, and account information.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4 space-y-4">
                            <div className="p-4 bg-muted/50 rounded-lg">
                              <p className="text-sm font-medium mb-2">Export will include:</p>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                <li className="flex items-center gap-2">
                                  <CheckCircle className="w-3 h-3 text-green-600" />
                                  Profile and account information
                                </li>
                                <li className="flex items-center gap-2">
                                  <CheckCircle className="w-3 h-3 text-green-600" />
                                  Biomarker test results and history
                                </li>
                                <li className="flex items-center gap-2">
                                  <CheckCircle className="w-3 h-3 text-green-600" />
                                  Health protocols and compliance logs
                                </li>
                                <li className="flex items-center gap-2">
                                  <CheckCircle className="w-3 h-3 text-green-600" />
                                  Wearable device data
                                </li>
                                <li className="flex items-center gap-2">
                                  <CheckCircle className="w-3 h-3 text-green-600" />
                                  Booking and appointment history
                                </li>
                                <li className="flex items-center gap-2">
                                  <CheckCircle className="w-3 h-3 text-green-600" />
                                  Chat and communication history
                                </li>
                              </ul>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Processing may take up to 48 hours. You'll receive an email when your export is ready.
                            </p>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={() => {
                              toast({
                                title: "Export Requested",
                                description: "We'll email you when your data export is ready.",
                              });
                              setExportDialogOpen(false);
                            }} data-testid="button-confirm-export">
                              <Download className="w-4 h-4 mr-2" />
                              Request Export
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>

                  <Card className="bg-destructive/5 border-destructive/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Trash2 className="w-5 h-5 text-destructive" />
                        <div>
                          <p className="font-medium text-destructive">Delete Account</p>
                          <p className="text-sm text-muted-foreground">Permanently remove all your data</p>
                        </div>
                      </div>
                      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full border-destructive/50 text-destructive hover:bg-destructive/10" data-testid="button-delete-account">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete My Account
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="text-destructive flex items-center gap-2">
                              <AlertTriangle className="w-5 h-5" />
                              Delete Account
                            </DialogTitle>
                            <DialogDescription>
                              This action is irreversible. All your data will be permanently deleted.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4 space-y-4">
                            <Alert variant="destructive">
                              <AlertTriangle className="w-4 h-4" />
                              <AlertDescription>
                                You will lose access to all your health data, protocols, bookings, and account information. This cannot be undone.
                              </AlertDescription>
                            </Alert>
                            <div className="p-4 bg-muted/50 rounded-lg">
                              <p className="text-sm font-medium mb-2">This will delete:</p>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                <li>All biomarker tests and health history</li>
                                <li>AI-generated protocols and recommendations</li>
                                <li>Wearable device connections and data</li>
                                <li>Booking history and future reservations</li>
                                <li>Telemedicine records and prescriptions</li>
                                <li>Community posts and achievements</li>
                              </ul>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button variant="destructive" onClick={() => {
                              toast({
                                title: "Deletion Requested",
                                description: "Your account deletion has been initiated. You'll receive a confirmation email.",
                              });
                              setDeleteDialogOpen(false);
                            }} data-testid="button-confirm-delete">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Yes, Delete Everything
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Audit Trail</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    View a complete log of all data access and changes made to your account in the Admin Dashboard (if you have admin access) or request a copy via data export.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
