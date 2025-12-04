import { useState, Fragment } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  Upload,
  Calendar,
  FileText,
  ChevronDown,
  ChevronUp,
  FileJson,
  FileCode,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Download,
  Trash2,
  Eye,
  Beaker,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { BiomarkerTest, BiomarkerReading, LabDataImport } from "@shared/schema";

const statusColors: Record<string, string> = {
  optimal: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  normal: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  borderline: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  concerning: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
};

const categories = [
  "All Categories",
  "Metabolic",
  "Inflammatory",
  "Cardiovascular",
  "Hormones",
  "Vitamins & Minerals",
  "Liver Function",
  "Kidney Function",
  "Thyroid",
  "Lipid Panel",
  "Blood Count",
];

const labPartners = [
  { id: "quest", name: "Quest Diagnostics", abbr: "QD" },
  { id: "labcorp", name: "LabCorp", abbr: "LC" },
  { id: "thyrocare", name: "Thyrocare", abbr: "TC" },
  { id: "metropolis", name: "Metropolis Labs", abbr: "ML" },
  { id: "srl", name: "SRL Diagnostics", abbr: "SRL" },
  { id: "other", name: "Other Lab", abbr: "OL" },
];

const mockBiomarkers: BiomarkerReading[] = [
  // Metabolic Panel (15 markers)
  { id: "1", name: "HbA1c", value: 5.3, unit: "%", category: "Metabolic", status: "optimal", referenceRange: { min: 4.0, max: 5.7, optimalMin: 4.0, optimalMax: 5.4 }, trend: "down", previousValue: 5.5 },
  { id: "2", name: "Fasting Glucose", value: 88, unit: "mg/dL", category: "Metabolic", status: "optimal", referenceRange: { min: 70, max: 100, optimalMin: 70, optimalMax: 90 }, trend: "down", previousValue: 94 },
  { id: "3", name: "Fasting Insulin", value: 5.2, unit: "µIU/mL", category: "Metabolic", status: "optimal", referenceRange: { min: 2.6, max: 24.9, optimalMin: 2.6, optimalMax: 8.0 }, trend: "stable" },
  { id: "4", name: "HOMA-IR", value: 1.13, unit: "index", category: "Metabolic", status: "optimal", referenceRange: { min: 0.5, max: 2.5, optimalMin: 0.5, optimalMax: 1.5 }, trend: "down", previousValue: 1.4 },
  { id: "5", name: "C-Peptide", value: 1.8, unit: "ng/mL", category: "Metabolic", status: "optimal", referenceRange: { min: 0.8, max: 3.1, optimalMin: 1.0, optimalMax: 2.5 }, trend: "stable" },
  { id: "6", name: "Adiponectin", value: 12.5, unit: "µg/mL", category: "Metabolic", status: "optimal", referenceRange: { min: 4.0, max: 30.0, optimalMin: 8.0, optimalMax: 20.0 }, trend: "up", previousValue: 10.2 },
  { id: "7", name: "Leptin", value: 8.2, unit: "ng/mL", category: "Metabolic", status: "optimal", referenceRange: { min: 2.0, max: 15.0, optimalMin: 4.0, optimalMax: 12.0 }, trend: "stable" },
  { id: "8", name: "Uric Acid", value: 5.4, unit: "mg/dL", category: "Metabolic", status: "optimal", referenceRange: { min: 3.4, max: 7.0, optimalMin: 3.5, optimalMax: 6.0 }, trend: "down", previousValue: 6.2 },
  { id: "9", name: "Lactate Dehydrogenase (LDH)", value: 165, unit: "U/L", category: "Metabolic", status: "optimal", referenceRange: { min: 140, max: 280, optimalMin: 140, optimalMax: 200 }, trend: "stable" },
  { id: "10", name: "Ammonia", value: 28, unit: "µmol/L", category: "Metabolic", status: "optimal", referenceRange: { min: 15, max: 45, optimalMin: 20, optimalMax: 35 }, trend: "stable" },
  { id: "11", name: "Pyruvate", value: 0.08, unit: "mmol/L", category: "Metabolic", status: "optimal", referenceRange: { min: 0.03, max: 0.12, optimalMin: 0.04, optimalMax: 0.1 }, trend: "stable" },
  { id: "12", name: "Beta-Hydroxybutyrate", value: 0.15, unit: "mmol/L", category: "Metabolic", status: "optimal", referenceRange: { min: 0.02, max: 0.5, optimalMin: 0.05, optimalMax: 0.3 }, trend: "stable" },
  { id: "13", name: "Glycated Albumin", value: 12.8, unit: "%", category: "Metabolic", status: "optimal", referenceRange: { min: 11.0, max: 16.0, optimalMin: 11.0, optimalMax: 14.0 }, trend: "stable" },
  { id: "14", name: "1,5-Anhydroglucitol", value: 22.5, unit: "µg/mL", category: "Metabolic", status: "optimal", referenceRange: { min: 14.0, max: 32.0, optimalMin: 18.0, optimalMax: 28.0 }, trend: "stable" },
  { id: "15", name: "Proinsulin", value: 8.5, unit: "pmol/L", category: "Metabolic", status: "optimal", referenceRange: { min: 3.0, max: 20.0, optimalMin: 5.0, optimalMax: 15.0 }, trend: "stable" },
  
  // Lipid Panel (12 markers)
  { id: "16", name: "Total Cholesterol", value: 185, unit: "mg/dL", category: "Lipid Panel", status: "optimal", referenceRange: { min: 0, max: 200, optimalMin: 0, optimalMax: 180 }, trend: "down", previousValue: 195 },
  { id: "17", name: "LDL Cholesterol", value: 98, unit: "mg/dL", category: "Lipid Panel", status: "optimal", referenceRange: { min: 0, max: 130, optimalMin: 0, optimalMax: 100 }, trend: "down", previousValue: 112 },
  { id: "18", name: "HDL Cholesterol", value: 68, unit: "mg/dL", category: "Lipid Panel", status: "optimal", referenceRange: { min: 40, max: 100, optimalMin: 55, optimalMax: 100 }, trend: "up", previousValue: 58 },
  { id: "19", name: "Triglycerides", value: 82, unit: "mg/dL", category: "Lipid Panel", status: "optimal", referenceRange: { min: 0, max: 150, optimalMin: 0, optimalMax: 100 }, trend: "down", previousValue: 105 },
  { id: "20", name: "VLDL Cholesterol", value: 16, unit: "mg/dL", category: "Lipid Panel", status: "optimal", referenceRange: { min: 5, max: 40, optimalMin: 5, optimalMax: 25 }, trend: "stable" },
  { id: "21", name: "Non-HDL Cholesterol", value: 117, unit: "mg/dL", category: "Lipid Panel", status: "optimal", referenceRange: { min: 0, max: 160, optimalMin: 0, optimalMax: 130 }, trend: "down", previousValue: 132 },
  { id: "22", name: "ApoB", value: 78, unit: "mg/dL", category: "Lipid Panel", status: "optimal", referenceRange: { min: 40, max: 130, optimalMin: 40, optimalMax: 90 }, trend: "down", previousValue: 92 },
  { id: "23", name: "ApoA-I", value: 158, unit: "mg/dL", category: "Lipid Panel", status: "optimal", referenceRange: { min: 110, max: 205, optimalMin: 140, optimalMax: 190 }, trend: "up", previousValue: 145 },
  { id: "24", name: "Lp(a)", value: 18, unit: "nmol/L", category: "Lipid Panel", status: "optimal", referenceRange: { min: 0, max: 75, optimalMin: 0, optimalMax: 30 }, trend: "stable" },
  { id: "25", name: "LDL Particle Number", value: 980, unit: "nmol/L", category: "Lipid Panel", status: "optimal", referenceRange: { min: 0, max: 1300, optimalMin: 0, optimalMax: 1000 }, trend: "down", previousValue: 1150 },
  { id: "26", name: "Small Dense LDL", value: 22, unit: "%", category: "Lipid Panel", status: "optimal", referenceRange: { min: 0, max: 50, optimalMin: 0, optimalMax: 30 }, trend: "down", previousValue: 28 },
  { id: "27", name: "Remnant Cholesterol", value: 12, unit: "mg/dL", category: "Lipid Panel", status: "optimal", referenceRange: { min: 0, max: 30, optimalMin: 0, optimalMax: 20 }, trend: "stable" },

  // Inflammatory Markers (10 markers)
  { id: "28", name: "hsCRP", value: 0.8, unit: "mg/L", category: "Inflammatory", status: "optimal", referenceRange: { min: 0, max: 3.0, optimalMin: 0, optimalMax: 1.0 }, trend: "down", previousValue: 1.8 },
  { id: "29", name: "Interleukin-6 (IL-6)", value: 1.2, unit: "pg/mL", category: "Inflammatory", status: "optimal", referenceRange: { min: 0, max: 7.0, optimalMin: 0, optimalMax: 2.0 }, trend: "down", previousValue: 2.5 },
  { id: "30", name: "TNF-alpha", value: 1.8, unit: "pg/mL", category: "Inflammatory", status: "optimal", referenceRange: { min: 0, max: 8.1, optimalMin: 0, optimalMax: 3.0 }, trend: "stable" },
  { id: "31", name: "Fibrinogen", value: 285, unit: "mg/dL", category: "Inflammatory", status: "optimal", referenceRange: { min: 200, max: 400, optimalMin: 200, optimalMax: 320 }, trend: "down", previousValue: 340 },
  { id: "32", name: "Erythrocyte Sedimentation Rate", value: 8, unit: "mm/hr", category: "Inflammatory", status: "optimal", referenceRange: { min: 0, max: 20, optimalMin: 0, optimalMax: 10 }, trend: "stable" },
  { id: "33", name: "Ferritin", value: 85, unit: "ng/mL", category: "Inflammatory", status: "optimal", referenceRange: { min: 30, max: 300, optimalMin: 50, optimalMax: 150 }, trend: "down", previousValue: 112 },
  { id: "34", name: "Serum Amyloid A", value: 4.2, unit: "mg/L", category: "Inflammatory", status: "optimal", referenceRange: { min: 0, max: 10, optimalMin: 0, optimalMax: 6 }, trend: "stable" },
  { id: "35", name: "GlycA", value: 320, unit: "µmol/L", category: "Inflammatory", status: "optimal", referenceRange: { min: 200, max: 500, optimalMin: 250, optimalMax: 400 }, trend: "stable" },
  { id: "36", name: "Myeloperoxidase (MPO)", value: 280, unit: "pmol/L", category: "Inflammatory", status: "optimal", referenceRange: { min: 0, max: 540, optimalMin: 0, optimalMax: 350 }, trend: "down", previousValue: 420 },
  { id: "37", name: "Lp-PLA2", value: 165, unit: "nmol/min/mL", category: "Inflammatory", status: "optimal", referenceRange: { min: 0, max: 235, optimalMin: 0, optimalMax: 175 }, trend: "stable" },

  // Cardiovascular Markers (8 markers)
  { id: "38", name: "Homocysteine", value: 7.8, unit: "µmol/L", category: "Cardiovascular", status: "optimal", referenceRange: { min: 0, max: 15, optimalMin: 0, optimalMax: 8 }, trend: "down", previousValue: 9.2 },
  { id: "39", name: "NT-proBNP", value: 42, unit: "pg/mL", category: "Cardiovascular", status: "optimal", referenceRange: { min: 0, max: 125, optimalMin: 0, optimalMax: 75 }, trend: "stable" },
  { id: "40", name: "hs-Troponin I", value: 4.2, unit: "ng/L", category: "Cardiovascular", status: "optimal", referenceRange: { min: 0, max: 19.8, optimalMin: 0, optimalMax: 10 }, trend: "stable" },
  { id: "41", name: "Galectin-3", value: 11.2, unit: "ng/mL", category: "Cardiovascular", status: "optimal", referenceRange: { min: 0, max: 22.1, optimalMin: 0, optimalMax: 14 }, trend: "stable" },
  { id: "42", name: "ADMA", value: 0.52, unit: "µmol/L", category: "Cardiovascular", status: "optimal", referenceRange: { min: 0.4, max: 1.0, optimalMin: 0.4, optimalMax: 0.7 }, trend: "down", previousValue: 0.68 },
  { id: "43", name: "Oxidized LDL", value: 42, unit: "U/L", category: "Cardiovascular", status: "optimal", referenceRange: { min: 26, max: 117, optimalMin: 26, optimalMax: 65 }, trend: "down", previousValue: 58 },
  { id: "44", name: "TMAO", value: 3.2, unit: "µmol/L", category: "Cardiovascular", status: "optimal", referenceRange: { min: 0, max: 10, optimalMin: 0, optimalMax: 5 }, trend: "stable" },
  { id: "45", name: "D-Dimer", value: 0.28, unit: "mg/L", category: "Cardiovascular", status: "optimal", referenceRange: { min: 0, max: 0.5, optimalMin: 0, optimalMax: 0.35 }, trend: "stable" },

  // Hormones (12 markers)
  { id: "46", name: "Testosterone (Total)", value: 620, unit: "ng/dL", category: "Hormones", status: "optimal", referenceRange: { min: 300, max: 1000, optimalMin: 500, optimalMax: 800 }, trend: "up", previousValue: 580 },
  { id: "47", name: "Free Testosterone", value: 18.5, unit: "pg/mL", category: "Hormones", status: "optimal", referenceRange: { min: 8.7, max: 25.1, optimalMin: 15, optimalMax: 22 }, trend: "up", previousValue: 15.2 },
  { id: "48", name: "SHBG", value: 38, unit: "nmol/L", category: "Hormones", status: "optimal", referenceRange: { min: 18.3, max: 54.1, optimalMin: 25, optimalMax: 45 }, trend: "stable" },
  { id: "49", name: "DHEA-S", value: 285, unit: "µg/dL", category: "Hormones", status: "optimal", referenceRange: { min: 100, max: 400, optimalMin: 200, optimalMax: 350 }, trend: "stable" },
  { id: "50", name: "Cortisol (AM)", value: 15, unit: "µg/dL", category: "Hormones", status: "optimal", referenceRange: { min: 6, max: 23, optimalMin: 10, optimalMax: 18 }, trend: "stable" },
  { id: "51", name: "Estradiol", value: 28, unit: "pg/mL", category: "Hormones", status: "optimal", referenceRange: { min: 10, max: 40, optimalMin: 20, optimalMax: 35 }, trend: "stable" },
  { id: "52", name: "Progesterone", value: 0.8, unit: "ng/mL", category: "Hormones", status: "optimal", referenceRange: { min: 0.2, max: 1.4, optimalMin: 0.4, optimalMax: 1.0 }, trend: "stable" },
  { id: "53", name: "IGF-1", value: 195, unit: "ng/mL", category: "Hormones", status: "optimal", referenceRange: { min: 115, max: 358, optimalMin: 150, optimalMax: 280 }, trend: "stable" },
  { id: "54", name: "Growth Hormone", value: 1.8, unit: "ng/mL", category: "Hormones", status: "optimal", referenceRange: { min: 0.1, max: 8.0, optimalMin: 0.5, optimalMax: 4.0 }, trend: "stable" },
  { id: "55", name: "Prolactin", value: 8.5, unit: "ng/mL", category: "Hormones", status: "optimal", referenceRange: { min: 2, max: 18, optimalMin: 5, optimalMax: 12 }, trend: "stable" },
  { id: "56", name: "FSH", value: 5.2, unit: "mIU/mL", category: "Hormones", status: "optimal", referenceRange: { min: 1.5, max: 12.4, optimalMin: 3, optimalMax: 8 }, trend: "stable" },
  { id: "57", name: "LH", value: 4.8, unit: "mIU/mL", category: "Hormones", status: "optimal", referenceRange: { min: 1.7, max: 8.6, optimalMin: 3, optimalMax: 7 }, trend: "stable" },

  // Thyroid Panel (8 markers)
  { id: "58", name: "TSH", value: 2.1, unit: "mIU/L", category: "Thyroid", status: "optimal", referenceRange: { min: 0.4, max: 4.0, optimalMin: 1.0, optimalMax: 2.5 }, trend: "stable" },
  { id: "59", name: "Free T4", value: 1.25, unit: "ng/dL", category: "Thyroid", status: "optimal", referenceRange: { min: 0.8, max: 1.8, optimalMin: 1.0, optimalMax: 1.5 }, trend: "stable" },
  { id: "60", name: "Free T3", value: 3.2, unit: "pg/mL", category: "Thyroid", status: "optimal", referenceRange: { min: 2.3, max: 4.2, optimalMin: 2.8, optimalMax: 3.8 }, trend: "stable" },
  { id: "61", name: "Total T4", value: 7.8, unit: "µg/dL", category: "Thyroid", status: "optimal", referenceRange: { min: 4.5, max: 12.0, optimalMin: 6.0, optimalMax: 10.0 }, trend: "stable" },
  { id: "62", name: "Total T3", value: 115, unit: "ng/dL", category: "Thyroid", status: "optimal", referenceRange: { min: 80, max: 180, optimalMin: 90, optimalMax: 150 }, trend: "stable" },
  { id: "63", name: "Reverse T3", value: 18, unit: "ng/dL", category: "Thyroid", status: "optimal", referenceRange: { min: 9.2, max: 24.1, optimalMin: 12, optimalMax: 20 }, trend: "stable" },
  { id: "64", name: "Thyroglobulin", value: 12, unit: "ng/mL", category: "Thyroid", status: "optimal", referenceRange: { min: 0.5, max: 55, optimalMin: 5, optimalMax: 30 }, trend: "stable" },
  { id: "65", name: "TPO Antibodies", value: 8, unit: "IU/mL", category: "Thyroid", status: "optimal", referenceRange: { min: 0, max: 35, optimalMin: 0, optimalMax: 20 }, trend: "stable" },

  // Vitamins & Minerals (15 markers)
  { id: "66", name: "Vitamin D (25-OH)", value: 52, unit: "ng/mL", category: "Vitamins & Minerals", status: "optimal", referenceRange: { min: 30, max: 100, optimalMin: 50, optimalMax: 80 }, trend: "up", previousValue: 42 },
  { id: "67", name: "Vitamin B12", value: 680, unit: "pg/mL", category: "Vitamins & Minerals", status: "optimal", referenceRange: { min: 200, max: 1100, optimalMin: 500, optimalMax: 900 }, trend: "up", previousValue: 550 },
  { id: "68", name: "Folate (RBC)", value: 820, unit: "ng/mL", category: "Vitamins & Minerals", status: "optimal", referenceRange: { min: 280, max: 1500, optimalMin: 600, optimalMax: 1200 }, trend: "stable" },
  { id: "69", name: "Vitamin B6", value: 18, unit: "ng/mL", category: "Vitamins & Minerals", status: "optimal", referenceRange: { min: 5, max: 50, optimalMin: 10, optimalMax: 35 }, trend: "stable" },
  { id: "70", name: "Vitamin A", value: 52, unit: "µg/dL", category: "Vitamins & Minerals", status: "optimal", referenceRange: { min: 30, max: 80, optimalMin: 40, optimalMax: 65 }, trend: "stable" },
  { id: "71", name: "Vitamin E (Alpha-Tocopherol)", value: 12.5, unit: "mg/L", category: "Vitamins & Minerals", status: "optimal", referenceRange: { min: 5.5, max: 17, optimalMin: 8, optimalMax: 15 }, trend: "stable" },
  { id: "72", name: "Vitamin K1", value: 0.85, unit: "nmol/L", category: "Vitamins & Minerals", status: "optimal", referenceRange: { min: 0.22, max: 2.22, optimalMin: 0.5, optimalMax: 1.5 }, trend: "stable" },
  { id: "73", name: "Magnesium (RBC)", value: 5.8, unit: "mg/dL", category: "Vitamins & Minerals", status: "optimal", referenceRange: { min: 4.2, max: 6.8, optimalMin: 5.0, optimalMax: 6.5 }, trend: "up", previousValue: 4.8 },
  { id: "74", name: "Zinc", value: 95, unit: "µg/dL", category: "Vitamins & Minerals", status: "optimal", referenceRange: { min: 60, max: 120, optimalMin: 80, optimalMax: 110 }, trend: "stable" },
  { id: "75", name: "Copper", value: 105, unit: "µg/dL", category: "Vitamins & Minerals", status: "optimal", referenceRange: { min: 70, max: 155, optimalMin: 85, optimalMax: 130 }, trend: "stable" },
  { id: "76", name: "Selenium", value: 145, unit: "µg/L", category: "Vitamins & Minerals", status: "optimal", referenceRange: { min: 70, max: 200, optimalMin: 100, optimalMax: 170 }, trend: "stable" },
  { id: "77", name: "Iron", value: 95, unit: "µg/dL", category: "Vitamins & Minerals", status: "optimal", referenceRange: { min: 60, max: 170, optimalMin: 80, optimalMax: 140 }, trend: "stable" },
  { id: "78", name: "TIBC", value: 320, unit: "µg/dL", category: "Vitamins & Minerals", status: "optimal", referenceRange: { min: 250, max: 400, optimalMin: 280, optimalMax: 360 }, trend: "stable" },
  { id: "79", name: "Iodine (Urine)", value: 185, unit: "µg/L", category: "Vitamins & Minerals", status: "optimal", referenceRange: { min: 100, max: 300, optimalMin: 150, optimalMax: 250 }, trend: "stable" },
  { id: "80", name: "CoQ10", value: 1.2, unit: "µg/mL", category: "Vitamins & Minerals", status: "optimal", referenceRange: { min: 0.5, max: 2.0, optimalMin: 0.8, optimalMax: 1.6 }, trend: "up", previousValue: 0.9 },

  // Liver Function (8 markers)
  { id: "81", name: "ALT", value: 22, unit: "U/L", category: "Liver Function", status: "optimal", referenceRange: { min: 0, max: 41, optimalMin: 0, optimalMax: 25 }, trend: "stable" },
  { id: "82", name: "AST", value: 24, unit: "U/L", category: "Liver Function", status: "optimal", referenceRange: { min: 0, max: 40, optimalMin: 0, optimalMax: 25 }, trend: "stable" },
  { id: "83", name: "GGT", value: 22, unit: "U/L", category: "Liver Function", status: "optimal", referenceRange: { min: 0, max: 61, optimalMin: 0, optimalMax: 30 }, trend: "down", previousValue: 35 },
  { id: "84", name: "Alkaline Phosphatase", value: 65, unit: "U/L", category: "Liver Function", status: "optimal", referenceRange: { min: 44, max: 147, optimalMin: 50, optimalMax: 100 }, trend: "stable" },
  { id: "85", name: "Total Bilirubin", value: 0.8, unit: "mg/dL", category: "Liver Function", status: "optimal", referenceRange: { min: 0.1, max: 1.2, optimalMin: 0.2, optimalMax: 1.0 }, trend: "stable" },
  { id: "86", name: "Direct Bilirubin", value: 0.2, unit: "mg/dL", category: "Liver Function", status: "optimal", referenceRange: { min: 0, max: 0.3, optimalMin: 0, optimalMax: 0.25 }, trend: "stable" },
  { id: "87", name: "Albumin", value: 4.5, unit: "g/dL", category: "Liver Function", status: "optimal", referenceRange: { min: 3.5, max: 5.5, optimalMin: 4.0, optimalMax: 5.0 }, trend: "stable" },
  { id: "88", name: "Total Protein", value: 7.2, unit: "g/dL", category: "Liver Function", status: "optimal", referenceRange: { min: 6.0, max: 8.3, optimalMin: 6.5, optimalMax: 7.8 }, trend: "stable" },

  // Kidney Function (8 markers)
  { id: "89", name: "Creatinine", value: 0.95, unit: "mg/dL", category: "Kidney Function", status: "optimal", referenceRange: { min: 0.74, max: 1.35, optimalMin: 0.8, optimalMax: 1.1 }, trend: "stable" },
  { id: "90", name: "BUN", value: 15, unit: "mg/dL", category: "Kidney Function", status: "optimal", referenceRange: { min: 6, max: 24, optimalMin: 10, optimalMax: 18 }, trend: "stable" },
  { id: "91", name: "eGFR", value: 98, unit: "mL/min/1.73m²", category: "Kidney Function", status: "optimal", referenceRange: { min: 90, max: 120, optimalMin: 90, optimalMax: 120 }, trend: "stable" },
  { id: "92", name: "Cystatin C", value: 0.82, unit: "mg/L", category: "Kidney Function", status: "optimal", referenceRange: { min: 0.53, max: 0.95, optimalMin: 0.6, optimalMax: 0.9 }, trend: "stable" },
  { id: "93", name: "Microalbumin (Urine)", value: 12, unit: "mg/L", category: "Kidney Function", status: "optimal", referenceRange: { min: 0, max: 30, optimalMin: 0, optimalMax: 20 }, trend: "down", previousValue: 22 },
  { id: "94", name: "Urine ACR", value: 8, unit: "mg/g", category: "Kidney Function", status: "optimal", referenceRange: { min: 0, max: 30, optimalMin: 0, optimalMax: 15 }, trend: "stable" },
  { id: "95", name: "Sodium", value: 140, unit: "mEq/L", category: "Kidney Function", status: "optimal", referenceRange: { min: 136, max: 145, optimalMin: 138, optimalMax: 143 }, trend: "stable" },
  { id: "96", name: "Potassium", value: 4.2, unit: "mEq/L", category: "Kidney Function", status: "optimal", referenceRange: { min: 3.5, max: 5.0, optimalMin: 3.8, optimalMax: 4.5 }, trend: "stable" },

  // Blood Count (10 markers)
  { id: "97", name: "Hemoglobin", value: 15.2, unit: "g/dL", category: "Blood Count", status: "optimal", referenceRange: { min: 13.5, max: 17.5, optimalMin: 14.0, optimalMax: 16.5 }, trend: "stable" },
  { id: "98", name: "Hematocrit", value: 45, unit: "%", category: "Blood Count", status: "optimal", referenceRange: { min: 38.3, max: 48.6, optimalMin: 42, optimalMax: 48 }, trend: "stable" },
  { id: "99", name: "RBC Count", value: 5.1, unit: "M/µL", category: "Blood Count", status: "optimal", referenceRange: { min: 4.5, max: 5.5, optimalMin: 4.7, optimalMax: 5.3 }, trend: "stable" },
  { id: "100", name: "WBC Count", value: 6.5, unit: "K/µL", category: "Blood Count", status: "optimal", referenceRange: { min: 4.5, max: 11.0, optimalMin: 5.0, optimalMax: 8.5 }, trend: "stable" },
  { id: "101", name: "Platelet Count", value: 245, unit: "K/µL", category: "Blood Count", status: "optimal", referenceRange: { min: 150, max: 400, optimalMin: 180, optimalMax: 320 }, trend: "stable" },
  { id: "102", name: "MCV", value: 88, unit: "fL", category: "Blood Count", status: "optimal", referenceRange: { min: 80, max: 100, optimalMin: 84, optimalMax: 94 }, trend: "stable" },
  { id: "103", name: "MCH", value: 30, unit: "pg", category: "Blood Count", status: "optimal", referenceRange: { min: 27, max: 33, optimalMin: 28, optimalMax: 32 }, trend: "stable" },
  { id: "104", name: "MCHC", value: 34, unit: "g/dL", category: "Blood Count", status: "optimal", referenceRange: { min: 32, max: 36, optimalMin: 33, optimalMax: 35 }, trend: "stable" },
  { id: "105", name: "RDW", value: 12.8, unit: "%", category: "Blood Count", status: "optimal", referenceRange: { min: 11.5, max: 14.5, optimalMin: 12, optimalMax: 14 }, trend: "stable" },
  { id: "106", name: "Reticulocyte Count", value: 1.2, unit: "%", category: "Blood Count", status: "optimal", referenceRange: { min: 0.5, max: 2.5, optimalMin: 0.8, optimalMax: 2.0 }, trend: "stable" },
];

const mockTests: BiomarkerTest[] = [
  {
    id: "1",
    userId: "1",
    testDate: new Date("2024-11-20"),
    testType: "comprehensive",
    labPartner: "Quest Diagnostics & Thyrocare Advanced Panel",
    status: "completed",
    markers: mockBiomarkers,
    calculatedMetrics: { 
      biologicalAge: 35, 
      chronologicalAge: 42, 
      healthScore: 87, 
      inflammationScore: 94, 
      metabolicScore: 84, 
      cardiovascularScore: 89,
      immuneScore: 86,
      hormonalBalance: 81,
      nutritionalStatus: 88,
      detoxCapacity: 79,
    },
    riskFactors: [
      { category: "Cardiovascular", risk: "low", description: "Optimal lipid profile and low inflammatory markers" },
      { category: "Metabolic", risk: "low", description: "Excellent glucose control and insulin sensitivity" },
      { category: "Longevity", risk: "low", description: "Biological age 7 years younger than chronological age" },
    ],
    trendAnalysis: {
      improving: ["Vitamin D", "HDL Cholesterol", "hsCRP", "Testosterone", "Magnesium"],
      stable: ["Thyroid Panel", "Kidney Function", "Liver Function", "Blood Count"],
      needsAttention: [],
    },
    physicianReviewed: true,
    physicianId: "dr-sharma-001",
    physicianNotes: "Excellent progress across all domains. Continue current protocol with focus on vitamin D optimization. Recommend retest in 90 days. Consider adding omega-3 index testing on next panel.",
    reviewedAt: new Date("2024-11-22"),
    rawDataUrl: null,
    createdAt: new Date("2024-11-20"),
    updatedAt: new Date("2024-11-22"),
  },
  {
    id: "2",
    userId: "1",
    testDate: new Date("2024-08-15"),
    testType: "comprehensive",
    labPartner: "Quest Diagnostics",
    status: "completed",
    markers: [],
    calculatedMetrics: { 
      biologicalAge: 37, 
      chronologicalAge: 42, 
      healthScore: 79, 
      inflammationScore: 82, 
      metabolicScore: 72, 
      cardiovascularScore: 81,
    },
    riskFactors: [
      { category: "Inflammatory", risk: "moderate", description: "Elevated hsCRP requires monitoring" },
      { category: "Nutritional", risk: "low", description: "Vitamin D suboptimal but improving" },
    ],
    trendAnalysis: null,
    physicianReviewed: true,
    physicianId: "dr-sharma-001",
    physicianNotes: "Initial baseline assessment. Started personalized protocol targeting inflammation and vitamin D.",
    reviewedAt: new Date("2024-08-18"),
    rawDataUrl: null,
    createdAt: new Date("2024-08-15"),
    updatedAt: new Date("2024-08-18"),
  },
];

export default function Biomarkers() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importStep, setImportStep] = useState(1);
  const [selectedLabPartner, setSelectedLabPartner] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);

  const { data: tests, isLoading } = useQuery<BiomarkerTest[]>({
    queryKey: ["/api/biomarkers"],
    retry: false,
  });

  const { data: labImports = [] } = useQuery<LabDataImport[]>({
    queryKey: ["/api/lab/imports"],
    retry: false,
  });

  const importLabDataMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/lab/import", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Import failed");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/biomarkers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/lab/imports"] });
      toast({
        title: "Import Successful",
        description: "Your lab data has been imported and processed.",
      });
      resetImportWizard();
    },
    onError: () => {
      toast({
        title: "Import Failed",
        description: "Failed to import lab data. Please check the file format.",
        variant: "destructive",
      });
      setIsImporting(false);
    },
  });

  const displayTests = tests || mockTests;
  const latestTest = displayTests[0];
  const markers = (latestTest?.markers as BiomarkerReading[]) || mockBiomarkers;

  const filteredMarkers = markers.filter((marker) => {
    const matchesSearch = marker.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All Categories" || marker.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || marker.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const statusCounts = markers.reduce((acc, marker) => {
    acc[marker.status] = (acc[marker.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const resetImportWizard = () => {
    setImportDialogOpen(false);
    setImportStep(1);
    setSelectedLabPartner("");
    setSelectedFormat("");
    setUploadedFile(null);
    setImportProgress(0);
    setIsImporting(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleImport = async () => {
    if (!uploadedFile || !selectedLabPartner || !selectedFormat) return;

    setIsImporting(true);
    setImportProgress(0);

    const interval = setInterval(() => {
      setImportProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    const formData = new FormData();
    formData.append("file", uploadedFile);
    formData.append("labPartner", selectedLabPartner);
    formData.append("format", selectedFormat);

    try {
      await importLabDataMutation.mutateAsync(formData);
      setImportProgress(100);
    } catch {
      clearInterval(interval);
    }
  };

  const getImportStatusColor = (status: string) => {
    switch (status) {
      case "processed": return "bg-green-100 text-green-700";
      case "pending": return "bg-amber-100 text-amber-700";
      case "received": return "bg-blue-100 text-blue-700";
      case "error": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getImportStatusIcon = (status: string) => {
    switch (status) {
      case "processed": return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "pending": return <Clock className="w-4 h-4 text-amber-600" />;
      case "received": return <RefreshCw className="w-4 h-4 text-blue-600" />;
      case "error": return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const TrendIcon = ({ trend }: { trend?: string }) => {
    if (trend === "up") return <TrendingUp className="w-4 h-4 text-chart-2" />;
    if (trend === "down") return <TrendingDown className="w-4 h-4 text-chart-1" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Biomarkers</h1>
          <p className="text-muted-foreground">
            Comprehensive analysis of your 400+ health markers
          </p>
        </div>
        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-upload-test">
              <Upload className="w-4 h-4 mr-2" />
              Import Lab Results
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Beaker className="w-5 h-5" />
                Import Lab Results
              </DialogTitle>
              <DialogDescription>
                Import your lab results from partner laboratories or upload your own data.
              </DialogDescription>
            </DialogHeader>

            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-6">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      importStep >= step
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-20 h-1 mx-2 ${
                        importStep > step ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Select Lab Partner */}
            {importStep === 1 && (
              <div className="space-y-4">
                <Label>Select Lab Partner</Label>
                <div className="grid grid-cols-2 gap-3">
                  {labPartners.map((lab) => (
                    <Card
                      key={lab.id}
                      className={`cursor-pointer transition-colors ${
                        selectedLabPartner === lab.id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedLabPartner(lab.id)}
                      data-testid={`lab-partner-${lab.id}`}
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <span className="w-10 h-10 rounded-md bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">{lab.abbr}</span>
                        <span className="font-medium">{lab.name}</span>
                        {selectedLabPartner === lab.id && (
                          <CheckCircle className="w-4 h-4 text-primary ml-auto" />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Select Format */}
            {importStep === 2 && (
              <div className="space-y-4">
                <Label>Select Data Format</Label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: "hl7", name: "HL7 v2.x", description: "Standard healthcare messaging format", icon: FileCode },
                    { id: "fhir", name: "HL7 FHIR", description: "Modern interoperability standard (JSON)", icon: FileJson },
                    { id: "json", name: "JSON", description: "Generic JSON format with biomarker data", icon: FileJson },
                    { id: "csv", name: "CSV", description: "Comma-separated values spreadsheet", icon: FileText },
                    { id: "pdf", name: "PDF Report", description: "Scanned or digital lab report (AI extraction)", icon: FileText },
                  ].map((format) => (
                    <Card
                      key={format.id}
                      className={`cursor-pointer transition-colors ${
                        selectedFormat === format.id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedFormat(format.id)}
                      data-testid={`format-${format.id}`}
                    >
                      <CardContent className="p-4 flex items-center gap-4">
                        <format.icon className="w-8 h-8 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium">{format.name}</p>
                          <p className="text-sm text-muted-foreground">{format.description}</p>
                        </div>
                        {selectedFormat === format.id && (
                          <CheckCircle className="w-5 h-5 text-primary" />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Upload File */}
            {importStep === 3 && (
              <div className="space-y-4">
                {!isImporting ? (
                  <>
                    <Label>Upload Lab Data File</Label>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      {uploadedFile ? (
                        <div className="space-y-3">
                          <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
                          <p className="font-medium">{uploadedFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(uploadedFile.size / 1024).toFixed(2)} KB
                          </p>
                          <Button variant="outline" size="sm" onClick={() => setUploadedFile(null)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                          <p className="text-muted-foreground">
                            Drag and drop your file here, or click to browse
                          </p>
                          <Input
                            type="file"
                            className="max-w-[200px] mx-auto"
                            accept={selectedFormat === "pdf" ? ".pdf" : selectedFormat === "csv" ? ".csv" : ".json,.hl7,.xml"}
                            onChange={handleFileUpload}
                            data-testid="input-file-upload"
                          />
                        </div>
                      )}
                    </div>

                    <Alert>
                      <AlertCircle className="w-4 h-4" />
                      <AlertDescription>
                        Your data is encrypted and processed securely. Lab results will be parsed and added to your biomarker history.
                      </AlertDescription>
                    </Alert>
                  </>
                ) : (
                  <div className="space-y-4 py-8">
                    <div className="text-center">
                      <RefreshCw className="w-12 h-12 text-primary mx-auto animate-spin mb-4" />
                      <p className="font-medium">Processing your lab data...</p>
                      <p className="text-sm text-muted-foreground">
                        {importProgress < 30 && "Parsing file..."}
                        {importProgress >= 30 && importProgress < 60 && "Extracting biomarkers..."}
                        {importProgress >= 60 && importProgress < 90 && "Validating data..."}
                        {importProgress >= 90 && "Finalizing..."}
                      </p>
                    </div>
                    <Progress value={importProgress} className="h-2" />
                    <p className="text-center text-sm text-muted-foreground">{importProgress}% complete</p>
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  if (importStep > 1) {
                    setImportStep(importStep - 1);
                  } else {
                    resetImportWizard();
                  }
                }}
                disabled={isImporting}
              >
                {importStep === 1 ? "Cancel" : "Back"}
              </Button>
              <Button
                onClick={() => {
                  if (importStep < 3) {
                    setImportStep(importStep + 1);
                  } else {
                    handleImport();
                  }
                }}
                disabled={
                  (importStep === 1 && !selectedLabPartner) ||
                  (importStep === 2 && !selectedFormat) ||
                  (importStep === 3 && !uploadedFile) ||
                  isImporting
                }
                data-testid="button-next-step"
              >
                {importStep === 3 ? (
                  isImporting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Import Data
                    </>
                  )
                ) : (
                  "Continue"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="results" className="space-y-4">
        <TabsList>
          <TabsTrigger value="results" className="flex items-center gap-2" data-testid="tab-results">
            <Activity className="w-4 h-4" />
            Results
          </TabsTrigger>
          <TabsTrigger value="imports" className="flex items-center gap-2" data-testid="tab-imports">
            <FileText className="w-4 h-4" />
            Import History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="hover-elevate">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-chart-2" data-testid="text-count-optimal">
                  {statusCounts.optimal || 0}
                </div>
                <p className="text-sm text-muted-foreground">Optimal</p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-chart-3" data-testid="text-count-normal">
                  {statusCounts.normal || 0}
                </div>
                <p className="text-sm text-muted-foreground">Normal</p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600" data-testid="text-count-borderline">
                  {statusCounts.borderline || 0}
                </div>
                <p className="text-sm text-muted-foreground">Borderline</p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600" data-testid="text-count-concerning">
                  {statusCounts.concerning || 0}
                </div>
                <p className="text-sm text-muted-foreground">Concerning</p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-destructive" data-testid="text-count-critical">
                  {statusCounts.critical || 0}
                </div>
                <p className="text-sm text-muted-foreground">Critical</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Biomarker Results</CardTitle>
                  {latestTest && (
                    <Badge variant="secondary" className="ml-2">
                      <Calendar className="w-3 h-3 mr-1" />
                      {format(new Date(latestTest.testDate), "MMM d, yyyy")}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search markers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-[200px]"
                      data-testid="input-search-markers"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[180px]" data-testid="select-category">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-[140px]" data-testid="select-status">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="optimal">Optimal</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="borderline">Borderline</SelectItem>
                      <SelectItem value="concerning">Concerning</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[40px]"></TableHead>
                      <TableHead>Marker</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Trend</TableHead>
                      <TableHead className="text-right">Reference Range</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMarkers.map((marker) => (
                      <Fragment key={marker.id}>
                        <TableRow
                          className="cursor-pointer hover:bg-muted/30"
                          onClick={() => toggleRow(marker.id)}
                          data-testid={`row-marker-${marker.id}`}
                        >
                          <TableCell className="w-[40px]">
                            {expandedRows.has(marker.id) ? (
                              <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{marker.name}</TableCell>
                          <TableCell className="text-muted-foreground">{marker.category}</TableCell>
                          <TableCell className="text-right font-mono">
                            {marker.value} {marker.unit}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={`${statusColors[marker.status]} capitalize`}>
                              {marker.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center">
                              <TrendIcon trend={marker.trend} />
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground text-sm">
                            {marker.referenceRange.min} - {marker.referenceRange.max} {marker.unit}
                          </TableCell>
                        </TableRow>
                        {expandedRows.has(marker.id) && (
                          <TableRow className="bg-muted/20">
                            <TableCell colSpan={7} className="p-4">
                              <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                  <p className="text-sm font-medium mb-1">Optimal Range</p>
                                  <p className="text-sm text-muted-foreground">
                                    {marker.referenceRange.optimalMin} - {marker.referenceRange.optimalMax} {marker.unit}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium mb-1">Previous Value</p>
                                  <p className="text-sm text-muted-foreground">
                                    {marker.previousValue ? `${marker.previousValue} ${marker.unit}` : "No previous data"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium mb-1">Trend</p>
                                  <p className="text-sm text-muted-foreground capitalize">
                                    {marker.trend || "Stable"}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 text-sm text-muted-foreground text-center">
                Showing {filteredMarkers.length} of {markers.length} markers
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="imports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Import History
              </CardTitle>
              <CardDescription>
                Track the status of your lab data imports
              </CardDescription>
            </CardHeader>
            <CardContent>
              {labImports.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Upload className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No imports yet</p>
                  <p className="text-sm mb-4">Import your first lab results to get started</p>
                  <Button onClick={() => setImportDialogOpen(true)} data-testid="button-first-import">
                    <Upload className="w-4 h-4 mr-2" />
                    Import Lab Results
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {labImports.map((importItem) => (
                      <div
                        key={importItem.id}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        data-testid={`import-${importItem.id}`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            {getImportStatusIcon(importItem.status || "pending")}
                            <div>
                              <p className="font-medium">{importItem.labPartner}</p>
                              <p className="text-sm text-muted-foreground">
                                {importItem.format?.toUpperCase()} format
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={getImportStatusColor(importItem.status || "pending")}>
                              {importItem.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {importItem.receivedAt
                                ? formatDistanceToNow(new Date(importItem.receivedAt), { addSuffix: true })
                                : "Unknown"}
                            </span>
                            {importItem.biomarkerTestId && (
                              <Button variant="ghost" size="icon" title="View Results">
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        {importItem.errorMessage && (
                          <Alert variant="destructive" className="mt-3">
                            <AlertCircle className="w-4 h-4" />
                            <AlertDescription>{importItem.errorMessage}</AlertDescription>
                          </Alert>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
