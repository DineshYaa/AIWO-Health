import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format, addDays, isAfter, isBefore, parseISO } from "date-fns";
import { 
  Video, 
  Phone, 
  Calendar, 
  Clock, 
  User, 
  Plus,
  FileText,
  Pill,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Loader2,
  MapPin,
  Stethoscope,
  CalendarDays,
  MessageSquare
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import type { User as UserType } from "@shared/schema";

interface DemoAppointment {
  id: string;
  patientId: string;
  physicianId: string;
  appointmentType: string;
  status: string;
  scheduledAt: Date;
  duration: number;
  symptoms?: string;
  notes?: string;
  meetingLink?: string | null;
  diagnosis?: string | null;
  prescription?: unknown;
  followUpDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  patient: { id: string; firstName: string | null; lastName: string | null; email: string | null; profileImageUrl: string | null } | null;
  physician: { id: string; firstName: string | null; lastName: string | null; email: string | null; profileImageUrl: string | null } | null;
  consultationRoom?: { roomUrl: string; status: string } | null;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface DemoPrescription {
  id: string;
  patientId: string;
  physicianId: string;
  appointmentId?: string | null;
  prescriptionNumber: string;
  status: string;
  medications: Medication[];
  diagnosis?: string;
  instructions?: string | null;
  pharmacyNotes?: string | null;
  validFrom: Date;
  validUntil?: Date | null;
  refillsAllowed?: number;
  refillsUsed?: number;
  digitalSignature?: string | null;
  dispensedAt?: Date | null;
  dispensedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
  patient: { id: string; firstName: string | null; lastName: string | null; email: string | null } | null;
  physician: { id: string; firstName: string | null; lastName: string | null } | null;
}

const mockPhysicians = [
  { id: "phy1", firstName: "Dr. Ananya", lastName: "Sharma", email: "dr.sharma@aiwo.health", profileImageUrl: null, specialty: "Longevity Medicine", credentials: "MD, FACP, Board Certified in Internal Medicine", experience: "15+ years in preventive medicine" },
  { id: "phy2", firstName: "Dr. Rajiv", lastName: "Menon", email: "dr.menon@aiwo.health", profileImageUrl: null, specialty: "Functional Medicine", credentials: "MD, IFMCP, Certified Functional Medicine Practitioner", experience: "12+ years in functional and integrative medicine" },
  { id: "phy3", firstName: "Dr. Priya", lastName: "Nair", email: "dr.nair@aiwo.health", profileImageUrl: null, specialty: "Metabolic Health", credentials: "MBBS, DNB, Diabetes & Metabolism Specialist", experience: "10+ years in metabolic disorders" },
  { id: "phy4", firstName: "Dr. Vikram", lastName: "Patel", email: "dr.patel@aiwo.health", profileImageUrl: null, specialty: "Sports Medicine & Performance", credentials: "MD, Sports Medicine, Performance Coach", experience: "8+ years in athletic optimization" },
  { id: "phy5", firstName: "Dr. Meera", lastName: "Krishnan", email: "dr.krishnan@aiwo.health", profileImageUrl: null, specialty: "Ayurvedic Integration", credentials: "BAMS, MD (Ayurveda), Integrative Health", experience: "20+ years in Ayurvedic medicine" },
];

const mockAppointments: DemoAppointment[] = [
  {
    id: "apt1",
    patientId: "user1",
    physicianId: "phy1",
    appointmentType: "video_consultation",
    status: "confirmed",
    scheduledAt: new Date(Date.now() + 86400000 * 2),
    duration: 30,
    symptoms: "Reviewing recent biomarker results, discussing optimization strategies",
    notes: "Follow-up on NMN protocol effectiveness",
    meetingLink: "https://meet.aiwo.health/room/abc123",
    createdAt: new Date(),
    updatedAt: new Date(),
    patient: { id: "user1", firstName: "Current", lastName: "User", email: "user@example.com", profileImageUrl: null },
    physician: { id: "phy1", firstName: "Dr. Ananya", lastName: "Sharma", email: "dr.sharma@aiwo.health", profileImageUrl: null },
    consultationRoom: { roomUrl: "https://meet.aiwo.health/room/abc123", status: "ready" }
  },
  {
    id: "apt2",
    patientId: "user1",
    physicianId: "phy2",
    appointmentType: "phone_call",
    status: "scheduled",
    scheduledAt: new Date(Date.now() + 86400000 * 5),
    duration: 45,
    symptoms: "Gut health concerns, digestive optimization",
    notes: "Discuss microbiome testing results",
    createdAt: new Date(),
    updatedAt: new Date(),
    patient: { id: "user1", firstName: "Current", lastName: "User", email: "user@example.com", profileImageUrl: null },
    physician: { id: "phy2", firstName: "Dr. Rajiv", lastName: "Menon", email: "dr.menon@aiwo.health", profileImageUrl: null },
    consultationRoom: null
  },
  {
    id: "apt3",
    patientId: "user1",
    physicianId: "phy3",
    appointmentType: "video_consultation",
    status: "completed",
    scheduledAt: new Date(Date.now() - 86400000 * 7),
    duration: 30,
    symptoms: "Initial metabolic assessment",
    notes: "Reviewed HbA1c, fasting glucose, insulin levels. Recommended dietary modifications.",
    createdAt: new Date(Date.now() - 86400000 * 14),
    updatedAt: new Date(Date.now() - 86400000 * 7),
    patient: { id: "user1", firstName: "Current", lastName: "User", email: "user@example.com", profileImageUrl: null },
    physician: { id: "phy3", firstName: "Dr. Priya", lastName: "Nair", email: "dr.nair@aiwo.health", profileImageUrl: null },
    consultationRoom: null
  },
  {
    id: "apt4",
    patientId: "user1",
    physicianId: "phy1",
    appointmentType: "video_consultation",
    status: "completed",
    scheduledAt: new Date(Date.now() - 86400000 * 30),
    duration: 60,
    symptoms: "Comprehensive health assessment",
    notes: "Initial consultation. Full biomarker review, personalized protocol creation.",
    createdAt: new Date(Date.now() - 86400000 * 35),
    updatedAt: new Date(Date.now() - 86400000 * 30),
    patient: { id: "user1", firstName: "Current", lastName: "User", email: "user@example.com", profileImageUrl: null },
    physician: { id: "phy1", firstName: "Dr. Ananya", lastName: "Sharma", email: "dr.sharma@aiwo.health", profileImageUrl: null },
    consultationRoom: null
  },
  {
    id: "apt5",
    patientId: "user1",
    physicianId: "phy5",
    appointmentType: "follow_up",
    status: "scheduled",
    scheduledAt: new Date(Date.now() + 86400000 * 14),
    duration: 30,
    symptoms: "Ayurvedic protocol review and adjustment",
    notes: "Monthly check-in on Panchakarma maintenance protocol",
    createdAt: new Date(),
    updatedAt: new Date(),
    patient: { id: "user1", firstName: "Current", lastName: "User", email: "user@example.com", profileImageUrl: null },
    physician: { id: "phy5", firstName: "Dr. Meera", lastName: "Krishnan", email: "dr.krishnan@aiwo.health", profileImageUrl: null },
    consultationRoom: null
  },
  {
    id: "apt6",
    patientId: "user1",
    physicianId: "phy4",
    appointmentType: "video_consultation",
    status: "completed",
    scheduledAt: new Date(Date.now() - 86400000 * 45),
    duration: 45,
    symptoms: "Performance optimization, VO2 max improvement strategies",
    notes: "Discussed Zone 2 training protocol, recovery optimization, and pre-workout nutrition.",
    createdAt: new Date(Date.now() - 86400000 * 50),
    updatedAt: new Date(Date.now() - 86400000 * 45),
    patient: { id: "user1", firstName: "Current", lastName: "User", email: "user@example.com", profileImageUrl: null },
    physician: { id: "phy4", firstName: "Dr. Vikram", lastName: "Patel", email: "dr.patel@aiwo.health", profileImageUrl: null },
    consultationRoom: null
  },
];

const mockPrescriptions: DemoPrescription[] = [
  {
    id: "rx1",
    patientId: "user1",
    physicianId: "phy1",
    prescriptionNumber: "AIWO-RX-2024-001",
    medications: [
      { name: "NMN (Nicotinamide Mononucleotide)", dosage: "500mg", frequency: "Once daily", duration: "90 days", instructions: "Take in the morning on empty stomach, sublingual preferred" },
      { name: "Trans-Resveratrol", dosage: "500mg", frequency: "Once daily", duration: "90 days", instructions: "Take with morning fat source (MCT oil or avocado)" },
      { name: "Omega-3 Fish Oil (EPA/DHA)", dosage: "2000mg EPA + 1000mg DHA", frequency: "Twice daily", duration: "Ongoing", instructions: "Take with meals to enhance absorption" },
      { name: "Vitamin D3 + K2", dosage: "5000 IU D3 + 200mcg K2", frequency: "Once daily", duration: "Ongoing", instructions: "Take with fatty meal for optimal absorption" },
      { name: "Magnesium Glycinate", dosage: "400mg", frequency: "Once daily", duration: "Ongoing", instructions: "Take before bed for sleep support" },
    ],
    diagnosis: "Optimization protocol for cellular energy and longevity",
    status: "active",
    validFrom: new Date(Date.now() - 86400000 * 7),
    validUntil: new Date(Date.now() + 86400000 * 90),
    pharmacyNotes: "High-quality pharmaceutical grade supplements recommended. Source from verified suppliers only.",
    createdAt: new Date(Date.now() - 86400000 * 7),
    updatedAt: new Date(Date.now() - 86400000 * 7),
    patient: { id: "user1", firstName: "Current", lastName: "User", email: "user@example.com" },
    physician: { id: "phy1", firstName: "Dr. Ananya", lastName: "Sharma" }
  },
  {
    id: "rx2",
    patientId: "user1",
    physicianId: "phy3",
    prescriptionNumber: "AIWO-RX-2024-002",
    medications: [
      { name: "Berberine HCl", dosage: "500mg", frequency: "Three times daily", duration: "60 days", instructions: "Take 30 minutes before meals for optimal glucose management" },
      { name: "Alpha Lipoic Acid (R-form)", dosage: "300mg", frequency: "Twice daily", duration: "60 days", instructions: "Take on empty stomach, at least 1 hour before meals" },
      { name: "Chromium Picolinate", dosage: "500mcg", frequency: "Once daily", duration: "60 days", instructions: "Take with breakfast" },
    ],
    diagnosis: "Metabolic optimization - glucose regulation and insulin sensitivity support",
    status: "active",
    validFrom: new Date(Date.now() - 86400000 * 14),
    validUntil: new Date(Date.now() + 86400000 * 60),
    pharmacyNotes: "Monitor blood glucose levels weekly. Report any hypoglycemic symptoms immediately.",
    createdAt: new Date(Date.now() - 86400000 * 14),
    updatedAt: new Date(Date.now() - 86400000 * 14),
    patient: { id: "user1", firstName: "Current", lastName: "User", email: "user@example.com" },
    physician: { id: "phy3", firstName: "Dr. Priya", lastName: "Nair" }
  },
  {
    id: "rx3",
    patientId: "user1",
    physicianId: "phy5",
    prescriptionNumber: "AIWO-RX-2024-003",
    medications: [
      { name: "Ashwagandha KSM-66", dosage: "600mg", frequency: "Once daily", duration: "90 days", instructions: "Take in the evening for stress adaptation and cortisol modulation" },
      { name: "Triphala Churna", dosage: "1000mg", frequency: "Once daily", duration: "60 days", instructions: "Take before bedtime with warm water for digestive support" },
      { name: "Brahmi (Bacopa monnieri)", dosage: "300mg", frequency: "Twice daily", duration: "90 days", instructions: "Take with meals for cognitive support" },
    ],
    diagnosis: "Ayurvedic protocol for stress management, digestive health, and cognitive enhancement",
    status: "completed",
    validFrom: new Date(Date.now() - 86400000 * 120),
    validUntil: new Date(Date.now() - 86400000 * 30),
    pharmacyNotes: "Traditional Ayurvedic formulations from certified organic sources",
    createdAt: new Date(Date.now() - 86400000 * 120),
    updatedAt: new Date(Date.now() - 86400000 * 30),
    patient: { id: "user1", firstName: "Current", lastName: "User", email: "user@example.com" },
    physician: { id: "phy5", firstName: "Dr. Meera", lastName: "Krishnan" }
  },
  {
    id: "rx4",
    patientId: "user1",
    physicianId: "phy4",
    prescriptionNumber: "AIWO-RX-2024-004",
    medications: [
      { name: "Creatine Monohydrate", dosage: "5g", frequency: "Once daily", duration: "Ongoing", instructions: "Take post-workout or with breakfast on rest days" },
      { name: "Beta-Alanine", dosage: "3.2g", frequency: "Once daily", duration: "90 days", instructions: "Take pre-workout. Tingling sensation is normal and temporary." },
      { name: "Citrulline Malate", dosage: "6g", frequency: "Once daily", duration: "Ongoing", instructions: "Take 30-60 minutes before exercise" },
      { name: "Electrolyte Complex", dosage: "1 packet", frequency: "As needed", duration: "Ongoing", instructions: "Use during and after intense workouts" },
    ],
    diagnosis: "Athletic performance optimization and recovery protocol",
    status: "active",
    validFrom: new Date(Date.now() - 86400000 * 45),
    validUntil: new Date(Date.now() + 86400000 * 180),
    pharmacyNotes: "Sport-certified, third-party tested supplements required for competition compliance",
    createdAt: new Date(Date.now() - 86400000 * 45),
    updatedAt: new Date(Date.now() - 86400000 * 45),
    patient: { id: "user1", firstName: "Current", lastName: "User", email: "user@example.com" },
    physician: { id: "phy4", firstName: "Dr. Vikram", lastName: "Patel" }
  },
];

export default function Telemedicine() {
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedPhysician, setSelectedPhysician] = useState("");
  const [appointmentType, setAppointmentType] = useState("video_consultation");
  const [symptoms, setSymptoms] = useState("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/auth/user"],
  });

  const { data: apiAppointments = [], isLoading: loadingAppointments } = useQuery<DemoAppointment[]>({
    queryKey: ["/api/appointments"],
  });
  const appointments = apiAppointments.length > 0 ? apiAppointments : mockAppointments;

  const { data: apiPrescriptions = [], isLoading: loadingPrescriptions } = useQuery<DemoPrescription[]>({
    queryKey: ["/api/prescriptions"],
  });
  const prescriptions = apiPrescriptions.length > 0 ? apiPrescriptions : mockPrescriptions;

  const { data: apiPhysicians = [] } = useQuery<{ id: string; firstName: string | null; lastName: string | null; email: string | null; profileImageUrl: string | null }[]>({
    queryKey: ["/api/physicians"],
  });
  const physicians = apiPhysicians.length > 0 ? apiPhysicians : mockPhysicians;

  const scheduleMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDate || !selectedTime) {
        throw new Error("Please select date and time");
      }
      const [hours, minutes] = selectedTime.split(":");
      const scheduledAt = new Date(selectedDate);
      scheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      return await apiRequest("POST", "/api/appointments", {
        physicianId: selectedPhysician || undefined,
        appointmentType,
        scheduledAt: scheduledAt.toISOString(),
        duration: 30,
        symptoms,
        notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Appointment Scheduled",
        description: "Your consultation has been scheduled successfully.",
      });
      setShowScheduleDialog(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Scheduling Failed",
        description: error.message || "Failed to schedule appointment.",
        variant: "destructive",
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      return await apiRequest("PATCH", `/api/appointments/${appointmentId}`, {
        status: "cancelled",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been cancelled.",
      });
    },
  });

  const resetForm = () => {
    setSelectedDate(undefined);
    setSelectedTime("");
    setSelectedPhysician("");
    setAppointmentType("video_consultation");
    setSymptoms("");
    setNotes("");
  };

  const handleJoinCall = (appointment: DemoAppointment) => {
    const meetingUrl = appointment.meetingLink || appointment.consultationRoom?.roomUrl;
    
    if (meetingUrl) {
      window.open(meetingUrl, "_blank", "noopener,noreferrer");
      toast({
        title: "Joining Video Consultation",
        description: `Connecting to your session with ${appointment.physician?.firstName} ${appointment.physician?.lastName}...`,
      });
    } else {
      toast({
        title: "Demo Mode",
        description: "Video consultation rooms are simulated in demo mode. In production, you would be connected to a secure WebRTC video room.",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle }> = {
      scheduled: { variant: "secondary", icon: Calendar },
      confirmed: { variant: "default", icon: CheckCircle },
      in_progress: { variant: "default", icon: Video },
      completed: { variant: "outline", icon: CheckCircle },
      cancelled: { variant: "destructive", icon: XCircle },
      no_show: { variant: "destructive", icon: AlertCircle },
    };
    const config = variants[status] || { variant: "secondary", icon: AlertCircle };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="capitalize gap-1">
        <Icon className="w-3 h-3" />
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const getPrescriptionStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      completed: "outline",
      cancelled: "destructive",
      expired: "secondary",
    };
    return (
      <Badge variant={variants[status] || "secondary"} className="capitalize">
        {status}
      </Badge>
    );
  };

  const upcomingAppointments = appointments.filter(
    apt => apt.status === "scheduled" || apt.status === "confirmed"
  );
  const pastAppointments = appointments.filter(
    apt => apt.status === "completed" || apt.status === "cancelled" || apt.status === "no_show"
  );

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
  ];

  const isPhysician = user?.role === "physician" || user?.role === "admin";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" data-testid="text-telemedicine-title">
              Telemedicine
            </h1>
            <p className="text-muted-foreground mt-1">
              {isPhysician 
                ? "Manage your patient consultations and prescriptions"
                : "Schedule video consultations with our wellness physicians"}
            </p>
          </div>
          <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
            <DialogTrigger asChild>
              <Button data-testid="button-schedule-consultation">
                <Plus className="w-4 h-4 mr-2" />
                Schedule Consultation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Schedule a Consultation</DialogTitle>
                <DialogDescription>
                  Book a video consultation with one of our wellness physicians.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Consultation Type</Label>
                  <Select value={appointmentType} onValueChange={setAppointmentType}>
                    <SelectTrigger data-testid="select-appointment-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video_consultation">
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4" />
                          Video Consultation
                        </div>
                      </SelectItem>
                      <SelectItem value="phone_call">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Phone Call
                        </div>
                      </SelectItem>
                      <SelectItem value="follow_up">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4" />
                          Follow-up Visit
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {physicians.length > 0 && (
                  <div className="space-y-2">
                    <Label>Select Physician (Optional)</Label>
                    <Select value={selectedPhysician} onValueChange={setSelectedPhysician}>
                      <SelectTrigger data-testid="select-physician">
                        <SelectValue placeholder="Any available physician" />
                      </SelectTrigger>
                      <SelectContent>
                        {physicians.map((doc) => (
                          <SelectItem key={doc.id} value={doc.id}>
                            Dr. {doc.firstName} {doc.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Select Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal" data-testid="button-select-date">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => isBefore(date, new Date()) || isAfter(date, addDays(new Date(), 30))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Select Time</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger data-testid="select-time">
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Symptoms or Concerns</Label>
                  <Textarea
                    placeholder="Describe your symptoms or health concerns..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    rows={3}
                    data-testid="input-symptoms"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Additional Notes (Optional)</Label>
                  <Textarea
                    placeholder="Any additional information for the physician..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    data-testid="input-notes"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => scheduleMutation.mutate()}
                  disabled={!selectedDate || !selectedTime || scheduleMutation.isPending}
                  data-testid="button-confirm-schedule"
                >
                  {scheduleMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    "Schedule Consultation"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="text-upcoming-count">{upcomingAppointments.length}</p>
                  <p className="text-sm text-muted-foreground">Upcoming Appointments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="text-completed-count">
                    {appointments.filter(a => a.status === "completed").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Completed Consultations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Pill className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="text-prescriptions-count">
                    {prescriptions.filter(p => p.status === "active").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Active Prescriptions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="appointments" data-testid="tab-appointments">
              <Video className="w-4 h-4 mr-2" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="prescriptions" data-testid="tab-prescriptions">
              <Pill className="w-4 h-4 mr-2" />
              Prescriptions
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">
              <FileText className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-4">
            {loadingAppointments ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">Loading appointments...</p>
                </CardContent>
              </Card>
            ) : upcomingAppointments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Video className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-semibold mb-2">No Upcoming Appointments</h3>
                  <p className="text-muted-foreground mb-4">
                    Schedule a consultation to speak with our wellness physicians.
                  </p>
                  <Button onClick={() => setShowScheduleDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Now
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <Card key={appointment.id} className="hover-elevate">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={isPhysician ? appointment.patient?.profileImageUrl || undefined : appointment.physician?.profileImageUrl || undefined} />
                            <AvatarFallback>
                              {isPhysician 
                                ? `${appointment.patient?.firstName?.[0] || ""}${appointment.patient?.lastName?.[0] || ""}`
                                : `${appointment.physician?.firstName?.[0] || ""}${appointment.physician?.lastName?.[0] || ""}`
                              }
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">
                                {isPhysician 
                                  ? `${appointment.patient?.firstName || ""} ${appointment.patient?.lastName || ""}`.trim() || "Patient"
                                  : `Dr. ${appointment.physician?.firstName || ""} ${appointment.physician?.lastName || ""}`.trim()
                                }
                              </h3>
                              {getStatusBadge(appointment.status || "scheduled")}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <CalendarDays className="w-4 h-4" />
                                {format(new Date(appointment.scheduledAt), "PPP")}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {format(new Date(appointment.scheduledAt), "p")}
                              </span>
                              <span className="flex items-center gap-1">
                                {appointment.appointmentType === "video_consultation" ? (
                                  <Video className="w-4 h-4" />
                                ) : appointment.appointmentType === "phone_call" ? (
                                  <Phone className="w-4 h-4" />
                                ) : (
                                  <MapPin className="w-4 h-4" />
                                )}
                                {appointment.appointmentType?.replace("_", " ")}
                              </span>
                            </div>
                            {appointment.symptoms && (
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                <span className="font-medium">Concerns:</span> {appointment.symptoms}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 lg:flex-col lg:items-end">
                          {appointment.appointmentType === "video_consultation" && (
                            <Button 
                              variant="default"
                              disabled={appointment.status !== "scheduled" && appointment.status !== "confirmed"}
                              onClick={() => handleJoinCall(appointment)}
                              data-testid={`button-join-${appointment.id}`}
                            >
                              <Video className="w-4 h-4 mr-2" />
                              Join Call
                            </Button>
                          )}
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => cancelMutation.mutate(appointment.id)}
                            disabled={cancelMutation.isPending}
                            data-testid={`button-cancel-${appointment.id}`}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-4">
            {loadingPrescriptions ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">Loading prescriptions...</p>
                </CardContent>
              </Card>
            ) : prescriptions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Pill className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-semibold mb-2">No Prescriptions</h3>
                  <p className="text-muted-foreground">
                    {isPhysician 
                      ? "You haven't issued any prescriptions yet."
                      : "You don't have any prescriptions yet. Consult with a physician to receive personalized recommendations."
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {prescriptions.map((prescription) => (
                  <Card key={prescription.id} className="hover-elevate">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{prescription.prescriptionNumber}</h3>
                            {getPrescriptionStatusBadge(prescription.status || "active")}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Stethoscope className="w-4 h-4" />
                              {isPhysician 
                                ? `Patient: ${prescription.patient?.firstName || ""} ${prescription.patient?.lastName || ""}`.trim()
                                : `Dr. ${prescription.physician?.firstName || ""} ${prescription.physician?.lastName || ""}`.trim()
                              }
                            </span>
                            <span className="flex items-center gap-1">
                              <CalendarDays className="w-4 h-4" />
                              {prescription.validFrom && format(new Date(prescription.validFrom), "PP")}
                            </span>
                            {prescription.validUntil && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                Valid until {format(new Date(prescription.validUntil), "PP")}
                              </span>
                            )}
                          </div>
                          {prescription.diagnosis && (
                            <p className="text-sm">
                              <span className="font-medium">Diagnosis:</span> {prescription.diagnosis}
                            </p>
                          )}
                          {Array.isArray(prescription.medications) && prescription.medications.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium mb-2">Medications:</p>
                              <div className="space-y-2">
                                {(prescription.medications as any[]).slice(0, 3).map((med: any, idx: number) => (
                                  <div key={idx} className="flex items-center gap-2 text-sm bg-muted/50 rounded-lg p-2">
                                    <Pill className="w-4 h-4 text-primary" />
                                    <span className="font-medium">{med.name}</span>
                                    <span className="text-muted-foreground">- {med.dosage}, {med.frequency}</span>
                                  </div>
                                ))}
                                {(prescription.medications as any[]).length > 3 && (
                                  <p className="text-sm text-muted-foreground">
                                    +{(prescription.medications as any[]).length - 3} more medications
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <FileText className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {pastAppointments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-semibold mb-2">No Consultation History</h3>
                  <p className="text-muted-foreground">
                    Your completed consultations will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pastAppointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={isPhysician ? appointment.patient?.profileImageUrl || undefined : appointment.physician?.profileImageUrl || undefined} />
                            <AvatarFallback>
                              {isPhysician 
                                ? `${appointment.patient?.firstName?.[0] || ""}${appointment.patient?.lastName?.[0] || ""}`
                                : `${appointment.physician?.firstName?.[0] || ""}${appointment.physician?.lastName?.[0] || ""}`
                              }
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">
                                {isPhysician 
                                  ? `${appointment.patient?.firstName || ""} ${appointment.patient?.lastName || ""}`.trim() || "Patient"
                                  : `Dr. ${appointment.physician?.firstName || ""} ${appointment.physician?.lastName || ""}`.trim()
                                }
                              </h3>
                              {getStatusBadge(appointment.status || "completed")}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{format(new Date(appointment.scheduledAt), "PPP 'at' p")}</span>
                              <span className="capitalize">{appointment.appointmentType?.replace("_", " ")}</span>
                            </div>
                            {appointment.diagnosis && (
                              <p className="text-sm mt-2">
                                <span className="font-medium">Diagnosis:</span> {appointment.diagnosis}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          View Details
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
