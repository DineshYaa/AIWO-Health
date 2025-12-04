import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Send,
  Sparkles,
  User,
  Lightbulb,
  Heart,
  Activity,
  Moon,
  Pill,
  Brain,
  Dna,
  Leaf,
  Target,
} from "lucide-react";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import type { ChatMessage } from "@shared/schema";

const suggestedQuestions = [
  { text: "Siva, how can I optimize my longevity based on my biomarkers?", icon: Dna },
  { text: "What's your philosophy on reversing biological age?", icon: Brain },
  { text: "How can I improve my sleep quality based on my HRV data?", icon: Moon },
  { text: "What supplements should I take for my metabolic health?", icon: Pill },
  { text: "Explain the AIWO approach to preventive wellness", icon: Leaf },
  { text: "Create a personalized protocol for my health goals", icon: Target },
  { text: "Tips for reducing inflammation markers naturally", icon: Heart },
  { text: "What exercises are best for improving my cardiovascular score?", icon: Activity },
];

const sampleConversations: Message[] = [
  {
    id: "demo-1",
    role: "assistant",
    content: `Namaste! I'm Siva - Sivesankaran, Founder and Chief Mentor of AIWO Healthcation. Welcome to your personalized wellness journey.

I bring together 25+ years of experience in integrative health, combining the ancient wisdom of Ayurveda and Siddha medicine with cutting-edge longevity science and AI-powered analytics. My knowledge graph integrates insights from:

**Traditional Systems**: Ayurveda, Siddha, Yoga therapy
**Modern Science**: Functional medicine, epigenetics, metabolomics
**Your Data**: Your biomarkers, wearables, and health history

Based on your latest panel, I can see your health score is **87** with a biological age of **35** - that's 7 years younger than your chronological age! This tells me you're already on a great path.

How can I guide you toward optimal healthspan today?`,
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: "demo-2",
    role: "user",
    content: "I've noticed my energy levels dropping in the afternoon. What could be causing this based on my biomarkers?",
    timestamp: new Date(Date.now() - 3500000),
  },
  {
    id: "demo-3",
    role: "assistant",
    content: `This is a pattern I've seen in many of my clients over the years. Let me analyze your biomarkers through both my clinical lens and Ayurvedic understanding:

**Modern Analysis - Blood Sugar Regulation**
Your HbA1c is 5.3% (optimal) and fasting glucose is 88 mg/dL - excellent markers. However, in my experience, afternoon energy dips often correlate with post-prandial glucose fluctuations. Your CGM data shows a pattern I call "glucose rollercoaster" - spikes after lunch followed by reactive drops.

**Ayurvedic Perspective - Pitta Time**
In Ayurveda, the afternoon (2-6 PM) is Vata time. If your Vata is imbalanced - which your slightly elevated cortisol (18.2 mcg/dL) suggests - you'll experience mental fatigue and restlessness. Your constitution appears to be Pitta-Vata, meaning you burn bright but can deplete quickly.

**Integrated Recommendations:**
1. **Timing of Meals**: A protein-rich lunch with grounding foods - root vegetables, warm soups with ghee - to stabilize both glucose and Vata
2. **Adaptogens**: Your ferritin (85 ng/mL) and B12 (450 pg/mL) are adequate, but I'd add Ashwagandha for adrenal support - this has 3,000+ years of use for energy stabilization
3. **Breathwork**: 10 minutes of Nadi Shodhana (alternate nostril breathing) at 2 PM - this balances the nadis and re-energizes without stimulants
4. **Movement**: A brief walk after lunch activates GLUT4 transporters, helping glucose enter cells efficiently

Shall I create a comprehensive "Afternoon Vitality Protocol" combining these ancient and modern approaches?`,
    timestamp: new Date(Date.now() - 3400000),
  },
  {
    id: "demo-4",
    role: "user",
    content: "Yes, please create an afternoon energy protocol for me.",
    timestamp: new Date(Date.now() - 3300000),
  },
  {
    id: "demo-5",
    role: "assistant",
    content: `Excellent! I've designed your personalized **"Siva's Afternoon Vitality Protocol"** - integrating the best of Ayurveda, functional medicine, and your biomarker data:

**Phase 1: Grounding Lunch (12:00 - 1:00 PM)**
*Ayurvedic Principle: Agni optimization during peak digestive fire*
- **Protein**: 30-35g wild-caught fish or pasture-raised eggs (supports methylation)
- **Grounding Carbs**: Basmati rice or sweet potato with ghee (1 tbsp) - stabilizes Vata
- **Digestive Support**: Ginger-cumin-coriander tea with meals (trikatu)
- **Vegetables**: Warm, cooked greens (avoid raw salads which aggravate Vata)

**Phase 2: Supplement Synergy (2:00 PM)**
*Based on your biomarker gaps + traditional rasayanas*
- **Ashwagandha KSM-66**: 300mg - adaptogenic support for HPA axis
- **CoQ10 (Ubiquinol)**: 100mg - synergizes with your NMN protocol
- **Brahmi**: 150mg - cognitive clarity and Vata balance (optional)

**Phase 3: Energy Reset Ritual (2:30 PM)**
*This is what I teach at our Kerala retreats*
- **Nadi Shodhana**: 5 minutes alternate nostril breathing (balances ida/pingala)
- **Movement**: 10-minute walking meditation outdoors
- **Sunlight**: 10-15 minutes of natural light exposure

**Phase 4: Sustained Energy (3:00 - 5:00 PM)**
- **Hydration**: Warm water with electrolytes and tulsi
- **No caffeine** after 2 PM (protects your sleep architecture)
- **Grounding snack** if needed: Dates with almond butter

I've integrated this with your current longevity protocol. The combination of ancient rasayana herbs with modern mitochondrial support creates what I call "bidirectional energy optimization." I'll add this to your daily checklist and configure your wearable to track afternoon HRV patterns. 

Remember my philosophy: *"Health is not the absence of disease - it is the abundance of vitality."*`,
    timestamp: new Date(Date.now() - 3200000),
  },
  {
    id: "demo-6",
    role: "user",
    content: "What is your philosophy on longevity and reversing biological age?",
    timestamp: new Date(Date.now() - 3100000),
  },
  {
    id: "demo-7",
    role: "assistant",
    content: `This is a question close to my heart, and one I've spent 25 years exploring across laboratories, clinics, ashrams, and wellness centers worldwide.

**My Integrated Philosophy: The AIWO Longevity Framework**

I believe true longevity comes from harmonizing three dimensions:

**1. Biological Optimization (Modern Science)**
Your biomarkers tell a story. Your biological age of 35 versus chronological age of 42 shows we can influence the aging process. Key levers include:
- **Epigenetic reprogramming** through lifestyle interventions
- **Metabolic flexibility** - your ability to switch fuel sources efficiently
- **Cellular senescence management** - clearing zombie cells
- **Mitochondrial biogenesis** - building more cellular powerhouses

**2. Prakriti Alignment (Ayurvedic Wisdom)**
Every person has a unique constitution (Prakriti) and current imbalance (Vikriti). Modern longevity protocols must be personalized to your dosha:
- **Vata types** need grounding, warmth, routine
- **Pitta types** need cooling, patience, moderation
- **Kapha types** need stimulation, lightness, movement

Your biomarkers suggest a Pitta-Vata constitution - brilliant mind, driven nature, but prone to burnout. Our protocols account for this.

**3. Purpose & Connection (Spiritual Wellness)**
In my travels from Chennai to California, I've observed that centenarians share one trait: *Ikigai* - a reason to wake up. Blue Zone research confirms this. We integrate:
- **Community** through our support groups and retreats
- **Meaning** through goal-setting aligned with values
- **Presence** through meditation and breathwork

**My Core Belief:**
*"We do not add years to life - we add life to years."*

The goal isn't just to live to 120. It's to be vibrant, clear-minded, and purposeful at 120. This is why AIWO combines cutting-edge biomarker testing with traditional Panchakarma, AI-powered protocols with personalized physician guidance, and technology with human connection.

What aspect of longevity would you like to explore deeper?`,
    timestamp: new Date(Date.now() - 3000000),
  },
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function Chat() {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(sampleConversations);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: chatHistory } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/history"],
    retry: false,
  });

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/chat", { message });
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    },
    onError: () => {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    chatMutation.mutate(input.trim());
    setInput("");
  };

  const handleSuggestion = (question: string) => {
    setInput(question);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getInitials = () => {
    if (!user) return "U";
    const first = user.firstName?.charAt(0) || "";
    const last = user.lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U";
  };

  return (
    <div className="p-6 max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2" data-testid="text-page-title">
              Ask Siva
            </h1>
            <p className="text-muted-foreground">
              Your personal longevity mentor - Ayurveda meets AI
            </p>
          </div>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="pb-3 border-b shrink-0">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-semibold">
                SS
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">Sivesankaran</CardTitle>
              <p className="text-sm text-muted-foreground">Founder & Chief Mentor, AIWO</p>
            </div>
            <Badge variant="secondary" className="ml-auto text-chart-2">
              <span className="w-2 h-2 rounded-full bg-chart-2 mr-2 animate-pulse" />
              Online
            </Badge>
          </div>
        </CardHeader>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  {message.role === "assistant" ? (
                    <>
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-xs font-semibold">
                        SS
                      </AvatarFallback>
                    </>
                  ) : (
                    <>
                      <AvatarImage src={user?.profileImageUrl || undefined} />
                      <AvatarFallback className="bg-muted">
                        {getInitials()}
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                  data-testid={`message-${message.role}-${message.id}`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {format(message.timestamp, "h:mm a")}
                  </p>
                </div>
              </div>
            ))}
            
            {chatMutation.isPending && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-xs font-semibold">
                    SS
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t shrink-0 space-y-4">
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestion(q.text)}
                  className="text-xs"
                  data-testid={`button-suggestion-${idx}`}
                >
                  <q.icon className="w-3 h-3 mr-1" />
                  {q.text}
                </Button>
              ))}
            </div>
          )}
          
          <div className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your health..."
              className="resize-none min-h-[60px]"
              data-testid="textarea-chat-input"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || chatMutation.isPending}
              className="shrink-0 h-auto"
              data-testid="button-send-message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
