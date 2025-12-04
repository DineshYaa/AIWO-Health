import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Activity,
  Calendar,
  Users,
  ArrowRight,
  CheckCircle,
  Star,
  Sparkles,
  TrendingUp,
  Shield,
  Clock,
  MapPin,
} from "lucide-react";

const stats = [
  { value: "400+", label: "Biomarkers Analyzed", icon: Activity },
  { value: "85%", label: "Avg. Health Improvement", icon: TrendingUp },
  { value: "98%", label: "Client Satisfaction", icon: Star },
  { value: "7+", label: "Wearable Integrations", icon: Shield },
];

const programs = [
  {
    name: "7-Day Comprehensive",
    nights: 7,
    price: "₹7.5L",
    description: "Complete health transformation with intensive biomarker analysis and personalized protocols",
    features: ["400+ Biomarker Analysis", "Daily Physician Consultations", "AI-Powered Protocols", "Luxury Accommodation"],
    popular: true,
  },
  {
    name: "5-Day Balanced",
    nights: 5,
    price: "₹5.5L",
    description: "Focused wellness experience with core health optimization",
    features: ["200+ Biomarker Analysis", "3 Physician Sessions", "Personalized Protocols", "Premium Stay"],
    popular: false,
  },
  {
    name: "14-Day Ultimate",
    nights: 14,
    price: "₹13.5L",
    description: "The ultimate longevity journey with extended care and deep transformation",
    features: ["Full Biomarker Panel", "Daily Consultations", "Genetic Analysis", "Follow-up Care"],
    popular: false,
  },
  {
    name: "3-Day Weekend",
    nights: 3,
    price: "₹2.75L",
    description: "Quick health reset for busy executives",
    features: ["Core Biomarkers", "2 Physician Sessions", "Quick Protocols", "Weekend Retreat"],
    popular: false,
  },
];

const locations = [
  { name: "Chennai", country: "India", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600" },
  { name: "Dubai", country: "UAE", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600" },
  { name: "Goa", country: "India", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600" },
  { name: "Kerala", country: "India", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600" },
];

const steps = [
  { step: 1, title: "Book Your Retreat", description: "Choose your program and preferred location", icon: Calendar },
  { step: 2, title: "Comprehensive Testing", description: "400+ biomarkers analyzed by top physicians", icon: Activity },
  { step: 3, title: "AI-Powered Protocols", description: "Personalized health optimization plans", icon: Sparkles },
  { step: 4, title: "Transform Your Health", description: "Track progress and optimize for longevity", icon: TrendingUp },
];

export default function Landing() {

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <span className="text-lg font-semibold">AIWO</span>
                <span className="text-sm text-muted-foreground ml-1">Healthcation</span>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#programs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Programs
              </a>
              <a href="#locations" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Locations
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </a>
            </nav>
            <a href="/api/login" data-testid="button-login">
              <Button>
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>
        </div>
      </header>

      <section className="relative min-h-[85vh] flex items-center justify-center pt-16">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1920')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-white/10 text-white border-white/20 backdrop-blur-sm" variant="outline">
            The Future of Longevity
          </Badge>
          <h1 className="font-serif text-5xl md:text-7xl font-normal text-white mb-6 tracking-tight">
            Transform Your Health.<br />
            <span className="text-primary-foreground/90">Extend Your Life.</span>
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed">
            Experience precision health optimization through advanced biomarker science,
            AI-powered protocols, and luxury wellness retreats across the world's finest destinations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/api/login" data-testid="button-hero-cta">
              <Button size="lg" className="px-8 py-6 text-lg">
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </a>
            <a href="#programs">
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm">
                Explore Programs
              </Button>
            </a>
          </div>
          <div className="mt-12 flex items-center justify-center gap-8 text-white/60">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm">HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span className="text-sm">World-Class Physicians</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="text-sm">24/7 AI Support</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="programs" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="secondary">Our Programs</Badge>
            <h2 className="text-4xl font-semibold mb-4">Tailored Wellness Experiences</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the program that fits your schedule and health goals.
              Each includes comprehensive biomarker analysis and personalized protocols.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {programs.map((program) => (
              <Card key={program.name} className={`relative hover-elevate transition-all duration-300 ${program.popular ? 'ring-2 ring-primary' : ''}`}>
                {program.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-1">{program.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{program.nights} nights</p>
                  <div className="text-3xl font-bold text-primary mb-4">{program.price}</div>
                  <p className="text-sm text-muted-foreground mb-6">{program.description}</p>
                  <ul className="space-y-2 mb-6">
                    {program.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-chart-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <a href="/api/login" data-testid={`button-program-${program.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Button className="w-full" variant={program.popular ? "default" : "outline"}>
                      Book Now
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="secondary">The Process</Badge>
            <h2 className="text-4xl font-semibold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A seamless journey from booking to transformation
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.step} className="relative text-center">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-1/2 w-full h-px bg-border" />
                )}
                <div className="relative z-10 w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <step.icon className="w-10 h-10 text-primary" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="locations" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="secondary">Destinations</Badge>
            <h2 className="text-4xl font-semibold mb-4">World-Class Locations</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience wellness in the world's most beautiful settings
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {locations.map((location) => (
              <Card key={location.name} className="overflow-hidden hover-elevate transition-all duration-300 group">
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img
                    src={location.image}
                    alt={location.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-semibold">{location.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-white/80">
                      <MapPin className="w-4 h-4" />
                      {location.country}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-normal mb-6">
            Ready to Transform Your Health?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands who have optimized their health and extended their lifespan
            through precision medicine and personalized protocols.
          </p>
          <a href="/api/login" data-testid="button-final-cta">
            <Button size="lg" variant="secondary" className="px-8 py-6 text-lg">
              Start Your Journey Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </a>
        </div>
      </section>

      <footer className="py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Heart className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">AIWO Healthcation</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 AIWO. All rights reserved. Precision Longevity Platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
