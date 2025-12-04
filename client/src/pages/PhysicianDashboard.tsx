import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users,
  TestTube,
  FileCheck,
  Calendar,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  Activity,
  Stethoscope,
  Heart,
  Brain,
  Pill,
  Video,
  Phone,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ChevronRight,
  Search,
  Filter,
  Download,
  ClipboardList,
  Sparkles,
  Shield,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Eye,
  Send,
  XCircle,
  FileSignature,
  Beaker,
  Microscope,
  Dna,
  Droplets,
  Flame,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, subDays, addHours, subHours } from "date-fns";

interface DemoPatient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  profileImageUrl?: string;
  healthScore: number;
  biologicalAge: number;
  chronologicalAge: number;
  riskLevel: "low" | "moderate" | "high";
  primaryConcerns: string[];
  lastVisit: Date;
  nextAppointment?: Date;
  assignedPhysician: string;
  insuranceProvider: string;
  memberSince: Date;
  totalVisits: number;
  activeProtocols: number;
  complianceRate: number;
  allergies: string[];
  medications: string[];
  conditions: string[];
  recentBiomarkers: {
    name: string;
    value: number;
    unit: string;
    status: "optimal" | "normal" | "suboptimal" | "critical";
    trend: "up" | "down" | "stable";
  }[];
}

interface PendingBiomarkerReview {
  id: string;
  patientId: string;
  patientName: string;
  testType: string;
  testDate: Date;
  labPartner: string;
  status: "pending_review" | "flagged" | "urgent";
  urgencyLevel: "routine" | "priority" | "urgent";
  totalMarkers: number;
  criticalMarkers: number;
  suboptimalMarkers: number;
  keyFindings: string[];
  aiSummary: string;
  markers: {
    name: string;
    value: number;
    unit: string;
    reference: string;
    status: "optimal" | "normal" | "suboptimal" | "critical";
  }[];
}

interface PendingProtocolApproval {
  id: string;
  patientId: string;
  patientName: string;
  protocolType: string;
  version: number;
  generatedBy: string;
  generatedAt: Date;
  status: "pending_approval" | "needs_modification";
  riskLevel: "low" | "moderate" | "high";
  aiConfidence: number;
  duration: string;
  components: {
    type: "supplement" | "nutrition" | "exercise" | "sleep" | "lifestyle";
    items: string[];
    rationale: string;
  }[];
  contraindications: string[];
  expectedOutcomes: string[];
}

interface DemoAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientImage?: string;
  appointmentType: string;
  scheduledAt: Date;
  duration: number;
  status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
  consultationType: "video" | "phone" | "in_person";
  notes?: string;
  chiefComplaint?: string;
  priority: "routine" | "follow_up" | "urgent";
}

interface ClinicalNote {
  id: string;
  patientId: string;
  patientName: string;
  appointmentId: string;
  createdAt: Date;
  noteType: "consultation" | "follow_up" | "lab_review" | "prescription";
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  signedBy: string;
  signedAt: Date;
}

interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  prescribedAt: Date;
  status: "active" | "completed" | "cancelled";
  refillsRemaining: number;
  specialInstructions?: string;
}

const demoPatients: DemoPatient[] = [
  {
    id: "pat-001",
    firstName: "Rajesh",
    lastName: "Krishnamurthy",
    email: "rajesh.k@email.com",
    phone: "+91 98765 43210",
    dateOfBirth: "1975-03-15",
    gender: "Male",
    healthScore: 82,
    biologicalAge: 44,
    chronologicalAge: 49,
    riskLevel: "low",
    primaryConcerns: ["Metabolic optimization", "Cardiovascular health", "Cognitive enhancement"],
    lastVisit: subDays(new Date(), 14),
    nextAppointment: addDays(new Date(), 3),
    assignedPhysician: "Dr. Arun Sharma",
    insuranceProvider: "Star Health",
    memberSince: new Date("2023-06-15"),
    totalVisits: 12,
    activeProtocols: 2,
    complianceRate: 94,
    allergies: ["Penicillin"],
    medications: ["Atorvastatin 10mg", "Vitamin D3 60K IU weekly"],
    conditions: ["Prediabetes", "Mild dyslipidemia"],
    recentBiomarkers: [
      { name: "HbA1c", value: 5.9, unit: "%", status: "suboptimal", trend: "down" },
      { name: "LDL-C", value: 118, unit: "mg/dL", status: "normal", trend: "down" },
      { name: "Vitamin D", value: 42, unit: "ng/mL", status: "optimal", trend: "up" },
      { name: "hs-CRP", value: 1.2, unit: "mg/L", status: "normal", trend: "stable" },
    ],
  },
  {
    id: "pat-002",
    firstName: "Priya",
    lastName: "Venkataraman",
    email: "priya.v@email.com",
    phone: "+91 87654 32109",
    dateOfBirth: "1982-07-22",
    gender: "Female",
    healthScore: 76,
    biologicalAge: 39,
    chronologicalAge: 42,
    riskLevel: "moderate",
    primaryConcerns: ["Hormonal balance", "Thyroid optimization", "Energy levels"],
    lastVisit: subDays(new Date(), 7),
    nextAppointment: addDays(new Date(), 1),
    assignedPhysician: "Dr. Meera Nair",
    insuranceProvider: "HDFC Ergo",
    memberSince: new Date("2023-09-01"),
    totalVisits: 8,
    activeProtocols: 3,
    complianceRate: 88,
    allergies: ["Sulfa drugs", "Shellfish"],
    medications: ["Levothyroxine 50mcg", "Iron supplement", "B12 sublingual"],
    conditions: ["Hypothyroidism", "Iron deficiency anemia"],
    recentBiomarkers: [
      { name: "TSH", value: 3.8, unit: "mIU/L", status: "suboptimal", trend: "down" },
      { name: "Free T4", value: 1.1, unit: "ng/dL", status: "normal", trend: "stable" },
      { name: "Ferritin", value: 28, unit: "ng/mL", status: "suboptimal", trend: "up" },
      { name: "B12", value: 380, unit: "pg/mL", status: "normal", trend: "up" },
    ],
  },
  {
    id: "pat-003",
    firstName: "Vikram",
    lastName: "Malhotra",
    email: "vikram.m@email.com",
    phone: "+91 76543 21098",
    dateOfBirth: "1968-11-08",
    gender: "Male",
    healthScore: 68,
    biologicalAge: 58,
    chronologicalAge: 56,
    riskLevel: "high",
    primaryConcerns: ["Cardiovascular risk", "Weight management", "Sleep apnea"],
    lastVisit: subDays(new Date(), 3),
    nextAppointment: new Date(),
    assignedPhysician: "Dr. Arun Sharma",
    insuranceProvider: "Max Bupa",
    memberSince: new Date("2024-01-10"),
    totalVisits: 6,
    activeProtocols: 4,
    complianceRate: 72,
    allergies: [],
    medications: ["Metoprolol 25mg", "Rosuvastatin 20mg", "Aspirin 75mg", "CPAP therapy"],
    conditions: ["Hypertension", "Type 2 Diabetes", "Obstructive sleep apnea", "Obesity"],
    recentBiomarkers: [
      { name: "HbA1c", value: 7.2, unit: "%", status: "critical", trend: "stable" },
      { name: "LDL-C", value: 142, unit: "mg/dL", status: "suboptimal", trend: "down" },
      { name: "Blood Pressure", value: 148, unit: "mmHg", status: "critical", trend: "down" },
      { name: "BMI", value: 31.2, unit: "kg/m²", status: "critical", trend: "stable" },
    ],
  },
  {
    id: "pat-004",
    firstName: "Ananya",
    lastName: "Iyer",
    email: "ananya.i@email.com",
    phone: "+91 65432 10987",
    dateOfBirth: "1990-04-30",
    gender: "Female",
    healthScore: 91,
    biologicalAge: 31,
    chronologicalAge: 34,
    riskLevel: "low",
    primaryConcerns: ["Performance optimization", "Longevity", "Mental clarity"],
    lastVisit: subDays(new Date(), 21),
    nextAppointment: addDays(new Date(), 14),
    assignedPhysician: "Dr. Meera Nair",
    insuranceProvider: "ICICI Lombard",
    memberSince: new Date("2022-11-20"),
    totalVisits: 18,
    activeProtocols: 2,
    complianceRate: 98,
    allergies: [],
    medications: ["NMN 500mg", "Omega-3 2g", "Ashwagandha 600mg"],
    conditions: [],
    recentBiomarkers: [
      { name: "NAD+", value: 42, unit: "μM", status: "optimal", trend: "up" },
      { name: "VO2 Max", value: 48, unit: "mL/kg/min", status: "optimal", trend: "up" },
      { name: "HRV", value: 68, unit: "ms", status: "optimal", trend: "stable" },
      { name: "Telomere Length", value: 7.8, unit: "kb", status: "optimal", trend: "stable" },
    ],
  },
  {
    id: "pat-005",
    firstName: "Suresh",
    lastName: "Patel",
    email: "suresh.p@email.com",
    phone: "+91 54321 09876",
    dateOfBirth: "1958-09-12",
    gender: "Male",
    healthScore: 74,
    biologicalAge: 62,
    chronologicalAge: 66,
    riskLevel: "moderate",
    primaryConcerns: ["Cognitive health", "Inflammation", "Joint health"],
    lastVisit: subDays(new Date(), 5),
    assignedPhysician: "Dr. Arun Sharma",
    insuranceProvider: "New India Assurance",
    memberSince: new Date("2023-03-05"),
    totalVisits: 14,
    activeProtocols: 3,
    complianceRate: 85,
    allergies: ["NSAIDs", "Contrast dye"],
    medications: ["Curcumin 1000mg", "CoQ10 200mg", "Glucosamine 1500mg", "Fish oil 3g"],
    conditions: ["Mild cognitive impairment", "Osteoarthritis", "Chronic inflammation"],
    recentBiomarkers: [
      { name: "hs-CRP", value: 2.8, unit: "mg/L", status: "suboptimal", trend: "down" },
      { name: "IL-6", value: 4.2, unit: "pg/mL", status: "suboptimal", trend: "down" },
      { name: "Homocysteine", value: 12.5, unit: "μmol/L", status: "suboptimal", trend: "stable" },
      { name: "BDNF", value: 18, unit: "ng/mL", status: "normal", trend: "up" },
    ],
  },
];

const pendingBiomarkerReviews: PendingBiomarkerReview[] = [
  {
    id: "bio-001",
    patientId: "pat-003",
    patientName: "Vikram Malhotra",
    testType: "Comprehensive Metabolic Panel + Lipid Profile",
    testDate: subDays(new Date(), 1),
    labPartner: "Thyrocare Advanced Labs",
    status: "urgent",
    urgencyLevel: "urgent",
    totalMarkers: 28,
    criticalMarkers: 4,
    suboptimalMarkers: 8,
    keyFindings: [
      "HbA1c elevated at 7.2% - requires medication adjustment",
      "LDL cholesterol above target despite statin therapy",
      "Elevated liver enzymes - possible fatty liver",
      "Fasting insulin indicates significant insulin resistance",
    ],
    aiSummary: "Patient shows signs of poorly controlled type 2 diabetes with metabolic syndrome. Recommend intensification of diabetes management, lifestyle intervention, and hepatic screening. Consider GLP-1 agonist therapy.",
    markers: [
      { name: "HbA1c", value: 7.2, unit: "%", reference: "<5.7", status: "critical" },
      { name: "Fasting Glucose", value: 156, unit: "mg/dL", reference: "70-100", status: "critical" },
      { name: "Fasting Insulin", value: 28, unit: "μIU/mL", reference: "2-25", status: "suboptimal" },
      { name: "HOMA-IR", value: 10.8, unit: "", reference: "<2.5", status: "critical" },
      { name: "LDL-C", value: 142, unit: "mg/dL", reference: "<100", status: "suboptimal" },
      { name: "HDL-C", value: 38, unit: "mg/dL", reference: ">40", status: "suboptimal" },
      { name: "Triglycerides", value: 198, unit: "mg/dL", reference: "<150", status: "suboptimal" },
      { name: "ALT", value: 58, unit: "U/L", reference: "7-56", status: "suboptimal" },
      { name: "AST", value: 42, unit: "U/L", reference: "10-40", status: "suboptimal" },
      { name: "GGT", value: 72, unit: "U/L", reference: "9-48", status: "suboptimal" },
      { name: "Uric Acid", value: 7.8, unit: "mg/dL", reference: "3.5-7.2", status: "suboptimal" },
      { name: "Creatinine", value: 1.1, unit: "mg/dL", reference: "0.7-1.3", status: "normal" },
    ],
  },
  {
    id: "bio-002",
    patientId: "pat-002",
    patientName: "Priya Venkataraman",
    testType: "Thyroid Panel + Iron Studies + Female Hormone Panel",
    testDate: subDays(new Date(), 2),
    labPartner: "SRL Diagnostics",
    status: "flagged",
    urgencyLevel: "priority",
    totalMarkers: 18,
    criticalMarkers: 0,
    suboptimalMarkers: 5,
    keyFindings: [
      "TSH slightly elevated - may need dose adjustment",
      "Ferritin low despite supplementation",
      "Vitamin B12 improving but still suboptimal",
      "Estrogen/progesterone ratio suggests luteal phase deficiency",
    ],
    aiSummary: "Thyroid function not yet optimized. Iron stores depleted despite supplementation - consider IV iron therapy. Hormonal panel suggests perimenopause with luteal phase insufficiency. Recommend endocrine optimization protocol.",
    markers: [
      { name: "TSH", value: 3.8, unit: "mIU/L", reference: "0.4-4.0", status: "suboptimal" },
      { name: "Free T4", value: 1.1, unit: "ng/dL", reference: "0.8-1.8", status: "normal" },
      { name: "Free T3", value: 2.4, unit: "pg/mL", reference: "2.3-4.2", status: "normal" },
      { name: "Reverse T3", value: 22, unit: "ng/dL", reference: "9.2-24.1", status: "normal" },
      { name: "Ferritin", value: 28, unit: "ng/mL", reference: "50-150", status: "suboptimal" },
      { name: "Serum Iron", value: 65, unit: "μg/dL", reference: "60-170", status: "normal" },
      { name: "TIBC", value: 420, unit: "μg/dL", reference: "250-400", status: "suboptimal" },
      { name: "Vitamin B12", value: 380, unit: "pg/mL", reference: "500-1000", status: "suboptimal" },
      { name: "Estradiol", value: 45, unit: "pg/mL", reference: "30-400", status: "normal" },
      { name: "Progesterone", value: 4.2, unit: "ng/mL", reference: "5-20", status: "suboptimal" },
    ],
  },
  {
    id: "bio-003",
    patientId: "pat-005",
    patientName: "Suresh Patel",
    testType: "Inflammation Panel + Cognitive Markers + Oxidative Stress",
    testDate: subDays(new Date(), 3),
    labPartner: "Metropolis Healthcare",
    status: "pending_review",
    urgencyLevel: "routine",
    totalMarkers: 22,
    criticalMarkers: 0,
    suboptimalMarkers: 4,
    keyFindings: [
      "Inflammatory markers improving but still elevated",
      "Homocysteine borderline high - B vitamin optimization needed",
      "BDNF levels improving with current protocol",
      "Oxidative stress markers within acceptable range",
    ],
    aiSummary: "Chronic low-grade inflammation continues but showing improvement. Cognitive biomarkers stable. Recommend continuing current anti-inflammatory protocol with addition of methylated B-vitamins for homocysteine optimization.",
    markers: [
      { name: "hs-CRP", value: 2.8, unit: "mg/L", reference: "<1.0", status: "suboptimal" },
      { name: "IL-6", value: 4.2, unit: "pg/mL", reference: "<3.0", status: "suboptimal" },
      { name: "TNF-alpha", value: 8.5, unit: "pg/mL", reference: "<8.1", status: "suboptimal" },
      { name: "Homocysteine", value: 12.5, unit: "μmol/L", reference: "<10", status: "suboptimal" },
      { name: "BDNF", value: 18, unit: "ng/mL", reference: "15-25", status: "normal" },
      { name: "Vitamin D", value: 48, unit: "ng/mL", reference: "40-60", status: "optimal" },
      { name: "Omega-3 Index", value: 7.2, unit: "%", reference: ">8", status: "normal" },
      { name: "Lipid Peroxides", value: 2.1, unit: "nmol/mL", reference: "<2.5", status: "normal" },
      { name: "8-OHdG", value: 4.8, unit: "ng/mg Cr", reference: "<5", status: "normal" },
      { name: "Glutathione", value: 820, unit: "μM", reference: "700-1000", status: "normal" },
    ],
  },
];

const pendingProtocolApprovals: PendingProtocolApproval[] = [
  {
    id: "prot-001",
    patientId: "pat-003",
    patientName: "Vikram Malhotra",
    protocolType: "Metabolic Reset Protocol",
    version: 2,
    generatedBy: "Siva AI",
    generatedAt: subHours(new Date(), 4),
    status: "pending_approval",
    riskLevel: "high",
    aiConfidence: 87,
    duration: "12 weeks",
    components: [
      {
        type: "supplement",
        items: ["Berberine 500mg TID", "Alpha-lipoic acid 600mg daily", "Chromium picolinate 400mcg", "Magnesium glycinate 400mg"],
        rationale: "Target insulin resistance and glucose metabolism through multiple pathways",
      },
      {
        type: "nutrition",
        items: ["Low glycemic Mediterranean pattern", "<100g carbs/day", "16:8 intermittent fasting", "Protein 1.2g/kg body weight"],
        rationale: "Reduce glycemic load and improve metabolic flexibility",
      },
      {
        type: "exercise",
        items: ["Zone 2 cardio 150min/week", "Resistance training 3x/week", "Post-meal walks 15min", "HIIT 1x/week"],
        rationale: "Improve insulin sensitivity and metabolic rate",
      },
      {
        type: "lifestyle",
        items: ["CPAP compliance tracking", "Sleep 7-8 hours", "Stress management protocol", "CGM monitoring"],
        rationale: "Address sleep apnea and stress-related metabolic dysfunction",
      },
    ],
    contraindications: ["Monitor for hypoglycemia with berberine", "Adjust metformin timing", "Caution with HIIT given cardiovascular risk"],
    expectedOutcomes: ["HbA1c reduction 0.5-1%", "Weight loss 5-8kg", "Improved energy levels", "Better sleep quality"],
  },
  {
    id: "prot-002",
    patientId: "pat-002",
    patientName: "Priya Venkataraman",
    protocolType: "Thyroid & Energy Optimization",
    version: 1,
    generatedBy: "Siva AI",
    generatedAt: subHours(new Date(), 8),
    status: "needs_modification",
    riskLevel: "low",
    aiConfidence: 92,
    duration: "8 weeks",
    components: [
      {
        type: "supplement",
        items: ["Selenium 200mcg", "Zinc 30mg", "Iodine 150mcg (kelp)", "Adaptogenic blend (Ashwagandha + Rhodiola)"],
        rationale: "Support thyroid hormone conversion and adrenal function",
      },
      {
        type: "nutrition",
        items: ["Anti-inflammatory Mediterranean", "Iron-rich foods with vitamin C", "Goitrogen-aware cooking", "Adequate protein intake"],
        rationale: "Support thyroid function and iron absorption",
      },
      {
        type: "exercise",
        items: ["Moderate cardio 30min 5x/week", "Yoga 2x/week", "Avoid overtraining", "Morning exercise preferred"],
        rationale: "Support energy levels without adrenal stress",
      },
      {
        type: "sleep",
        items: ["Consistent 10pm-6am schedule", "Blue light blocking after 8pm", "Cool bedroom 18-20°C", "Magnesium before bed"],
        rationale: "Optimize circadian rhythm and thyroid function",
      },
    ],
    contraindications: ["May need thyroid dose adjustment", "Monitor for iodine sensitivity", "Ashwagandha may affect TSH levels"],
    expectedOutcomes: ["Improved energy levels", "TSH optimization to 1-2 mIU/L", "Better iron status", "Enhanced mood stability"],
  },
  {
    id: "prot-003",
    patientId: "pat-001",
    patientName: "Rajesh Krishnamurthy",
    protocolType: "Cardiovascular Longevity Protocol",
    version: 3,
    generatedBy: "Siva AI",
    generatedAt: subHours(new Date(), 12),
    status: "pending_approval",
    riskLevel: "moderate",
    aiConfidence: 94,
    duration: "16 weeks",
    components: [
      {
        type: "supplement",
        items: ["Omega-3 (EPA+DHA) 3g", "CoQ10 200mg", "Aged garlic extract 1200mg", "Bergamot extract 500mg", "K2 MK-7 200mcg"],
        rationale: "Support cardiovascular health through multiple mechanisms",
      },
      {
        type: "nutrition",
        items: ["DASH-Mediterranean hybrid", "Plant-forward meals", "Limit sodium <2g/day", "Increase potassium-rich foods"],
        rationale: "Optimize blood pressure and lipid profile",
      },
      {
        type: "exercise",
        items: ["Zone 2 cardio 180min/week", "Strength training 2x/week", "Daily walking 8000+ steps", "Flexibility work"],
        rationale: "Build cardiovascular reserve and metabolic health",
      },
      {
        type: "lifestyle",
        items: ["Stress reduction (meditation 20min)", "Social connection activities", "Regular sauna 3x/week", "Cold exposure protocol"],
        rationale: "Address stress-related cardiovascular risk factors",
      },
    ],
    contraindications: ["Monitor for bleeding with high-dose omega-3", "Check INR if on any anticoagulants", "Sauna caution with uncontrolled BP"],
    expectedOutcomes: ["LDL-C reduction to <100mg/dL", "Improved arterial function", "HbA1c normalization", "Enhanced HRV"],
  },
];

const demoAppointments: DemoAppointment[] = [
  {
    id: "apt-001",
    patientId: "pat-003",
    patientName: "Vikram Malhotra",
    appointmentType: "Urgent Follow-up",
    scheduledAt: addHours(new Date(), 2),
    duration: 45,
    status: "confirmed",
    consultationType: "video",
    chiefComplaint: "Review critical lab results and adjust diabetes management",
    priority: "urgent",
  },
  {
    id: "apt-002",
    patientId: "pat-002",
    patientName: "Priya Venkataraman",
    appointmentType: "Thyroid Optimization Review",
    scheduledAt: addDays(new Date(), 1),
    duration: 30,
    status: "scheduled",
    consultationType: "video",
    chiefComplaint: "Review thyroid panel and adjust medication",
    priority: "follow_up",
  },
  {
    id: "apt-003",
    patientId: "pat-001",
    patientName: "Rajesh Krishnamurthy",
    appointmentType: "Protocol Check-in",
    scheduledAt: addDays(new Date(), 3),
    duration: 30,
    status: "scheduled",
    consultationType: "phone",
    chiefComplaint: "Monthly protocol adherence and biomarker review",
    priority: "routine",
  },
  {
    id: "apt-004",
    patientId: "pat-004",
    patientName: "Ananya Iyer",
    appointmentType: "Quarterly Health Review",
    scheduledAt: addDays(new Date(), 14),
    duration: 60,
    status: "scheduled",
    consultationType: "in_person",
    chiefComplaint: "Comprehensive longevity assessment",
    priority: "routine",
  },
  {
    id: "apt-005",
    patientId: "pat-005",
    patientName: "Suresh Patel",
    appointmentType: "Cognitive Health Follow-up",
    scheduledAt: subDays(new Date(), 2),
    duration: 45,
    status: "completed",
    consultationType: "video",
    notes: "Reviewed inflammation markers. BDNF improving. Continue current protocol.",
    priority: "follow_up",
  },
  {
    id: "apt-006",
    patientId: "pat-001",
    patientName: "Rajesh Krishnamurthy",
    appointmentType: "Lab Result Review",
    scheduledAt: subDays(new Date(), 14),
    duration: 30,
    status: "completed",
    consultationType: "video",
    notes: "Discussed HbA1c improvement. Adjusted supplement protocol. Patient motivated.",
    priority: "follow_up",
  },
  {
    id: "apt-007",
    patientId: "pat-002",
    patientName: "Priya Venkataraman",
    appointmentType: "Initial Consultation",
    scheduledAt: subDays(new Date(), 7),
    duration: 45,
    status: "completed",
    consultationType: "video",
    notes: "New patient onboarding. Comprehensive history taken. Ordered initial labs.",
    priority: "routine",
  },
];

const demoClinicalNotes: ClinicalNote[] = [
  {
    id: "note-001",
    patientId: "pat-005",
    patientName: "Suresh Patel",
    appointmentId: "apt-005",
    createdAt: subDays(new Date(), 2),
    noteType: "follow_up",
    subjective: "Patient reports improved mental clarity over the past month. Energy levels better in the mornings. Joint pain reduced from 6/10 to 4/10. Sleep quality improved with fewer night awakenings. Compliance with supplement protocol at approximately 90%.",
    objective: "Alert and oriented. Mood appears brighter. Gait improved. Inflammatory markers trending down (hs-CRP 2.8 from 3.5). BDNF 18 ng/mL (up from 15). Weight stable at 78kg.",
    assessment: "66yo male with MCI and chronic inflammation showing positive response to anti-inflammatory protocol. Cognitive function stable per family report. Joint symptoms improved. Inflammatory biomarkers improving.",
    plan: "1. Continue current anti-inflammatory protocol\n2. Add methylated B-complex for homocysteine optimization\n3. Increase curcumin to 1500mg daily\n4. Schedule cognitive assessment in 3 months\n5. Follow-up in 6 weeks",
    signedBy: "Dr. Arun Sharma, MD, FACP",
    signedAt: subDays(new Date(), 2),
  },
  {
    id: "note-002",
    patientId: "pat-001",
    patientName: "Rajesh Krishnamurthy",
    appointmentId: "apt-006",
    createdAt: subDays(new Date(), 14),
    noteType: "lab_review",
    subjective: "Patient delighted with recent lab improvements. Reports sustained energy throughout the day. No hypoglycemic episodes. Adherence to protocol excellent. Wife notes improved mood and engagement.",
    objective: "HbA1c improved from 6.2% to 5.9%. LDL-C 118 (down from 135). Vitamin D optimized at 42 ng/mL. BP 128/82. Weight 81kg (down 2kg).",
    assessment: "49yo male with prediabetes and dyslipidemia showing excellent response to lifestyle and supplement protocol. Metabolic markers improving. Approaching normal glycemic status.",
    plan: "1. Continue current cardiovascular longevity protocol\n2. Add bergamot extract for additional lipid support\n3. Increase omega-3 to 3g daily\n4. Target HbA1c <5.7% by next quarter\n5. Follow-up in 4 weeks",
    signedBy: "Dr. Arun Sharma, MD, FACP",
    signedAt: subDays(new Date(), 14),
  },
];

const demoPrescriptions: Prescription[] = [
  {
    id: "rx-001",
    patientId: "pat-003",
    patientName: "Vikram Malhotra",
    medication: "Metformin XR",
    dosage: "1000mg",
    frequency: "Twice daily with meals",
    duration: "Ongoing",
    prescribedAt: subDays(new Date(), 30),
    status: "active",
    refillsRemaining: 5,
    specialInstructions: "Take with food to minimize GI side effects. Monitor for B12 deficiency.",
  },
  {
    id: "rx-002",
    patientId: "pat-003",
    patientName: "Vikram Malhotra",
    medication: "Rosuvastatin",
    dosage: "20mg",
    frequency: "Once daily at bedtime",
    duration: "Ongoing",
    prescribedAt: subDays(new Date(), 60),
    status: "active",
    refillsRemaining: 3,
  },
  {
    id: "rx-003",
    patientId: "pat-002",
    patientName: "Priya Venkataraman",
    medication: "Levothyroxine",
    dosage: "50mcg",
    frequency: "Once daily on empty stomach",
    duration: "Ongoing",
    prescribedAt: subDays(new Date(), 45),
    status: "active",
    refillsRemaining: 4,
    specialInstructions: "Take 30-60 minutes before breakfast. Avoid calcium and iron supplements within 4 hours.",
  },
  {
    id: "rx-004",
    patientId: "pat-002",
    patientName: "Priya Venkataraman",
    medication: "Iron Bisglycinate",
    dosage: "25mg elemental iron",
    frequency: "Once daily with vitamin C",
    duration: "3 months",
    prescribedAt: subDays(new Date(), 30),
    status: "active",
    refillsRemaining: 2,
    specialInstructions: "Take separately from thyroid medication. Pair with vitamin C for absorption.",
  },
];

export default function PhysicianDashboard() {
  const { toast } = useToast();
  const [selectedPatient, setSelectedPatient] = useState<DemoPatient | null>(null);
  const [selectedBiomarker, setSelectedBiomarker] = useState<PendingBiomarkerReview | null>(null);
  const [selectedProtocol, setSelectedProtocol] = useState<PendingProtocolApproval | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [approvalNotes, setApprovalNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const todayAppointments = demoAppointments.filter(
    (apt) => format(apt.scheduledAt, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
  );

  const upcomingAppointments = demoAppointments.filter(
    (apt) => apt.scheduledAt > new Date() && apt.status !== "completed" && apt.status !== "cancelled"
  );

  const stats = {
    totalPatients: demoPatients.length,
    pendingReviews: pendingBiomarkerReviews.length,
    pendingApprovals: pendingProtocolApprovals.length,
    todayAppointments: todayAppointments.length,
    upcomingAppointments: upcomingAppointments.length,
    criticalAlerts: pendingBiomarkerReviews.filter((b) => b.urgencyLevel === "urgent").length,
    highRiskPatients: demoPatients.filter((p) => p.riskLevel === "high").length,
    averageCompliance: Math.round(demoPatients.reduce((acc, p) => acc + p.complianceRate, 0) / demoPatients.length),
  };

  const filteredPatients = demoPatients.filter(
    (p) =>
      p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReviewSubmit = (biomarkerId: string) => {
    toast({
      title: "Review Submitted",
      description: "Biomarker test has been reviewed and notes saved.",
    });
    setReviewNotes("");
    setSelectedBiomarker(null);
  };

  const handleProtocolApprove = (protocolId: string) => {
    toast({
      title: "Protocol Approved",
      description: "Health protocol has been approved and patient notified.",
    });
    setApprovalNotes("");
    setSelectedProtocol(null);
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "high":
        return <Badge variant="destructive">High Risk</Badge>;
      case "moderate":
        return <Badge className="bg-amber-500 hover:bg-amber-600">Moderate</Badge>;
      case "low":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Low Risk</Badge>;
      default:
        return <Badge variant="outline">{risk}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "optimal":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Optimal</Badge>;
      case "normal":
        return <Badge variant="secondary">Normal</Badge>;
      case "suboptimal":
        return <Badge className="bg-amber-500 hover:bg-amber-600">Suboptimal</Badge>;
      case "critical":
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <ArrowUpRight className="w-4 h-4 text-emerald-500" />;
      case "down":
        return <ArrowDownRight className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold tracking-tight" data-testid="text-physician-title">
              Physician Dashboard
            </h1>
            <Badge variant="outline" className="bg-primary/5 border-primary/20">
              <Sparkles className="w-3 h-3 mr-1" />
              Demo Data
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Clinical workflow management • Patient monitoring • Protocol oversight
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="flex items-center gap-2 px-3 py-1.5">
            <Stethoscope className="w-4 h-4" />
            Dr. Arun Sharma, MD
          </Badge>
          <Badge className="bg-emerald-500 hover:bg-emerald-600">
            <Shield className="w-3 h-3 mr-1" />
            HIPAA Compliant
          </Badge>
        </div>
      </div>

      {stats.criticalAlerts > 0 && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 dark:text-red-100">
                {stats.criticalAlerts} Urgent Review{stats.criticalAlerts > 1 ? "s" : ""} Required
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                Critical lab results need immediate physician attention
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setActiveTab("reviews")}
              data-testid="button-view-urgent"
            >
              Review Now
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-patients">
              {stats.totalPatients}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.highRiskPatients} high risk requiring attention
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <TestTube className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600" data-testid="text-pending-reviews">
              {stats.pendingReviews}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.criticalAlerts} urgent, {stats.pendingReviews - stats.criticalAlerts} routine
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Protocol Approvals</CardTitle>
            <FileCheck className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600" data-testid="text-pending-approvals">
              {stats.pendingApprovals}
            </div>
            <p className="text-xs text-muted-foreground mt-1">AI-generated protocols awaiting review</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Today's Schedule</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-today-appointments">
              {stats.todayAppointments}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.upcomingAppointments} upcoming this week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle>Patient Compliance Overview</CardTitle>
              <CardDescription>Average protocol adherence across active patients</CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {stats.averageCompliance}%
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {demoPatients.slice(0, 4).map((patient) => (
                <div key={patient.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {patient.firstName[0]}
                          {patient.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">
                        {patient.firstName} {patient.lastName}
                      </span>
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        patient.complianceRate >= 90
                          ? "text-emerald-600"
                          : patient.complianceRate >= 75
                          ? "text-amber-600"
                          : "text-red-600"
                      }`}
                    >
                      {patient.complianceRate}%
                    </span>
                  </div>
                  <Progress
                    value={patient.complianceRate}
                    className={`h-2 ${
                      patient.complianceRate >= 90
                        ? "[&>div]:bg-emerald-500"
                        : patient.complianceRate >= 75
                        ? "[&>div]:bg-amber-500"
                        : "[&>div]:bg-red-500"
                    }`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common physician workflows</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => setActiveTab("reviews")}
              data-testid="button-quick-reviews"
            >
              <TestTube className="w-4 h-4 mr-2" />
              Review Lab Results
              {stats.pendingReviews > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {stats.pendingReviews}
                </Badge>
              )}
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => setActiveTab("approvals")}
              data-testid="button-quick-approvals"
            >
              <FileCheck className="w-4 h-4 mr-2" />
              Approve Protocols
              {stats.pendingApprovals > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {stats.pendingApprovals}
                </Badge>
              )}
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => setActiveTab("appointments")}
              data-testid="button-quick-appointments"
            >
              <Video className="w-4 h-4 mr-2" />
              Start Consultation
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => setActiveTab("prescriptions")}
              data-testid="button-quick-prescriptions"
            >
              <Pill className="w-4 h-4 mr-2" />
              Write Prescription
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => setActiveTab("notes")}
              data-testid="button-quick-notes"
            >
              <FileText className="w-4 h-4 mr-2" />
              View Clinical Notes
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex flex-wrap gap-1">
          <TabsTrigger value="overview" className="flex items-center gap-2" data-testid="tab-overview">
            <Activity className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-2" data-testid="tab-reviews">
            <TestTube className="w-4 h-4" />
            Biomarker Reviews
            {stats.pendingReviews > 0 && (
              <Badge variant="secondary" className="ml-1">
                {stats.pendingReviews}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approvals" className="flex items-center gap-2" data-testid="tab-approvals">
            <FileCheck className="w-4 h-4" />
            Protocol Approvals
            {stats.pendingApprovals > 0 && (
              <Badge variant="secondary" className="ml-1">
                {stats.pendingApprovals}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="patients" className="flex items-center gap-2" data-testid="tab-patients">
            <Users className="w-4 h-4" />
            Patients
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center gap-2" data-testid="tab-appointments">
            <Calendar className="w-4 h-4" />
            Appointments
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-2" data-testid="tab-notes">
            <ClipboardList className="w-4 h-4" />
            Clinical Notes
          </TabsTrigger>
          <TabsTrigger value="prescriptions" className="flex items-center gap-2" data-testid="tab-prescriptions">
            <Pill className="w-4 h-4" />
            Prescriptions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Today's Appointments
                </CardTitle>
                <CardDescription>
                  {format(new Date(), "EEEE, MMMM d, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {todayAppointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No appointments scheduled for today</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todayAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                        data-testid={`today-apt-${apt.id}`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-2 rounded-full ${
                              apt.priority === "urgent"
                                ? "bg-red-100 dark:bg-red-900/40"
                                : "bg-primary/10"
                            }`}
                          >
                            {apt.consultationType === "video" ? (
                              <Video className="w-5 h-5 text-primary" />
                            ) : apt.consultationType === "phone" ? (
                              <Phone className="w-5 h-5 text-primary" />
                            ) : (
                              <User className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{apt.patientName}</p>
                            <p className="text-sm text-muted-foreground">
                              {apt.appointmentType} • {format(apt.scheduledAt, "h:mm a")} •{" "}
                              {apt.duration}min
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {apt.priority === "urgent" && (
                            <Badge variant="destructive">Urgent</Badge>
                          )}
                          <Button size="sm" data-testid={`button-start-${apt.id}`}>
                            {apt.consultationType === "video" ? "Join Call" : "Start"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  High Priority Patients
                </CardTitle>
                <CardDescription>Patients requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {demoPatients
                    .filter((p) => p.riskLevel === "high" || p.riskLevel === "moderate")
                    .slice(0, 3)
                    .map((patient) => (
                      <div
                        key={patient.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover-elevate cursor-pointer"
                        onClick={() => {
                          setSelectedPatient(patient);
                          setActiveTab("patients");
                        }}
                        data-testid={`priority-patient-${patient.id}`}
                      >
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarFallback>
                              {patient.firstName[0]}
                              {patient.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {patient.firstName} {patient.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {patient.primaryConcerns[0]}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getRiskBadge(patient.riskLevel)}
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Recent Clinical Notes
              </CardTitle>
              <CardDescription>Latest documentation from patient encounters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {demoClinicalNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 border rounded-lg hover-elevate"
                    data-testid={`note-${note.id}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{note.noteType.replace("_", " ")}</Badge>
                        <span className="font-medium">{note.patientName}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {format(note.createdAt, "MMM d, yyyy")}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-muted-foreground mb-1">Assessment</p>
                        <p className="line-clamp-2">{note.assessment}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground mb-1">Plan</p>
                        <p className="line-clamp-2">{note.plan.split("\n")[0]}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Biomarker Reviews</CardTitle>
              <CardDescription>
                Review lab results and provide clinical interpretation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingBiomarkerReviews.map((review) => (
                  <div
                    key={review.id}
                    className={`p-4 border rounded-lg hover-elevate ${
                      review.urgencyLevel === "urgent"
                        ? "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10"
                        : review.urgencyLevel === "priority"
                        ? "border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10"
                        : ""
                    }`}
                    data-testid={`biomarker-review-${review.id}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-full ${
                            review.urgencyLevel === "urgent"
                              ? "bg-red-100 dark:bg-red-900/40"
                              : review.urgencyLevel === "priority"
                              ? "bg-amber-100 dark:bg-amber-900/40"
                              : "bg-primary/10"
                          }`}
                        >
                          <Microscope
                            className={`w-5 h-5 ${
                              review.urgencyLevel === "urgent"
                                ? "text-red-600"
                                : review.urgencyLevel === "priority"
                                ? "text-amber-600"
                                : "text-primary"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="font-semibold">{review.patientName}</p>
                          <p className="text-sm text-muted-foreground">{review.testType}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {review.labPartner} • {format(review.testDate, "PPP")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {review.urgencyLevel === "urgent" && (
                          <Badge variant="destructive">Urgent</Badge>
                        )}
                        {review.urgencyLevel === "priority" && (
                          <Badge className="bg-amber-500 hover:bg-amber-600">Priority</Badge>
                        )}
                        <Badge variant="outline">
                          {review.criticalMarkers} critical • {review.suboptimalMarkers} suboptimal
                        </Badge>
                      </div>
                    </div>

                    <div className="bg-muted/50 p-3 rounded-lg mb-4">
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-medium mb-1">AI Summary</p>
                          <p className="text-sm text-muted-foreground">{review.aiSummary}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Key Findings</p>
                      <ul className="text-sm space-y-1">
                        {review.keyFindings.map((finding, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => setSelectedBiomarker(review)}
                            data-testid={`button-view-details-${review.id}`}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Full Report
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Biomarker Analysis Report</DialogTitle>
                            <DialogDescription>
                              {review.patientName} • {review.testType}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                              <Card>
                                <CardContent className="pt-4">
                                  <div className="text-2xl font-bold text-center">
                                    {review.totalMarkers}
                                  </div>
                                  <p className="text-sm text-muted-foreground text-center">
                                    Total Markers
                                  </p>
                                </CardContent>
                              </Card>
                              <Card className="border-red-200 dark:border-red-800">
                                <CardContent className="pt-4">
                                  <div className="text-2xl font-bold text-center text-red-600">
                                    {review.criticalMarkers}
                                  </div>
                                  <p className="text-sm text-muted-foreground text-center">
                                    Critical
                                  </p>
                                </CardContent>
                              </Card>
                              <Card className="border-amber-200 dark:border-amber-800">
                                <CardContent className="pt-4">
                                  <div className="text-2xl font-bold text-center text-amber-600">
                                    {review.suboptimalMarkers}
                                  </div>
                                  <p className="text-sm text-muted-foreground text-center">
                                    Suboptimal
                                  </p>
                                </CardContent>
                              </Card>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-3">Detailed Results</h4>
                              <div className="border rounded-lg overflow-hidden">
                                <table className="w-full">
                                  <thead className="bg-muted">
                                    <tr>
                                      <th className="text-left p-3 text-sm font-medium">Marker</th>
                                      <th className="text-left p-3 text-sm font-medium">Value</th>
                                      <th className="text-left p-3 text-sm font-medium">Reference</th>
                                      <th className="text-left p-3 text-sm font-medium">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {review.markers.map((marker, idx) => (
                                      <tr key={idx} className="border-t">
                                        <td className="p-3 text-sm font-medium">{marker.name}</td>
                                        <td className="p-3 text-sm">
                                          {marker.value} {marker.unit}
                                        </td>
                                        <td className="p-3 text-sm text-muted-foreground">
                                          {marker.reference}
                                        </td>
                                        <td className="p-3">{getStatusBadge(marker.status)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="review-notes">Clinical Notes & Recommendations</Label>
                              <Textarea
                                id="review-notes"
                                placeholder="Enter your clinical interpretation and recommendations..."
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                rows={4}
                                className="mt-2"
                                data-testid="input-review-notes"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline">Request Additional Tests</Button>
                            <Button
                              onClick={() => handleReviewSubmit(review.id)}
                              data-testid="button-submit-review"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Complete Review
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button data-testid={`button-quick-review-${review.id}`}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Quick Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Protocol Approvals</CardTitle>
              <CardDescription>
                Review AI-generated health protocols before patient activation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingProtocolApprovals.map((protocol) => (
                  <div
                    key={protocol.id}
                    className="p-4 border rounded-lg hover-elevate"
                    data-testid={`protocol-approval-${protocol.id}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Dna className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{protocol.patientName}</p>
                          <p className="text-sm text-muted-foreground">
                            {protocol.protocolType} v{protocol.version}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Generated by {protocol.generatedBy} •{" "}
                            {format(protocol.generatedAt, "PPP 'at' p")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getRiskBadge(protocol.riskLevel)}
                        <Badge variant="outline">
                          <Star className="w-3 h-3 mr-1" />
                          {protocol.aiConfidence}% confidence
                        </Badge>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                      {protocol.components.map((comp, idx) => (
                        <div key={idx} className="bg-muted/50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            {comp.type === "supplement" && <Pill className="w-4 h-4 text-primary" />}
                            {comp.type === "nutrition" && (
                              <Droplets className="w-4 h-4 text-emerald-500" />
                            )}
                            {comp.type === "exercise" && <Flame className="w-4 h-4 text-orange-500" />}
                            {comp.type === "sleep" && <Clock className="w-4 h-4 text-indigo-500" />}
                            {comp.type === "lifestyle" && <Zap className="w-4 h-4 text-amber-500" />}
                            <span className="text-sm font-medium capitalize">{comp.type}</span>
                          </div>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {comp.items.slice(0, 3).map((item, i) => (
                              <li key={i}>• {item}</li>
                            ))}
                            {comp.items.length > 3 && (
                              <li className="text-primary">+{comp.items.length - 3} more</li>
                            )}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {protocol.contraindications.length > 0 && (
                      <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg mb-4">
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                          Contraindications & Cautions
                        </p>
                        <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                          {protocol.contraindications.map((item, idx) => (
                            <li key={idx}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => setSelectedProtocol(protocol)}
                            data-testid={`button-view-protocol-${protocol.id}`}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Review Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{protocol.protocolType}</DialogTitle>
                            <DialogDescription>
                              {protocol.patientName} • Duration: {protocol.duration}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            {protocol.components.map((comp, idx) => (
                              <div key={idx}>
                                <h4 className="font-semibold capitalize flex items-center gap-2 mb-2">
                                  {comp.type === "supplement" && (
                                    <Pill className="w-4 h-4 text-primary" />
                                  )}
                                  {comp.type === "nutrition" && (
                                    <Droplets className="w-4 h-4 text-emerald-500" />
                                  )}
                                  {comp.type === "exercise" && (
                                    <Flame className="w-4 h-4 text-orange-500" />
                                  )}
                                  {comp.type === "sleep" && (
                                    <Clock className="w-4 h-4 text-indigo-500" />
                                  )}
                                  {comp.type === "lifestyle" && (
                                    <Zap className="w-4 h-4 text-amber-500" />
                                  )}
                                  {comp.type} Protocol
                                </h4>
                                <div className="bg-muted/50 p-4 rounded-lg">
                                  <ul className="text-sm space-y-2 mb-3">
                                    {comp.items.map((item, i) => (
                                      <li key={i} className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                  <p className="text-xs text-muted-foreground italic">
                                    Rationale: {comp.rationale}
                                  </p>
                                </div>
                              </div>
                            ))}

                            <div>
                              <h4 className="font-semibold mb-2">Expected Outcomes</h4>
                              <ul className="text-sm space-y-1">
                                {protocol.expectedOutcomes.map((outcome, idx) => (
                                  <li key={idx} className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                                    {outcome}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <Label htmlFor="approval-notes">Physician Notes & Modifications</Label>
                              <Textarea
                                id="approval-notes"
                                placeholder="Enter any modifications or notes for the patient..."
                                value={approvalNotes}
                                onChange={(e) => setApprovalNotes(e.target.value)}
                                rows={4}
                                className="mt-2"
                                data-testid="input-approval-notes"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline">
                              <XCircle className="w-4 h-4 mr-2" />
                              Request Revision
                            </Button>
                            <Button
                              onClick={() => handleProtocolApprove(protocol.id)}
                              data-testid="button-approve-protocol"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve Protocol
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        onClick={() => handleProtocolApprove(protocol.id)}
                        data-testid={`button-quick-approve-${protocol.id}`}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Patient Registry</CardTitle>
                  <CardDescription>
                    Manage and monitor your patient panel
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search patients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64"
                      data-testid="input-search-patients"
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {filteredPatients.map((patient) => (
                    <Dialog key={patient.id}>
                      <DialogTrigger asChild>
                        <div
                          className="p-4 border rounded-lg hover-elevate cursor-pointer"
                          data-testid={`patient-${patient.id}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={patient.profileImageUrl} />
                                <AvatarFallback>
                                  {patient.firstName[0]}
                                  {patient.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold">
                                  {patient.firstName} {patient.lastName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {patient.email} • {patient.phone}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  {getRiskBadge(patient.riskLevel)}
                                  <Badge variant="outline">
                                    Health Score: {patient.healthScore}
                                  </Badge>
                                  <Badge variant="outline">
                                    Bio Age: {patient.biologicalAge} (
                                    {patient.biologicalAge < patient.chronologicalAge ? "-" : "+"}
                                    {Math.abs(patient.chronologicalAge - patient.biologicalAge)}y)
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-sm">
                                <Activity className="w-4 h-4" />
                                <span>{patient.complianceRate}% compliance</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Last visit: {format(patient.lastVisit, "MMM d, yyyy")}
                              </p>
                              {patient.nextAppointment && (
                                <p className="text-xs text-primary mt-1">
                                  Next: {format(patient.nextAppointment, "MMM d")}
                                </p>
                              )}
                            </div>
                          </div>

                          <Separator className="my-3" />

                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-2">
                                Primary Concerns
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {patient.primaryConcerns.map((concern, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {concern}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-2">
                                Recent Biomarkers
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {patient.recentBiomarkers.slice(0, 3).map((marker, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-1 text-xs"
                                  >
                                    {getStatusBadge(marker.status)}
                                    <span className="text-muted-foreground">
                                      {marker.name}: {marker.value}
                                      {marker.unit}
                                    </span>
                                    {getTrendIcon(marker.trend)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            {patient.firstName} {patient.lastName}
                          </DialogTitle>
                          <DialogDescription>
                            Patient ID: {patient.id} • Member since{" "}
                            {format(patient.memberSince, "MMMM yyyy")}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div className="grid grid-cols-4 gap-4">
                            <Card>
                              <CardContent className="pt-4">
                                <div className="text-2xl font-bold text-center text-primary">
                                  {patient.healthScore}
                                </div>
                                <p className="text-sm text-muted-foreground text-center">
                                  Health Score
                                </p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="pt-4">
                                <div className="text-2xl font-bold text-center">
                                  {patient.biologicalAge}
                                </div>
                                <p className="text-sm text-muted-foreground text-center">
                                  Biological Age
                                </p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="pt-4">
                                <div className="text-2xl font-bold text-center">
                                  {patient.totalVisits}
                                </div>
                                <p className="text-sm text-muted-foreground text-center">
                                  Total Visits
                                </p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="pt-4">
                                <div
                                  className={`text-2xl font-bold text-center ${
                                    patient.complianceRate >= 90
                                      ? "text-emerald-600"
                                      : patient.complianceRate >= 75
                                      ? "text-amber-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {patient.complianceRate}%
                                </div>
                                <p className="text-sm text-muted-foreground text-center">
                                  Compliance
                                </p>
                              </CardContent>
                            </Card>
                          </div>

                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold mb-3">Medical History</h4>
                              <div className="space-y-3">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">
                                    Conditions
                                  </p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {patient.conditions.length > 0 ? (
                                      patient.conditions.map((c, i) => (
                                        <Badge key={i} variant="outline">
                                          {c}
                                        </Badge>
                                      ))
                                    ) : (
                                      <span className="text-sm text-muted-foreground">
                                        No conditions
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">
                                    Allergies
                                  </p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {patient.allergies.length > 0 ? (
                                      patient.allergies.map((a, i) => (
                                        <Badge key={i} variant="destructive">
                                          {a}
                                        </Badge>
                                      ))
                                    ) : (
                                      <span className="text-sm text-muted-foreground">
                                        No known allergies
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">
                                    Current Medications
                                  </p>
                                  <ul className="text-sm mt-1 space-y-1">
                                    {patient.medications.map((m, i) => (
                                      <li key={i} className="flex items-center gap-2">
                                        <Pill className="w-3 h-3 text-primary" />
                                        {m}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-3">Recent Biomarkers</h4>
                              <div className="space-y-2">
                                {patient.recentBiomarkers.map((marker, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between p-2 bg-muted/50 rounded"
                                  >
                                    <span className="text-sm font-medium">{marker.name}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm">
                                        {marker.value} {marker.unit}
                                      </span>
                                      {getStatusBadge(marker.status)}
                                      {getTrendIcon(marker.trend)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline">
                            <FileText className="w-4 h-4 mr-2" />
                            View Full Chart
                          </Button>
                          <Button variant="outline">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Message Patient
                          </Button>
                          <Button>
                            <Calendar className="w-4 h-4 mr-2" />
                            Schedule Appointment
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Scheduled consultations</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {demoAppointments
                      .filter((apt) => apt.scheduledAt > new Date() && apt.status !== "cancelled")
                      .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
                      .map((apt) => (
                        <div
                          key={apt.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                          data-testid={`upcoming-apt-${apt.id}`}
                        >
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarFallback>
                                {apt.patientName.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{apt.patientName}</p>
                              <p className="text-sm text-muted-foreground">
                                {apt.appointmentType}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(apt.scheduledAt, "EEE, MMM d 'at' h:mm a")} •{" "}
                                {apt.duration}min
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {apt.consultationType === "video" && (
                              <Badge variant="outline">
                                <Video className="w-3 h-3 mr-1" />
                                Video
                              </Badge>
                            )}
                            {apt.consultationType === "phone" && (
                              <Badge variant="outline">
                                <Phone className="w-3 h-3 mr-1" />
                                Phone
                              </Badge>
                            )}
                            {apt.consultationType === "in_person" && (
                              <Badge variant="outline">
                                <User className="w-3 h-3 mr-1" />
                                In Person
                              </Badge>
                            )}
                            {apt.priority === "urgent" && (
                              <Badge variant="destructive">Urgent</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Past Appointments</CardTitle>
                <CardDescription>Completed consultations</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {demoAppointments
                      .filter((apt) => apt.status === "completed")
                      .sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime())
                      .map((apt) => (
                        <div
                          key={apt.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                          data-testid={`past-apt-${apt.id}`}
                        >
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarFallback>
                                {apt.patientName.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{apt.patientName}</p>
                              <p className="text-sm text-muted-foreground">
                                {apt.appointmentType}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(apt.scheduledAt, "MMM d, yyyy")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-emerald-500">Completed</Badge>
                            <Button variant="ghost" size="icon">
                              <FileText className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Clinical Notes</CardTitle>
                  <CardDescription>
                    Documentation from patient encounters (SOAP format)
                  </CardDescription>
                </div>
                <Button data-testid="button-new-note">
                  <FileText className="w-4 h-4 mr-2" />
                  New Note
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {demoClinicalNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 border rounded-lg hover-elevate"
                    data-testid={`clinical-note-${note.id}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {note.patientName.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{note.patientName}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(note.createdAt, "MMMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {note.noteType.replace("_", " ")}
                        </Badge>
                        <Badge className="bg-emerald-500">
                          <FileSignature className="w-3 h-3 mr-1" />
                          Signed
                        </Badge>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-primary mb-1">Subjective</h4>
                        <p className="text-sm text-muted-foreground">{note.subjective}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-primary mb-1">Objective</h4>
                        <p className="text-sm text-muted-foreground">{note.objective}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-primary mb-1">Assessment</h4>
                        <p className="text-sm text-muted-foreground">{note.assessment}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-primary mb-1">Plan</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {note.plan}
                        </p>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Signed by: {note.signedBy}</span>
                      <span>{format(note.signedAt, "MMM d, yyyy 'at' h:mm a")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Prescriptions</CardTitle>
                  <CardDescription>Active and recent prescriptions</CardDescription>
                </div>
                <Button data-testid="button-new-prescription">
                  <Pill className="w-4 h-4 mr-2" />
                  New Prescription
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {demoPrescriptions.map((rx) => (
                  <div
                    key={rx.id}
                    className="p-4 border rounded-lg hover-elevate"
                    data-testid={`prescription-${rx.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Pill className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{rx.medication}</p>
                          <p className="text-sm text-muted-foreground">
                            {rx.dosage} • {rx.frequency}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Duration: {rx.duration} • Refills: {rx.refillsRemaining}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          className={
                            rx.status === "active"
                              ? "bg-emerald-500 hover:bg-emerald-600"
                              : rx.status === "completed"
                              ? "bg-gray-500"
                              : "bg-red-500"
                          }
                        >
                          {rx.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          For: {rx.patientName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(rx.prescribedAt, "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    {rx.specialInstructions && (
                      <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded text-sm">
                        <span className="font-medium text-amber-800 dark:text-amber-200">
                          Special Instructions:{" "}
                        </span>
                        <span className="text-amber-700 dark:text-amber-300">
                          {rx.specialInstructions}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
