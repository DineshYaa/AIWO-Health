import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar as CalendarIcon,
  MapPin,
  Users,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Star,
  Clock,
  Sparkles,
  Loader2,
  AlertCircle,
  Shield,
} from "lucide-react";
import { format, addDays } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useSearch } from "wouter";
import type { GuestInfo, Location, ProgramDetails } from "@shared/schema";

const programs: ProgramDetails[] = [
  {
    type: "three_day_weekend",
    name: "3-Day Executive Reset",
    nights: 3,
    description: "A concentrated longevity immersion designed for high-performing executives. Experience rapid health optimization with cutting-edge diagnostics and personalized protocols crafted by our world-class medical team.",
    includes: [
      "120+ Core Biomarker Panel with same-day results",
      "2 Private Physician Consultations (60 min each)",
      "AI-Generated Personalized Protocol",
      "Executive Suite Accommodation",
      "Organic Chef-Curated Meals",
      "Stress Resilience Assessment",
      "Sleep Architecture Analysis",
      "Wearable Device Setup & Calibration",
    ],
    pricing: { basePrice: 285000, perPersonPrice: 235000 },
    highlights: ["Perfect for busy schedules", "Rapid diagnostics", "Weekend-friendly"],
    rating: 4.8,
    reviews: 234,
  },
  {
    type: "five_day_balanced",
    name: "5-Day Balanced Optimization",
    nights: 5,
    description: "The ideal balance between comprehensive diagnostics and transformative wellness experiences. Deep-dive into your health with extended analysis time and meaningful lifestyle interventions.",
    includes: [
      "250+ Advanced Biomarker Analysis",
      "4 Physician Consultations with Specialists",
      "Personalized AI Protocol with Lifestyle Integration",
      "Premium Suite with Wellness Amenities",
      "Organic, Personalized Nutrition Program",
      "2 Therapeutic Spa Treatments",
      "Yoga & Meditation Sessions",
      "Cardiovascular Fitness Assessment",
      "Body Composition Analysis (DEXA)",
      "Mental Performance Evaluation",
    ],
    pricing: { basePrice: 575000, perPersonPrice: 475000 },
    highlights: ["Comprehensive yet efficient", "Specialist consultations", "Holistic approach"],
    rating: 4.9,
    reviews: 412,
  },
  {
    type: "seven_day_comprehensive",
    name: "7-Day Comprehensive Transformation",
    nights: 7,
    description: "Our flagship longevity program offering an unprecedented deep-dive into your biological systems. Experience the full spectrum of cutting-edge diagnostics combined with world-class hospitality and care.",
    includes: [
      "400+ Comprehensive Biomarker Analysis",
      "Daily Physician Consultations with Board-Certified Specialists",
      "AI-Powered Personalized Health Protocol",
      "Luxury Oceanview Suite with Private Terrace",
      "Michelin-Inspired Organic Cuisine (All Meals)",
      "Daily Spa & Therapeutic Treatments",
      "Advanced Cardiovascular Testing (VO2 Max, Cardiac CT)",
      "Continuous Glucose Monitoring Setup",
      "Gut Microbiome Analysis",
      "Sleep Lab Overnight Study",
      "Cognitive Performance Assessment",
      "12-Week Digital Follow-up Program",
    ],
    pricing: { basePrice: 795000, perPersonPrice: 645000 },
    highlights: ["Most popular choice", "Complete transformation", "Extended follow-up"],
    rating: 4.95,
    reviews: 687,
  },
  {
    type: "fourteen_day_ultimate",
    name: "14-Day Ultimate Longevity Journey",
    nights: 14,
    description: "The pinnacle of personalized health optimization. This elite program integrates ancient wisdom with futuristic medicine, providing an unparalleled journey toward biological age reversal and peak human performance.",
    includes: [
      "Complete 500+ Biomarker Panel with Multi-Point Analysis",
      "Twice-Daily Physician Consultations & Specialist Reviews",
      "Whole Genome Sequencing & Epigenetic Analysis",
      "Traditional Ayurveda Integration (Panchakarma optional)",
      "Presidential Suite with Butler Service",
      "Private Chef with Customized Nutrition Program",
      "Unlimited Spa Access with Daily Treatments",
      "Advanced Imaging Suite (Full-Body MRI, Coronary CT)",
      "Neurocognitive Enhancement Program",
      "Hyperbaric Oxygen Therapy (10 sessions)",
      "IV Nutrient Therapy (7 customized infusions)",
      "Stem Cell & Regenerative Medicine Consultation",
      "Lifetime AIWO Concierge Membership",
      "24-Week Digital Coaching Program",
    ],
    pricing: { basePrice: 1495000, perPersonPrice: 1225000 },
    highlights: ["Ultimate experience", "Genetic analysis", "Lifetime benefits"],
    rating: 4.98,
    reviews: 156,
  },
];

const locations: Location[] = [
  {
    id: "chennai",
    name: "The Leela Palace Chennai",
    city: "Chennai",
    country: "India",
    description: "Experience unparalleled luxury at our flagship longevity center on the Bay of Bengal. The Leela Palace Chennai combines the rich cultural heritage of South India with cutting-edge medical facilities. Our dedicated AIWO wing features state-of-the-art diagnostic labs, recovery suites, and world-class physicians.",
    imageUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600",
    amenities: [
      "Oceanfront Suites with Private Balcony",
      "AIWO Longevity Lab & Diagnostics Center",
      "Traditional South Indian Spa with Ayurveda",
      "Michelin-starred Restaurant with Personalized Nutrition",
      "Yoga Pavilion overlooking the Bay",
      "24/7 Medical Concierge",
      "Helipad for VIP Transfers",
      "Private Meditation Gardens",
    ],
    pricing: { basePrice: 0, currency: "INR" },
    rating: 4.9,
    features: { medicalGrade: true, ayurveda: true, beachfront: true },
  },
  {
    id: "dubai",
    name: "Jumeirah Al Naseem - AIWO Pavilion",
    city: "Dubai",
    country: "UAE",
    description: "Where Arabian luxury meets Swiss precision medicine. Our exclusive partnership with Jumeirah brings you an ultra-premium longevity experience with unmatched hospitality. The dedicated AIWO Pavilion offers complete privacy with world-renowned specialists flying in from global centers of excellence.",
    imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600",
    amenities: [
      "Private Beach Villas with Burj Al Arab Views",
      "Swiss-Designed Medical Spa & Recovery Center",
      "Exclusive AIWO Longevity Lounge",
      "Personal Butler & Medical Concierge 24/7",
      "Hyperbaric & Cryotherapy Chambers",
      "Private Yacht Wellness Cruises",
      "Helicopter City Tours",
      "Access to Talise Spa (45,000 sq ft)",
    ],
    pricing: { basePrice: 175000, currency: "INR" },
    rating: 4.95,
    features: { medicalGrade: true, beachfront: true, vipServices: true },
  },
  {
    id: "goa",
    name: "Taj Exotica Resort & Spa",
    city: "South Goa",
    country: "India",
    description: "Nestled on 56 acres of lush tropical gardens along the pristine Benaulim Beach, Taj Exotica offers the perfect blend of beachside relaxation and comprehensive health optimization. Our AIWO center integrates seamlessly with the resort's legendary hospitality and natural serenity.",
    imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600",
    amenities: [
      "Villa Accommodation with Private Gardens",
      "Mediterranean-Style AIWO Wellness Center",
      "Jiva Spa featuring Signature Treatments",
      "Sunrise Yoga on Private Beach",
      "Infinity Pool & Recovery Lounges",
      "Organic Farm-to-Table Dining",
      "Water Sports & Nature Trails",
      "Sunset Cruise Experiences",
    ],
    pricing: { basePrice: 55000, currency: "INR" },
    rating: 4.85,
    features: { beachfront: true, natureFocused: true, familyFriendly: true },
  },
  {
    id: "kerala",
    name: "Kalari Kovilakom - The Palace for Ayurveda",
    city: "Kerala Backwaters",
    country: "India",
    description: "An authentic 19th-century palace transformed into the world's most exclusive Ayurvedic healing center. Here, 5,000 years of Ayurvedic wisdom harmonizes with modern longevity science. Experience Panchakarma detoxification alongside AI-powered biomarker analysis in this UNESCO-recognized wellness sanctuary.",
    imageUrl: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600",
    amenities: [
      "Heritage Palace Suites with Backwater Views",
      "Authentic Ayurveda Treatment Rooms",
      "AIWO Integrated Diagnostics Lab",
      "Organic Sattvic Kitchen (Personalized Doshas)",
      "Traditional Kalari Martial Arts",
      "Meditation Hall & Sanskrit Library",
      "Organic Herb Gardens & Walking Trails",
      "Daily Ayurveda Physician Consultations",
    ],
    pricing: { basePrice: 35000, currency: "INR" },
    rating: 4.92,
    features: { ayurveda: true, heritage: true, detoxFocus: true },
  },
];

const addOns = [
  { 
    id: "genetic", 
    name: "Whole Genome Sequencing + Analysis", 
    price: 95000, 
    description: "Complete DNA sequencing with ancestry, health predispositions, pharmacogenomics, and longevity markers analysis by our geneticist team",
    category: "Diagnostics",
  },
  { 
    id: "epigenetic", 
    name: "Epigenetic Age Testing (TruAge)", 
    price: 65000, 
    description: "Horvath clock and DunedinPACE analysis to measure your true biological age and pace of aging",
    category: "Diagnostics",
  },
  { 
    id: "microbiome", 
    name: "Comprehensive Gut Microbiome Analysis", 
    price: 45000, 
    description: "Full metagenomic sequencing of your gut bacteria with personalized probiotic and dietary recommendations",
    category: "Diagnostics",
  },
  { 
    id: "iv_nad", 
    name: "NAD+ IV Therapy Package", 
    price: 85000, 
    description: "5 sessions of high-dose NAD+ infusions for cellular rejuvenation, energy, and cognitive enhancement",
    category: "Therapies",
  },
  { 
    id: "iv_myers", 
    name: "Myers Cocktail IV Package", 
    price: 55000, 
    description: "5 customized vitamin/mineral IV infusions tailored to your biomarker results for optimal absorption",
    category: "Therapies",
  },
  { 
    id: "hyperbaric", 
    name: "Hyperbaric Oxygen Therapy", 
    price: 75000, 
    description: "10 sessions of HBOT for enhanced recovery, stem cell activation, and cognitive benefits",
    category: "Therapies",
  },
  { 
    id: "cryotherapy", 
    name: "Whole-Body Cryotherapy Package", 
    price: 35000, 
    description: "Daily cryotherapy sessions for inflammation reduction, recovery, and metabolic boost",
    category: "Therapies",
  },
  { 
    id: "yoga_private", 
    name: "Private Yoga & Breathwork", 
    price: 28000, 
    description: "Daily 1-on-1 instruction with certified yoga therapist including pranayama and meditation",
    category: "Wellness",
  },
  { 
    id: "massage_daily", 
    name: "Daily Therapeutic Massage", 
    price: 42000, 
    description: "90-minute customized massage sessions targeting recovery, stress, and muscle health",
    category: "Wellness",
  },
  { 
    id: "chef_private", 
    name: "Private Chef Experience", 
    price: 125000, 
    description: "Dedicated personal chef preparing all meals based on your biomarkers and nutritional protocol",
    category: "Lifestyle",
  },
  { 
    id: "companion", 
    name: "Companion/Partner Package", 
    price: 195000, 
    description: "Full wellness program for accompanying partner including diagnostics, spa, and activities",
    category: "Lifestyle",
  },
  { 
    id: "followup_12m", 
    name: "12-Month Longevity Coaching", 
    price: 145000, 
    description: "Extended virtual coaching with weekly check-ins, quarterly labs, and ongoing protocol optimization",
    category: "Follow-up",
  },
];

export default function Booking() {
  const [step, setStep] = useState(1);
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [guestCount, setGuestCount] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set());
  const [guestInfo, setGuestInfo] = useState<Partial<GuestInfo>>({});
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const { toast } = useToast();
  const searchString = useSearch();

  const totalSteps = 6;

  const program = programs.find((p) => p.type === selectedProgram);
  const location = locations.find((l) => l.id === selectedLocation);

  const { data: paymentConfig } = useQuery<{ configured: boolean; publishableKey: string | null }>({
    queryKey: ["/api/payments/config"],
  });

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const sessionId = params.get("session_id");
    const cancelled = params.get("cancelled");
    const stepParam = params.get("step");

    if (cancelled === "true") {
      toast({
        title: "Payment Cancelled",
        description: "Your payment was cancelled. You can try again when ready.",
        variant: "destructive",
      });
      window.history.replaceState({}, "", "/booking");
    }

    if (sessionId && stepParam === "confirmation") {
      verifyPayment(sessionId);
    }
  }, [searchString]);

  const verifyPayment = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/payments/verify-session/${sessionId}`, {
        credentials: "include",
      });
      const data = await response.json();
      
      if (data.status === "paid") {
        setPaymentVerified(true);
        setStep(totalSteps + 1);
        queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
        toast({
          title: "Payment Successful!",
          description: "Your wellness retreat has been booked and paid for.",
        });
        window.history.replaceState({}, "", "/booking");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
    }
  };

  const calculateTotal = () => {
    if (!program || !location) return 0;
    let total = program.pricing.basePrice + (guestCount - 1) * program.pricing.perPersonPrice;
    total += location.pricing.basePrice;
    selectedAddOns.forEach((addOnId) => {
      const addOn = addOns.find((a) => a.id === addOnId);
      if (addOn) total += addOn.price;
    });
    return total;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const bookingMutation = useMutation({
    mutationFn: async () => {
      const endDate = selectedDate ? addDays(selectedDate, program?.nights || 0) : new Date();
      const response = await apiRequest("POST", "/api/bookings", {
        programType: selectedProgram,
        locationId: selectedLocation,
        locationName: location?.name,
        startDate: selectedDate,
        endDate,
        numberOfNights: program?.nights,
        numberOfGuests: guestCount,
        guests: [guestInfo],
        addOns: Array.from(selectedAddOns),
        totalAmount: calculateTotal(),
        depositAmount: calculateTotal() * 0.3,
        balanceDue: calculateTotal() * 0.7,
      });
      return response;
    },
    onSuccess: async (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      const bookingId = data.id;
      setCreatedBookingId(bookingId);

      if (paymentConfig?.configured) {
        try {
          const checkoutResponse = await apiRequest("POST", "/api/payments/create-checkout-session", {
            bookingId,
          });
          
          if (checkoutResponse.url) {
            window.location.href = checkoutResponse.url;
          } else {
            toast({
              title: "Booking Created",
              description: "Your booking is confirmed. Payment can be completed later.",
            });
            setStep(totalSteps + 1);
          }
        } catch (error) {
          toast({
            title: "Booking Created",
            description: "Your booking is confirmed but payment processing is not available at this time.",
          });
          setStep(totalSteps + 1);
        }
      } else {
        toast({
          title: "Booking Created!",
          description: "Your wellness retreat booking has been created. Payment details will be shared shortly.",
        });
        setStep(totalSteps + 1);
      }
    },
    onError: () => {
      toast({
        title: "Booking Failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const canProceed = () => {
    switch (step) {
      case 1: return !!selectedProgram;
      case 2: return !!selectedLocation;
      case 3: return !!selectedDate;
      case 4: return guestInfo.firstName && guestInfo.lastName && guestInfo.email;
      case 5: return true;
      case 6: return true;
      default: return false;
    }
  };

  const toggleAddOn = (id: string) => {
    const newAddOns = new Set(selectedAddOns);
    if (newAddOns.has(id)) {
      newAddOns.delete(id);
    } else {
      newAddOns.add(id);
    }
    setSelectedAddOns(newAddOns);
  };

  if (step > totalSteps) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-20 h-20 rounded-full bg-chart-2/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-chart-2" />
            </div>
            <h1 className="text-3xl font-semibold mb-4">Booking Confirmed!</h1>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Your {program?.name} retreat at {location?.name} has been successfully booked. 
              You'll receive a confirmation email shortly.
            </p>
            <div className="bg-muted/50 rounded-lg p-6 mb-6 max-w-sm mx-auto">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Program</span>
                  <span className="font-medium">{program?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium">{location?.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dates</span>
                  <span className="font-medium">
                    {selectedDate && format(selectedDate, "MMM d")} - {selectedDate && format(addDays(selectedDate, program?.nights || 0), "MMM d, yyyy")}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold text-lg">{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </div>
            <Button onClick={() => window.location.href = "/"}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Book Your Retreat</h1>
          <p className="text-muted-foreground">
            Step {step} of {totalSteps}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div
              key={idx}
              className={`w-3 h-3 rounded-full transition-colors ${
                idx + 1 <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Select Your Program
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedProgram} onValueChange={setSelectedProgram}>
                  <div className="grid md:grid-cols-2 gap-4">
                    {programs.map((prog) => (
                      <div
                        key={prog.type}
                        className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all hover-elevate ${
                          selectedProgram === prog.type
                            ? "border-primary bg-primary/5"
                            : "border-border"
                        }`}
                        onClick={() => setSelectedProgram(prog.type)}
                        data-testid={`radio-program-${prog.type}`}
                      >
                        <RadioGroupItem
                          value={prog.type}
                          id={prog.type}
                          className="absolute top-4 right-4"
                        />
                        <div className="pr-8">
                          <h3 className="font-semibold mb-1">{prog.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{prog.nights} nights</p>
                          <p className="text-sm text-muted-foreground mb-3">{prog.description}</p>
                          <p className="text-xl font-bold text-primary">
                            {formatCurrency(prog.pricing.basePrice)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Choose Your Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedLocation} onValueChange={setSelectedLocation}>
                  <div className="grid md:grid-cols-2 gap-4">
                    {locations.map((loc) => (
                      <div
                        key={loc.id}
                        className={`relative rounded-lg border-2 overflow-hidden cursor-pointer transition-all hover-elevate ${
                          selectedLocation === loc.id
                            ? "border-primary"
                            : "border-border"
                        }`}
                        onClick={() => setSelectedLocation(loc.id)}
                        data-testid={`radio-location-${loc.id}`}
                      >
                        <RadioGroupItem
                          value={loc.id}
                          id={loc.id}
                          className="absolute top-4 right-4 z-10"
                        />
                        <div className="aspect-video relative">
                          <img
                            src={loc.imageUrl}
                            alt={loc.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-3 left-3 text-white">
                            <h3 className="font-semibold">{loc.name}</h3>
                            <p className="text-sm text-white/80">{loc.city}, {loc.country}</p>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-sm text-muted-foreground mb-2">{loc.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {loc.amenities.slice(0, 3).map((amenity) => (
                              <Badge key={amenity} variant="secondary" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  Select Your Dates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date() || date < addDays(new Date(), 7)}
                    className="rounded-md border"
                    data-testid="calendar-date"
                  />
                  {selectedDate && program && (
                    <div className="mt-4 p-4 rounded-lg bg-muted/50 text-center">
                      <p className="text-sm text-muted-foreground">Your stay</p>
                      <p className="font-semibold">
                        {format(selectedDate, "MMMM d, yyyy")} - {format(addDays(selectedDate, program.nights), "MMMM d, yyyy")}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{program.nights} nights</p>
                    </div>
                  )}
                </div>
                <div className="mt-6">
                  <Label>Number of Guests</Label>
                  <Select value={guestCount.toString()} onValueChange={(v) => setGuestCount(parseInt(v))}>
                    <SelectTrigger className="mt-2" data-testid="select-guests">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map((n) => (
                        <SelectItem key={n} value={n.toString()}>{n} {n === 1 ? "Guest" : "Guests"}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Guest Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={guestInfo.firstName || ""}
                      onChange={(e) => setGuestInfo({ ...guestInfo, firstName: e.target.value })}
                      placeholder="John"
                      className="mt-2"
                      data-testid="input-first-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={guestInfo.lastName || ""}
                      onChange={(e) => setGuestInfo({ ...guestInfo, lastName: e.target.value })}
                      placeholder="Doe"
                      className="mt-2"
                      data-testid="input-last-name"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={guestInfo.email || ""}
                      onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                      placeholder="john@example.com"
                      className="mt-2"
                      data-testid="input-email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={guestInfo.phone || ""}
                      onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="mt-2"
                      data-testid="input-phone"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={guestInfo.dateOfBirth || ""}
                      onChange={(e) => setGuestInfo({ ...guestInfo, dateOfBirth: e.target.value })}
                      className="mt-2"
                      data-testid="input-dob"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={guestInfo.gender || ""}
                      onValueChange={(v) => setGuestInfo({ ...guestInfo, gender: v })}
                    >
                      <SelectTrigger className="mt-2" data-testid="select-gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 5 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  Add-On Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {addOns.map((addOn) => (
                    <div
                      key={addOn.id}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all hover-elevate ${
                        selectedAddOns.has(addOn.id)
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                      onClick={() => toggleAddOn(addOn.id)}
                      data-testid={`checkbox-addon-${addOn.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <Checkbox checked={selectedAddOns.has(addOn.id)} />
                        <div>
                          <h3 className="font-medium">{addOn.name}</h3>
                          <p className="text-sm text-muted-foreground">{addOn.description}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-primary">{formatCurrency(addOn.price)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {step === 6 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Review & Confirm
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">{program?.name}</p>
                        <p className="text-sm text-muted-foreground">{program?.nights} nights</p>
                      </div>
                    </div>
                    <span className="font-semibold">{formatCurrency(program?.pricing.basePrice || 0)}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">{location?.name}</p>
                        <p className="text-sm text-muted-foreground">{location?.city}, {location?.country}</p>
                      </div>
                    </div>
                    {location && location.pricing.basePrice > 0 && (
                      <span className="font-semibold">+{formatCurrency(location.pricing.basePrice)}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">
                          {selectedDate && format(selectedDate, "MMM d")} - {selectedDate && format(addDays(selectedDate, program?.nights || 0), "MMM d, yyyy")}
                        </p>
                        <p className="text-sm text-muted-foreground">{guestCount} {guestCount === 1 ? "guest" : "guests"}</p>
                      </div>
                    </div>
                  </div>

                  {selectedAddOns.size > 0 && (
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="font-medium mb-2">Add-On Services</p>
                      {Array.from(selectedAddOns).map((addOnId) => {
                        const addOn = addOns.find((a) => a.id === addOnId);
                        return addOn ? (
                          <div key={addOn.id} className="flex justify-between text-sm py-1">
                            <span className="text-muted-foreground">{addOn.name}</span>
                            <span>{formatCurrency(addOn.price)}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Deposit (30%)</span>
                    <span>{formatCurrency(calculateTotal() * 0.3)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Balance Due</span>
                    <span>{formatCurrency(calculateTotal() * 0.7)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary" data-testid="text-total-price">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Secure Payment with Stripe</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {paymentConfig?.configured 
                          ? "Your payment is processed securely through Stripe. You will be redirected to complete payment after confirmation."
                          : "Payment processing will be available shortly. Your booking will be created and you can complete payment later."}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {step === totalSteps + 1 && (
            <Card>
              <CardContent className="pt-8 pb-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2" data-testid="text-booking-confirmed">
                  {paymentVerified ? "Payment Successful!" : "Booking Confirmed!"}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {paymentVerified 
                    ? "Your wellness retreat has been booked and paid for. We'll send you confirmation details shortly."
                    : "Your wellness retreat booking has been created. We'll be in touch with payment and next steps."}
                </p>
                
                <div className="max-w-md mx-auto text-left space-y-4">
                  {program && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm text-muted-foreground">Program</span>
                      <span className="font-medium">{program.name}</span>
                    </div>
                  )}
                  {location && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm text-muted-foreground">Location</span>
                      <span className="font-medium">{location.name}</span>
                    </div>
                  )}
                  {selectedDate && program && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm text-muted-foreground">Dates</span>
                      <span className="font-medium">
                        {format(selectedDate, "MMM d")} - {format(addDays(selectedDate, program.nights), "MMM d, yyyy")}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <span className="text-sm font-medium">Total Amount</span>
                    <span className="font-bold text-primary">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>

                <Button 
                  className="mt-6" 
                  onClick={() => window.location.href = "/"}
                  data-testid="button-go-to-dashboard"
                >
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {program && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Program</p>
                  <p className="font-medium">{program.name}</p>
                </div>
              )}
              {location && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{location.name}</p>
                </div>
              )}
              {selectedDate && program && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Dates</p>
                  <p className="font-medium">
                    {format(selectedDate, "MMM d")} - {format(addDays(selectedDate, program.nights), "MMM d")}
                  </p>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(calculateTotal())}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {step <= totalSteps && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            data-testid="button-prev-step"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          {step < totalSteps ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              data-testid="button-next-step"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => bookingMutation.mutate()}
              disabled={bookingMutation.isPending}
              data-testid="button-confirm-booking"
            >
              {bookingMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {paymentConfig?.configured ? "Redirecting to Payment..." : "Processing..."}
                </>
              ) : (
                <>
                  {paymentConfig?.configured ? "Proceed to Payment" : "Confirm Booking"}
                  <CreditCard className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
