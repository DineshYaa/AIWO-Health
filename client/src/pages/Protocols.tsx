import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pill,
  Utensils,
  Dumbbell,
  Moon,
  Sparkles,
  Clock,
  Info,
  RefreshCw,
  Target,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Protocol, SupplementItem, NutritionPlan, ExercisePlan, SleepPlan } from "@shared/schema";

const mockSupplements: SupplementItem[] = [
  { id: "1", name: "Vitamin D3 + K2 Complex", dosage: "5000 IU D3 / 200mcg K2-MK7", frequency: "daily", timing: "Morning with fat-containing breakfast", rationale: "Vitamin D at 52 ng/mL - maintaining optimal 50-80 ng/mL range. K2 synergistically directs calcium to bones, preventing arterial calcification. Essential for immune function, gene expression, and longevity pathways." },
  { id: "2", name: "Omega-3 Ultra (Triglyceride Form)", dosage: "3g total (1800mg EPA / 1200mg DHA)", frequency: "daily", timing: "Split dose: 1.5g with lunch, 1.5g with dinner", rationale: "Pharmaceutical-grade fish oil for optimal omega-3 index (target >8%). Reduces inflammation (hsCRP now 0.8 mg/L), supports brain health, membrane fluidity, and cardiovascular protection." },
  { id: "3", name: "Magnesium Glycinate/Threonate", dosage: "400mg Glycinate + 144mg Threonate", frequency: "daily", timing: "Glycinate at bedtime, Threonate morning", rationale: "Magnesium RBC at 5.8 mg/dL - optimal range. Glycinate for sleep and muscle relaxation. Threonate crosses blood-brain barrier for cognitive support. Cofactor in 600+ enzymatic reactions." },
  { id: "4", name: "NMN (Nicotinamide Mononucleotide)", dosage: "500mg", frequency: "daily", timing: "Morning on empty stomach, sublingual", rationale: "NAD+ precursor for cellular energy metabolism, DNA repair, and sirtuin activation. Supports mitochondrial function and healthy aging at the cellular level." },
  { id: "5", name: "CoQ10 Ubiquinol", dosage: "200mg", frequency: "daily", timing: "Morning with fat", rationale: "Active form of CoQ10 for mitochondrial electron transport chain. Supports cardiac muscle energy, antioxidant protection, and statin therapy support if needed." },
  { id: "6", name: "NAC (N-Acetyl Cysteine)", dosage: "600mg", frequency: "daily", timing: "Morning, 30 min before food", rationale: "Rate-limiting precursor for glutathione synthesis. Supports liver detoxification, respiratory health, and oxidative stress reduction." },
  { id: "7", name: "Curcumin Phytosome", dosage: "500mg (Meriva form)", frequency: "daily", timing: "With meals", rationale: "Highly bioavailable curcumin for NF-kB pathway modulation. Supports healthy inflammatory response and joint comfort." },
  { id: "8", name: "Alpha-Lipoic Acid (R-form)", dosage: "300mg", frequency: "daily", timing: "Morning, empty stomach", rationale: "Universal antioxidant supporting both water and fat-soluble environments. Regenerates vitamin C, E, and glutathione. Supports glucose metabolism." },
  { id: "9", name: "Creatine Monohydrate", dosage: "5g", frequency: "daily", timing: "Post-workout or with meals", rationale: "Supports ATP regeneration for strength, power output, and cognitive performance. One of the most researched supplements for muscle and brain health." },
  { id: "10", name: "Berberine HCl", dosage: "500mg", frequency: "twice daily", timing: "With meals", rationale: "AMPK activator supporting metabolic health, glucose regulation, and lipid metabolism. Works synergistically with lifestyle interventions." },
  { id: "11", name: "Resveratrol + Pterostilbene", dosage: "250mg / 50mg", frequency: "daily", timing: "Morning with fat", rationale: "Polyphenols activating SIRT1 pathway for longevity. Pterostilbene has superior bioavailability. Supports cardiovascular and cognitive health." },
  { id: "12", name: "Selenium + Zinc Complex", dosage: "200mcg Se / 25mg Zn", frequency: "daily", timing: "With dinner", rationale: "Essential trace minerals for immune function, thyroid metabolism, and antioxidant enzyme systems (glutathione peroxidase, SOD)." },
  { id: "13", name: "Vitamin B Complex (Methylated)", dosage: "B12 1000mcg / Folate 800mcg", frequency: "daily", timing: "Morning", rationale: "Active methylated forms for optimal absorption. B12 at 680 pg/mL. Supports methylation, homocysteine metabolism (7.8 µmol/L), energy, and nervous system." },
  { id: "14", name: "Glycine", dosage: "3g", frequency: "nightly", timing: "30 minutes before bed", rationale: "Amino acid supporting collagen synthesis, glutathione production, and sleep quality through glycine receptor activation and core body temperature regulation." },
  { id: "15", name: "Ashwagandha KSM-66", dosage: "600mg", frequency: "daily", timing: "Morning or before exercise", rationale: "Adaptogenic herb supporting HPA axis balance, cortisol modulation, thyroid function, and exercise recovery. Reduces perceived stress." },
];

const mockNutrition: NutritionPlan = {
  calorieTarget: 2400,
  macros: { protein: 180, carbs: 200, fat: 95 },
  principles: [
    "Mediterranean-Longevity Hybrid Pattern - combining Blue Zone wisdom with modern nutritional science",
    "Protein-First Strategy: 1.6-2.0g/kg lean body mass for muscle protein synthesis and satiety",
    "Time-Restricted Eating: 16:8 intermittent fasting window (12 PM - 8 PM eating window)",
    "Glycemic Load Optimization: Emphasize low-GI carbohydrates, always pair with protein/fat",
    "Polyphenol-Rich Foods: Daily berries, dark chocolate (>85% cacao), green tea, olive oil",
    "Prebiotic Fiber Target: 30-40g daily for microbiome diversity and gut-brain axis support",
    "Anti-Inflammatory Focus: Omega-3 rich foods, turmeric, ginger, leafy greens, cruciferous vegetables",
    "Hydration Protocol: 3L water daily, electrolytes, limit caffeine to morning hours",
  ],
  restrictions: [
    "Eliminate ultra-processed foods (NOVA Group 4)",
    "Limit added sugars to <20g/day (natural sugars in whole fruits acceptable)",
    "Minimize refined grains - choose whole grain or ancient grain alternatives",
    "Avoid seed oils - use extra virgin olive oil, avocado oil, or coconut oil",
    "Reduce alcohol to 2-3 servings/week maximum (red wine preferred)",
    "No artificial sweeteners - may disrupt gut microbiome and insulin signaling",
  ],
  mealPlan: {
    breakfast: [
      "Greek yogurt parfait: 200g full-fat Greek yogurt, 100g mixed berries, 30g walnuts, 1 tbsp chia seeds, drizzle of raw honey",
      "Smoked salmon plate: 150g wild salmon, 2 poached eggs, sliced avocado, capers, red onion on sprouted grain toast",
      "Protein smoothie bowl: whey isolate, frozen berries, spinach, almond butter, collagen peptides, topped with cacao nibs",
      "Spanish tortilla: 3-egg omelet with sautéed vegetables, goat cheese, served with sliced tomatoes and olive oil",
    ],
    lunch: [
      "Mediterranean power bowl: grilled chicken thigh, quinoa, roasted vegetables, feta, olives, tahini dressing, fresh herbs",
      "Wild salmon salad: 200g grilled salmon, mixed greens, avocado, cherry tomatoes, cucumber, extra virgin olive oil, lemon",
      "Lentil soup with bone broth base, paired with grilled halloumi and arugula salad with walnuts",
      "Grass-fed beef stir-fry with colorful vegetables, served over cauliflower rice with coconut aminos",
    ],
    dinner: [
      "Pan-seared wild salmon: 200g with roasted asparagus, sautéed spinach, and herb butter sauce",
      "Grass-fed ribeye (200g): with roasted root vegetables, grilled portobello mushrooms, and chimichurri",
      "Mediterranean chicken: marinated in olive oil, lemon, garlic with roasted bell peppers and zucchini",
      "Seafood paella: wild shrimp, mussels, calamari with saffron-infused cauliflower rice and vegetables",
    ],
    snacks: [
      "Macadamia and brazil nut mix (30g) with 2 squares dark chocolate (85%+)",
      "Celery sticks with almond butter and hemp seeds",
      "Hard-boiled eggs (2) with everything bagel seasoning and avocado",
      "Bone broth (warm) with collagen peptides",
      "Green apple slices with tahini and cinnamon",
    ],
  },
};

const mockExercise: ExercisePlan = {
  zone2Cardio: {
    frequency: "4-5x per week",
    duration: "45-60 minutes per session",
    activities: [
      "Brisk incline walking (4.0 mph, 3-5% incline) - Heart rate 120-135 bpm",
      "Outdoor cycling - steady state, nasal breathing focus",
      "Swimming laps - continuous low intensity",
      "Rowing machine (damper 3-5) - focus on technique",
      "Rucking with 20-30lb pack on trails",
    ],
    heartRateTarget: "Zone 2: 60-70% max HR (120-140 bpm based on MAF formula)",
    benefits: "Builds aerobic base, improves mitochondrial density, enhances fat oxidation, supports longevity",
  },
  strengthTraining: {
    frequency: "3-4x per week",
    split: "Upper/Lower or Push/Pull/Legs rotation",
    exercises: [
      "Compound Lifts: Squats, Deadlifts, Bench Press, Overhead Press, Rows (5x5 or 4x6-8)",
      "Hip Hinges: Romanian Deadlifts, Hip Thrusts (3x8-12)",
      "Unilateral Work: Bulgarian Split Squats, Single-arm Rows, Lunges (3x10-12 each side)",
      "Pulling: Chin-ups/Pull-ups, Face Pulls, Cable Rows (3-4x8-12)",
      "Core: Anti-rotation pallof press, Dead bugs, Farmer carries (3x30-60s)",
    ],
    progression: "Progressive overload: Add 2.5-5lbs when hitting rep targets. Track all lifts in training log.",
    restPeriods: "2-3 min for heavy compounds, 60-90s for accessory work",
  },
  mobility: {
    frequency: "Daily (morning routine)",
    duration: "15-20 minutes",
    routine: [
      "Cat-Cow spinal mobilization (2 min)",
      "World's Greatest Stretch (2 min each side)",
      "90/90 hip stretches with rotation (2 min each side)",
      "Thoracic spine foam rolling and extensions (3 min)",
      "Shoulder CARs and wall slides (2 min)",
      "Deep squat hold with ankle mobilization (2 min)",
      "Diaphragmatic breathing with rib expansion (2 min)",
    ],
    tools: "Foam roller, lacrosse ball, resistance bands, yoga block",
  },
  hiit: {
    frequency: "1-2x per week",
    protocol: "4x4 Norwegian protocol or Tabata variations",
    examples: [
      "4x4 Protocol: 4 rounds of 4 min at 85-90% max HR, 3 min active recovery",
      "Assault bike sprints: 30s max effort, 90s rest x 8 rounds",
      "Battle ropes: 20s work, 40s rest x 10 rounds",
    ],
  },
};

const mockSleep: SleepPlan = {
  targetHours: 7.5,
  sleepWindow: "10:30 PM - 6:00 AM (consistent 7-day schedule)",
  bedtimeRoutine: [
    "6:00 PM: Last meal of day - allows 4+ hours for digestion before sleep",
    "8:00 PM: Dim all lights, activate blue light filters on devices, switch to amber lighting",
    "8:30 PM: No more screens - transition to reading, journaling, or relaxation",
    "9:00 PM: Begin wind-down: light stretching, meditation, or breathwork",
    "9:30 PM: Warm shower or bath (body temperature drop aids sleep onset)",
    "10:00 PM: Room temperature 65-68°F (18-20°C), complete darkness",
    "10:15 PM: Read fiction (no work/stimulating content) for 15 min",
    "10:30 PM: Lights out, sleep mask if needed, white noise or silence",
  ],
  optimizationTips: [
    "Morning Protocol: 10 min outdoor sunlight exposure within 30 min of waking - resets circadian rhythm",
    "Caffeine Cutoff: No caffeine after 12 PM (10-hour caffeine half-life consideration)",
    "Alcohol: Minimize or eliminate - significantly disrupts REM and deep sleep architecture",
    "Exercise Timing: Complete intense workouts by 6 PM to allow cortisol normalization",
    "Bedroom Environment: Cool (65-68°F), completely dark, quiet, phones in another room",
    "Consistent Schedule: Same wake time 7 days/week within 30 min variance",
    "Pre-Sleep Breathing: 4-7-8 technique or box breathing for parasympathetic activation",
    "Track with Wearable: Monitor deep sleep, REM, HRV to optimize over time",
  ],
  supplements: [
    "Magnesium Glycinate 400mg - 60 min before bed (relaxation, sleep quality)",
    "Glycine 3g - 30 min before bed (core temperature regulation, sleep depth)",
    "L-Theanine 200mg - with glycine (calming without sedation, synergy with magnesium)",
    "Apigenin 50mg - optional, derived from chamomile (mild sedative properties)",
  ],
  wearableTargets: {
    deepSleep: ">1.5 hours per night (13-23% of total sleep)",
    remSleep: ">1.5 hours per night (20-25% of total sleep)",
    sleepEfficiency: ">85% (time asleep / time in bed)",
    wakeEpisodes: "<3 per night",
    hrv: "Trending upward over 30-day average",
  },
};

const mockProtocol: Protocol = {
  id: "1",
  userId: "1",
  biomarkerTestId: "1",
  version: 3,
  generatedBy: "ai",
  status: "active",
  validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  goals: {
    primary: "Comprehensive longevity optimization - reduce biological age by 10+ years while maintaining peak performance",
    secondary: [
      "Optimize metabolic flexibility and insulin sensitivity",
      "Reduce systemic inflammation to lowest decile",
      "Maximize mitochondrial efficiency and NAD+ levels",
      "Achieve optimal hormonal balance for vitality and recovery",
      "Enhance cognitive performance and neuroprotection",
    ],
    targets: [
      { marker: "Vitamin D (25-OH)", current: 52, target: 65, timeframe: "60 days", priority: "high" },
      { marker: "hsCRP", current: 0.8, target: 0.5, timeframe: "90 days", priority: "high" },
      { marker: "HbA1c", current: 5.3, target: 5.0, timeframe: "90 days", priority: "medium" },
      { marker: "Omega-3 Index", current: 6.2, target: 8.0, timeframe: "120 days", priority: "high" },
      { marker: "Testosterone (Total)", current: 620, target: 700, timeframe: "90 days", priority: "medium" },
      { marker: "Homocysteine", current: 7.8, target: 6.5, timeframe: "60 days", priority: "medium" },
      { marker: "Deep Sleep Duration", current: 1.2, target: 1.8, timeframe: "30 days", priority: "high" },
    ],
  },
  supplements: mockSupplements,
  nutrition: mockNutrition,
  exercise: mockExercise,
  sleep: mockSleep,
  lifestyle: {
    stressManagement: [
      "Daily meditation practice: 20 min morning (Headspace or Waking Up app)",
      "Weekly sauna sessions: 20 min at 170-190°F for heat shock proteins",
      "Cold exposure: 2-3 min cold shower or ice bath 3x/week",
      "Breathwork: 10 min box breathing or Wim Hof method daily",
      "Nature exposure: Minimum 2 hours/week forest bathing or outdoor time",
    ],
    socialConnection: [
      "Maintain regular contact with close friends and family",
      "Participate in community or group activities weekly",
      "Cultivate meaningful relationships over surface-level interactions",
    ],
    cognitiveHealth: [
      "Language learning or musical instrument practice",
      "Reading: 30 min daily (diverse topics)",
      "Puzzles, chess, or cognitive training games",
      "Limit passive screen time; prioritize active engagement",
    ],
  },
  aiMetadata: { 
    model: "GPT-5 Longevity Specialist", 
    confidence: 0.94, 
    generatedAt: new Date().toISOString(),
    dataPointsAnalyzed: 412,
    protocolVersion: "v3.2.1",
    personalizationScore: 0.91,
  },
  physicianReviewed: true,
  physicianId: "dr-sharma-001",
  physicianNotes: "Protocol v3 approved after comprehensive biomarker review. Patient shows excellent progress on inflammation markers. Increased omega-3 dosage recommended. Schedule 6-week follow-up for testosterone and Vitamin D recheck. Consider adding DEXA scan for body composition baseline.",
  complianceScore: 94,
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
};

export default function Protocols() {
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set(["sup-1"]));
  const { toast } = useToast();

  const { data: protocol, isLoading } = useQuery<Protocol>({
    queryKey: ["/api/protocols/active"],
    retry: false,
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/protocols/generate");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/protocols/active"] });
      toast({
        title: "Protocol Generated",
        description: "Your personalized health protocol has been created.",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate protocol. Please try again.",
        variant: "destructive",
      });
    },
  });

  const displayProtocol = protocol || mockProtocol;
  const supplements = (displayProtocol.supplements as SupplementItem[]) || mockSupplements;
  const nutrition = (displayProtocol.nutrition as NutritionPlan) || mockNutrition;
  const exercise = (displayProtocol.exercise as ExercisePlan) || mockExercise;
  const sleep = (displayProtocol.sleep as SleepPlan) || mockSleep;
  const goals = displayProtocol.goals as { primary: string; targets: { marker: string; current: number; target: number; timeframe: string }[] } | null;

  const toggleItem = (id: string) => {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(id)) {
      newCompleted.delete(id);
    } else {
      newCompleted.add(id);
    }
    setCompletedItems(newCompleted);
  };

  const compliancePercentage = Math.round((completedItems.size / supplements.length) * 100);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Health Protocol</h1>
          <p className="text-muted-foreground">
            AI-powered personalized health optimization plan
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            data-testid="button-generate-protocol"
          >
            {generateMutation.isPending ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Generate New Protocol
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Protocol Goals</CardTitle>
              </div>
              <Badge variant="secondary" className="text-chart-2">
                <CheckCircle className="w-3 h-3 mr-1" />
                Physician Reviewed
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{goals?.primary}</p>
            <div className="grid sm:grid-cols-3 gap-4">
              {goals?.targets?.map((target, index) => (
                <div key={index} className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium mb-2">{target.marker}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold">{target.current}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-lg font-bold text-chart-2">{target.target}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{target.timeframe}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Daily Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <span className="text-5xl font-bold" data-testid="text-compliance-score">
                {compliancePercentage}%
              </span>
            </div>
            <Progress value={compliancePercentage} className="h-3 mb-4" />
            <p className="text-sm text-muted-foreground text-center">
              {completedItems.size} of {supplements.length} supplements taken today
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="supplements" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
          <TabsTrigger value="supplements" className="flex items-center gap-2" data-testid="tab-supplements">
            <Pill className="w-4 h-4" />
            <span className="hidden sm:inline">Supplements</span>
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="flex items-center gap-2" data-testid="tab-nutrition">
            <Utensils className="w-4 h-4" />
            <span className="hidden sm:inline">Nutrition</span>
          </TabsTrigger>
          <TabsTrigger value="exercise" className="flex items-center gap-2" data-testid="tab-exercise">
            <Dumbbell className="w-4 h-4" />
            <span className="hidden sm:inline">Exercise</span>
          </TabsTrigger>
          <TabsTrigger value="sleep" className="flex items-center gap-2" data-testid="tab-sleep">
            <Moon className="w-4 h-4" />
            <span className="hidden sm:inline">Sleep</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="supplements" className="space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Pill className="w-5 h-5 text-primary" />
                Daily Supplement Protocol
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="space-y-3">
                {supplements.map((supp) => {
                  const itemId = `sup-${supp.id}`;
                  const isCompleted = completedItems.has(itemId);
                  
                  return (
                    <AccordionItem key={supp.id} value={supp.id} className="border rounded-lg px-4">
                      <div className="flex items-center gap-4 py-4">
                        <Checkbox
                          checked={isCompleted}
                          onCheckedChange={() => toggleItem(itemId)}
                          data-testid={`checkbox-supplement-${supp.id}`}
                        />
                        <AccordionTrigger className="hover:no-underline flex-1 py-0">
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                                {supp.name}
                              </span>
                              <Badge variant="secondary" className="text-xs">{supp.dosage}</Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <Clock className="w-3 h-3" />
                              {supp.timing}
                            </div>
                          </div>
                        </AccordionTrigger>
                      </div>
                      <AccordionContent className="pb-4">
                        <div className="pl-10 pt-2 border-t">
                          <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Info className="w-4 h-4 mt-0.5 shrink-0" />
                            <p>{supp.rationale}</p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nutrition" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Daily Targets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold" data-testid="text-calories">{nutrition.calorieTarget}</div>
                    <p className="text-xs text-muted-foreground">Calories</p>
                  </div>
                  <div className="p-3 rounded-lg bg-chart-1/10">
                    <div className="text-2xl font-bold text-chart-1">{nutrition.macros.protein}g</div>
                    <p className="text-xs text-muted-foreground">Protein</p>
                  </div>
                  <div className="p-3 rounded-lg bg-chart-2/10">
                    <div className="text-2xl font-bold text-chart-2">{nutrition.macros.carbs}g</div>
                    <p className="text-xs text-muted-foreground">Carbs</p>
                  </div>
                  <div className="p-3 rounded-lg bg-chart-3/10">
                    <div className="text-2xl font-bold text-chart-3">{nutrition.macros.fat}g</div>
                    <p className="text-xs text-muted-foreground">Fat</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Core Principles</h4>
                  <ul className="space-y-2">
                    {nutrition.principles.map((principle, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-chart-2 mt-0.5 shrink-0" />
                        {principle}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Things to Limit</h4>
                  <ul className="space-y-2">
                    {nutrition.restrictions?.map((restriction, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                        {restriction}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-primary" />
                  Sample Meal Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(nutrition.mealPlan || {}).map(([meal, items]) => (
                  <div key={meal} className="p-4 rounded-lg bg-muted/50">
                    <h4 className="font-medium capitalize mb-2">{meal}</h4>
                    <ul className="space-y-1">
                      {(items as string[]).map((item, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground">• {item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="exercise" className="space-y-4">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-chart-1" />
                  Zone 2 Cardio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-lg font-bold">{exercise.zone2Cardio.frequency}</p>
                    <p className="text-xs text-muted-foreground">Frequency</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-lg font-bold">{exercise.zone2Cardio.duration}</p>
                    <p className="text-xs text-muted-foreground">Duration</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Recommended Activities</h4>
                  <ul className="space-y-1">
                    {exercise.zone2Cardio.activities.map((activity, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground">• {activity}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-chart-2" />
                  Strength Training
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-lg font-bold">{exercise.strengthTraining.frequency}</p>
                    <p className="text-xs text-muted-foreground">Frequency</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-lg font-bold">{exercise.strengthTraining.split}</p>
                    <p className="text-xs text-muted-foreground">Split</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Focus Areas</h4>
                  <ul className="space-y-1">
                    {exercise.strengthTraining.exercises.map((ex, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground">• {ex}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-chart-3" />
                  Mobility Work
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-lg font-bold">{exercise.mobility?.frequency}</p>
                    <p className="text-xs text-muted-foreground">Frequency</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-lg font-bold">{exercise.mobility?.duration}</p>
                    <p className="text-xs text-muted-foreground">Duration</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Daily Routine</h4>
                  <ul className="space-y-1">
                    {exercise.mobility?.routine.map((item, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground">• {item}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sleep" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Moon className="w-5 h-5 text-primary" />
                  Sleep Target
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <span className="text-5xl font-bold" data-testid="text-sleep-target">{sleep.targetHours}</span>
                  <span className="text-2xl text-muted-foreground ml-2">hours</span>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Bedtime Routine</h4>
                  <ul className="space-y-2">
                    {sleep.bedtimeRoutine.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-chart-2 mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {sleep.supplements && sleep.supplements.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Sleep Supplements</h4>
                    <ul className="space-y-2">
                      {sleep.supplements.map((supp, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Pill className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          {supp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Optimization Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {sleep.optimizationTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">{idx + 1}</span>
                      </div>
                      <span className="text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
