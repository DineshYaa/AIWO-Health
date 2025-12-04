import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  MessageSquare, Heart, Eye, Users, Trophy, Star, 
  Crown, Flame, Medal, Award, Plus, Send, ArrowLeft,
  BookOpen, Sparkles, TrendingUp, Clock, ChevronRight,
  UserPlus, UserMinus, Share2, Filter
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Author {
  id: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  postCount: number | null;
}

interface ForumPost {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  categoryId: string;
  viewCount: number | null;
  likeCount: number | null;
  commentCount: number | null;
  isPinned: boolean | null;
  tags: string[] | null;
  createdAt: string;
  author: Author | null;
  hasLiked?: boolean;
}

interface PostComment {
  id: string;
  content: string;
  likeCount: number | null;
  createdAt: string;
  author: Author | null;
}

interface SupportGroup {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: string | null;
  memberCount: number | null;
  postCount: number | null;
  coverImage: string | null;
  isMember?: boolean;
}

interface SuccessStory {
  id: string;
  title: string;
  summary: string | null;
  content: string;
  beforeStats: any;
  afterStats: any;
  journeyDuration: string | null;
  programType: string | null;
  location: string | null;
  viewCount: number | null;
  likeCount: number | null;
  isFeatured: boolean | null;
  publishedAt: string | null;
  author: Author | null;
}

interface AchievementBadge {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  icon: string | null;
  color: string | null;
  points: number | null;
  rarity: string | null;
}

interface UserAchievement {
  id: string;
  earnedAt: string;
  badge: AchievementBadge | null;
}

interface UserCommunityStats {
  userId: string;
  totalPosts: number | null;
  totalComments: number | null;
  totalLikesReceived: number | null;
  totalBadges: number | null;
  totalPoints: number | null;
  reputation: number | null;
  level: number | null;
  streak: number | null;
  user?: Author | null;
}

function getInitials(firstName: string | null | undefined, lastName: string | null | undefined): string {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
}

function getRarityColor(rarity: string | null): string {
  switch (rarity) {
    case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
    case 'epic': return 'bg-gradient-to-r from-purple-500 to-pink-500';
    case 'rare': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    default: return 'bg-gradient-to-r from-gray-400 to-gray-500';
  }
}

const mockCategories: ForumCategory[] = [
  { id: "1", name: "Wellness Journey", slug: "wellness-journey", description: "Share your health transformation stories and daily wellness practices", icon: "Heart", color: "#10b981", postCount: 342 },
  { id: "2", name: "Nutrition & Diet", slug: "nutrition-diet", description: "Discuss meal planning, supplements, and nutritional optimization", icon: "Apple", color: "#f59e0b", postCount: 256 },
  { id: "3", name: "Fitness & Exercise", slug: "fitness-exercise", description: "Workout routines, Zone 2 cardio, strength training tips", icon: "Dumbbell", color: "#3b82f6", postCount: 189 },
  { id: "4", name: "Sleep Optimization", slug: "sleep-optimization", description: "Improve sleep quality, discuss sleep protocols and tools", icon: "Moon", color: "#8b5cf6", postCount: 134 },
  { id: "5", name: "Biomarker Discussion", slug: "biomarker-discussion", description: "Interpret and discuss biomarker results with the community", icon: "Activity", color: "#ef4444", postCount: 278 },
  { id: "6", name: "Longevity Science", slug: "longevity-science", description: "Latest research on aging, NAD+, senolytic therapies", icon: "Flask", color: "#06b6d4", postCount: 156 },
  { id: "7", name: "Mental Wellness", slug: "mental-wellness", description: "Stress management, meditation, cognitive health", icon: "Brain", color: "#ec4899", postCount: 198 },
  { id: "8", name: "Retreat Experiences", slug: "retreat-experiences", description: "Share your AIWO retreat experiences and recommendations", icon: "MapPin", color: "#14b8a6", postCount: 89 },
];

const mockPosts: ForumPost[] = [
  { 
    id: "p1", 
    title: "How I reversed my biological age by 12 years in 18 months", 
    content: "After following the AIWO protocol diligently for 18 months, my latest biomarker results show my biological age has dropped from 54 to 42. Here's exactly what I did...\n\nThe key changes were:\n1. Strict adherence to the supplement protocol (NMN, Resveratrol, Omega-3s)\n2. Zone 2 cardio 4x per week\n3. Time-restricted eating (16:8)\n4. Sleep optimization with Oura Ring tracking\n5. Quarterly biomarker testing to track progress\n\nMy HbA1c went from 5.8 to 5.2, hsCRP from 2.4 to 0.6, and my Vitamin D went from 32 to 68. The transformation has been incredible.", 
    excerpt: "After following the AIWO protocol diligently for 18 months, my latest biomarker results show my biological age has dropped from 54 to 42...", 
    categoryId: "1", 
    viewCount: 2847, 
    likeCount: 342, 
    commentCount: 89, 
    isPinned: true, 
    tags: ["biological-age", "success-story", "protocol"], 
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    author: { id: "u1", firstName: "Rajesh", lastName: "Sharma", profileImageUrl: null }
  },
  { 
    id: "p2", 
    title: "My experience with the 14-Day Ultimate Longevity Retreat in Kerala", 
    content: "Just returned from the AIWO Kerala retreat and I'm still processing the transformation. The combination of Ayurvedic treatments, personalized protocols, and the serene backwater setting was life-changing.\n\nHighlights:\n- Daily Panchakarma treatments\n- Personalized IV therapy sessions\n- Full genomic analysis with Dr. Menon\n- Breathwork and meditation workshops\n- The food was incredible - all organic, locally sourced\n\nMy post-retreat biomarkers showed a 15% improvement in inflammatory markers.", 
    excerpt: "Just returned from the AIWO Kerala retreat and I'm still processing the transformation...", 
    categoryId: "8", 
    viewCount: 1523, 
    likeCount: 187, 
    commentCount: 45, 
    isPinned: false, 
    tags: ["kerala", "retreat", "ayurveda", "review"], 
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    author: { id: "u2", firstName: "Priya", lastName: "Nair", profileImageUrl: null }
  },
  { 
    id: "p3", 
    title: "Optimal NMN dosing protocol - what works for me", 
    content: "After experimenting with different NMN protocols for over a year, I've found what works best for my body. Here's my current stack:\n\nMorning (empty stomach):\n- NMN: 500mg sublingual\n- Resveratrol: 500mg with MCT oil\n- TMG: 500mg (to support methylation)\n\nEvening:\n- Additional 250mg NMN before workout days\n\nMy NAD+ levels increased by 40% according to my latest IntrCell test. Energy levels are significantly improved, especially in the afternoon.", 
    excerpt: "After experimenting with different NMN protocols for over a year, I've found what works best...", 
    categoryId: "6", 
    viewCount: 3421, 
    likeCount: 456, 
    commentCount: 127, 
    isPinned: true, 
    tags: ["nmn", "nad+", "supplements", "protocol"], 
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    author: { id: "u3", firstName: "Amit", lastName: "Patel", profileImageUrl: null }
  },
  { 
    id: "p4", 
    title: "Zone 2 training changed everything for my metabolic health", 
    content: "I used to be a HIIT fanatic, but switching to Zone 2 cardio as my primary training method has transformed my metabolic markers.\n\nBefore (6 months ago):\n- Fasting glucose: 102 mg/dL\n- Triglycerides: 165 mg/dL\n- VO2 max: 38\n\nAfter consistent Zone 2 training (4x45min/week):\n- Fasting glucose: 84 mg/dL\n- Triglycerides: 78 mg/dL\n- VO2 max: 48\n\nThe key is staying in the fat-burning zone (60-70% max HR) and being patient. Results take 3-6 months but are sustainable.", 
    excerpt: "I used to be a HIIT fanatic, but switching to Zone 2 cardio has transformed my metabolic markers...", 
    categoryId: "3", 
    viewCount: 2156, 
    likeCount: 298, 
    commentCount: 67, 
    isPinned: false, 
    tags: ["zone-2", "cardio", "metabolic-health", "vo2max"], 
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    author: { id: "u4", firstName: "Vikram", lastName: "Reddy", profileImageUrl: null }
  },
  { 
    id: "p5", 
    title: "Interpreting my lipid panel - need community insights", 
    content: "Just got my latest lipid panel and would love some community input:\n\n- Total Cholesterol: 215 mg/dL\n- LDL-C: 128 mg/dL\n- HDL-C: 72 mg/dL\n- Triglycerides: 75 mg/dL\n- ApoB: 92 mg/dL\n- Lp(a): 45 nmol/L\n\nMy physician says everything looks fine, but I'm concerned about the Lp(a) being elevated. Anyone else dealing with elevated Lp(a)? What interventions have worked for you?", 
    excerpt: "Just got my latest lipid panel and would love some community input...", 
    categoryId: "5", 
    viewCount: 892, 
    likeCount: 45, 
    commentCount: 34, 
    isPinned: false, 
    tags: ["lipids", "lp(a)", "cholesterol", "question"], 
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    author: { id: "u5", firstName: "Sunita", lastName: "Gupta", profileImageUrl: null }
  },
];

const mockGroups: SupportGroup[] = [
  { id: "g1", name: "Metabolic Health Warriors", slug: "metabolic-health-warriors", description: "Support group for those working on reversing metabolic dysfunction and insulin resistance", type: "condition", memberCount: 1247, postCount: 3421, coverImage: null, isMember: true },
  { id: "g2", name: "AIWO Retreat Alumni", slug: "retreat-alumni", description: "Connect with fellow retreat participants and share your ongoing journey", type: "alumni", memberCount: 892, postCount: 2156, coverImage: null, isMember: false },
  { id: "g3", name: "Longevity Biohackers", slug: "longevity-biohackers", description: "Advanced discussions on cutting-edge longevity interventions and self-experimentation", type: "interest", memberCount: 2341, postCount: 5678, coverImage: null, isMember: true },
  { id: "g4", name: "Sleep Optimization Squad", slug: "sleep-squad", description: "Dedicated to achieving perfect sleep scores and discussing sleep interventions", type: "goal", memberCount: 756, postCount: 1823, coverImage: null, isMember: false },
  { id: "g5", name: "Plant-Based Wellness", slug: "plant-based-wellness", description: "For those following plant-based nutrition protocols within the AIWO framework", type: "interest", memberCount: 534, postCount: 987, coverImage: null, isMember: false },
  { id: "g6", name: "Executive Health Optimization", slug: "executive-health", description: "High-performance health strategies for busy professionals", type: "goal", memberCount: 1123, postCount: 2456, coverImage: null, isMember: true },
];

const mockStories: SuccessStory[] = [
  { 
    id: "s1", 
    title: "From Pre-Diabetic to Optimal Metabolic Health in 8 Months", 
    summary: "How I reversed pre-diabetes and lost 25kg through the AIWO protocol", 
    content: "Eight months ago, I was diagnosed as pre-diabetic with an HbA1c of 6.2% and weighing 98kg. My doctor wanted to start me on Metformin, but I asked for 6 months to try lifestyle interventions first...",
    beforeStats: { hba1c: 6.2, weight: 98, biologicalAge: 58, healthScore: 52 },
    afterStats: { hba1c: 5.1, weight: 73, biologicalAge: 45, healthScore: 89 },
    journeyDuration: "8 months",
    programType: "7-Day Comprehensive",
    location: "Chennai",
    viewCount: 4521,
    likeCount: 678,
    isFeatured: true,
    publishedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    author: { id: "u6", firstName: "Arjun", lastName: "Menon", profileImageUrl: null }
  },
  { 
    id: "s2", 
    title: "Reversing 15 Years of Inflammation: My Journey to Pain-Free Living", 
    summary: "Chronic inflammation and joint pain eliminated through targeted protocols", 
    content: "For 15 years, I lived with chronic inflammation that manifested as joint pain, brain fog, and constant fatigue. My hsCRP was consistently above 4.0, and I had tried everything...",
    beforeStats: { hsCRP: 4.2, esr: 28, biologicalAge: 62, healthScore: 48 },
    afterStats: { hsCRP: 0.4, esr: 6, biologicalAge: 51, healthScore: 86 },
    journeyDuration: "14 months",
    programType: "14-Day Ultimate Longevity",
    location: "Kerala",
    viewCount: 3287,
    likeCount: 456,
    isFeatured: true,
    publishedAt: new Date(Date.now() - 86400000 * 21).toISOString(),
    author: { id: "u7", firstName: "Meera", lastName: "Krishnan", profileImageUrl: null }
  },
  { 
    id: "s3", 
    title: "Executive Burnout to Peak Performance: A CEO's Transformation", 
    summary: "How I regained my energy and mental clarity while running a 500-person company", 
    content: "As a CEO of a growing tech company, I was running on fumes. My sleep was terrible, cortisol through the roof, and I was gaining weight despite barely eating...",
    beforeStats: { cortisol: 28, sleepScore: 45, biologicalAge: 52, healthScore: 58 },
    afterStats: { cortisol: 14, sleepScore: 92, biologicalAge: 41, healthScore: 91 },
    journeyDuration: "6 months",
    programType: "3-Day Executive Reset",
    location: "Dubai",
    viewCount: 2891,
    likeCount: 389,
    isFeatured: false,
    publishedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    author: { id: "u8", firstName: "Vikrant", lastName: "Shah", profileImageUrl: null }
  },
];

const mockBadges: AchievementBadge[] = [
  { id: "b1", name: "Protocol Pioneer", slug: "protocol-pioneer", description: "Completed your first 30-day protocol with 90%+ compliance", category: "achievement", icon: "Trophy", color: "#f59e0b", points: 500, rarity: "common" },
  { id: "b2", name: "Biomarker Master", slug: "biomarker-master", description: "Achieved optimal status in 80% of biomarkers", category: "health", icon: "Target", color: "#10b981", points: 1000, rarity: "rare" },
  { id: "b3", name: "Community Champion", slug: "community-champion", description: "Received 100+ likes on your posts and comments", category: "community", icon: "Heart", color: "#ec4899", points: 750, rarity: "rare" },
  { id: "b4", name: "Knowledge Seeker", slug: "knowledge-seeker", description: "Read 50+ educational articles on the platform", category: "learning", icon: "BookOpen", color: "#8b5cf6", points: 300, rarity: "common" },
  { id: "b5", name: "Retreat Veteran", slug: "retreat-veteran", description: "Completed 3+ AIWO wellness retreats", category: "experience", icon: "MapPin", color: "#14b8a6", points: 2000, rarity: "epic" },
  { id: "b6", name: "Longevity Legend", slug: "longevity-legend", description: "Maintained a health score above 90 for 12 consecutive months", category: "health", icon: "Crown", color: "#eab308", points: 5000, rarity: "legendary" },
  { id: "b7", name: "Sleep Optimizer", slug: "sleep-optimizer", description: "Achieved 7+ hours of quality sleep for 30 consecutive days", category: "health", icon: "Moon", color: "#6366f1", points: 600, rarity: "rare" },
  { id: "b8", name: "Consistency King", slug: "consistency-king", description: "Logged into the platform for 100 consecutive days", category: "engagement", icon: "Flame", color: "#f97316", points: 800, rarity: "rare" },
];

const mockLeaderboard: UserCommunityStats[] = [
  { userId: "l1", totalPosts: 156, totalComments: 892, totalLikesReceived: 4521, totalBadges: 12, totalPoints: 15600, reputation: 98, level: 15, streak: 234, user: { id: "l1", firstName: "Rajesh", lastName: "Sharma", profileImageUrl: null } },
  { userId: "l2", totalPosts: 134, totalComments: 756, totalLikesReceived: 3890, totalBadges: 10, totalPoints: 13400, reputation: 95, level: 14, streak: 189, user: { id: "l2", firstName: "Priya", lastName: "Nair", profileImageUrl: null } },
  { userId: "l3", totalPosts: 98, totalComments: 654, totalLikesReceived: 2987, totalBadges: 9, totalPoints: 11200, reputation: 92, level: 12, streak: 156, user: { id: "l3", firstName: "Amit", lastName: "Patel", profileImageUrl: null } },
  { userId: "l4", totalPosts: 87, totalComments: 543, totalLikesReceived: 2456, totalBadges: 8, totalPoints: 9800, reputation: 89, level: 11, streak: 134, user: { id: "l4", firstName: "Sunita", lastName: "Gupta", profileImageUrl: null } },
  { userId: "l5", totalPosts: 76, totalComments: 432, totalLikesReceived: 2123, totalBadges: 7, totalPoints: 8500, reputation: 86, level: 10, streak: 98, user: { id: "l5", firstName: "Vikram", lastName: "Reddy", profileImageUrl: null } },
];

export default function Community() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("forums");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [newStoryOpen, setNewStoryOpen] = useState(false);
  const [newPostData, setNewPostData] = useState({ title: '', content: '', categoryId: '' });
  const [newStoryData, setNewStoryData] = useState({ title: '', summary: '', content: '', journeyDuration: '' });
  const [newComment, setNewComment] = useState('');

  // Queries with mock data fallback for demo
  const { data: apiCategories = [], isLoading: categoriesLoading } = useQuery<ForumCategory[]>({
    queryKey: ["/api/community/categories"],
  });
  const categories = apiCategories.length > 0 ? apiCategories : mockCategories;

  const { data: apiPosts = [], isLoading: postsLoading } = useQuery<ForumPost[]>({
    queryKey: ["/api/community/posts", selectedCategory],
    queryFn: async () => {
      const url = selectedCategory 
        ? `/api/community/posts?categoryId=${selectedCategory}` 
        : '/api/community/posts';
      const res = await fetch(url, { credentials: 'include' });
      return res.json();
    },
  });
  const posts = apiPosts.length > 0 ? apiPosts : (selectedCategory ? mockPosts.filter(p => p.categoryId === selectedCategory) : mockPosts);

  const { data: comments = [], isLoading: commentsLoading } = useQuery<PostComment[]>({
    queryKey: ["/api/community/posts", selectedPost?.id, "comments"],
    queryFn: async () => {
      const res = await fetch(`/api/community/posts/${selectedPost?.id}/comments`, { credentials: 'include' });
      return res.json();
    },
    enabled: !!selectedPost,
  });

  const { data: apiGroups = [], isLoading: groupsLoading } = useQuery<SupportGroup[]>({
    queryKey: ["/api/community/groups"],
  });
  const groups = apiGroups.length > 0 ? apiGroups : mockGroups;

  const { data: apiStories = [], isLoading: storiesLoading } = useQuery<SuccessStory[]>({
    queryKey: ["/api/community/stories"],
  });
  const stories = apiStories.length > 0 ? apiStories : mockStories;

  const { data: apiBadges = [] } = useQuery<AchievementBadge[]>({
    queryKey: ["/api/community/badges"],
  });
  const badges = apiBadges.length > 0 ? apiBadges : mockBadges;

  const { data: myAchievements = [] } = useQuery<UserAchievement[]>({
    queryKey: ["/api/community/my-achievements"],
  });

  const { data: myStats } = useQuery<UserCommunityStats>({
    queryKey: ["/api/community/my-stats"],
  });

  const { data: apiLeaderboard = [] } = useQuery<UserCommunityStats[]>({
    queryKey: ["/api/community/leaderboard"],
  });
  const leaderboard = apiLeaderboard.length > 0 ? apiLeaderboard : mockLeaderboard;

  // Mutations
  const createPostMutation = useMutation({
    mutationFn: async (data: typeof newPostData) => {
      return await apiRequest("POST", "/api/community/posts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      setNewPostOpen(false);
      setNewPostData({ title: '', content: '', categoryId: '' });
      toast({ title: "Post Created", description: "Your post has been published successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create post.", variant: "destructive" });
    },
  });

  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      return await apiRequest("POST", `/api/community/posts/${postId}/like`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      return await apiRequest("POST", `/api/community/posts/${postId}/comments`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts", selectedPost?.id, "comments"] });
      setNewComment('');
      toast({ title: "Comment Added", description: "Your comment has been posted." });
    },
  });

  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      return await apiRequest("POST", `/api/community/groups/${groupId}/join`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/groups"] });
      toast({ title: "Joined Group", description: "Welcome to the group!" });
    },
  });

  const leaveGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      return await apiRequest("POST", `/api/community/groups/${groupId}/leave`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/groups"] });
      toast({ title: "Left Group", description: "You have left the group." });
    },
  });

  const createStoryMutation = useMutation({
    mutationFn: async (data: typeof newStoryData) => {
      return await apiRequest("POST", "/api/community/stories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/stories"] });
      setNewStoryOpen(false);
      setNewStoryData({ title: '', summary: '', content: '', journeyDuration: '' });
      toast({ title: "Story Submitted", description: "Your story is pending review." });
    },
  });

  // Post Detail View
  if (selectedPost) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => setSelectedPost(null)} className="mb-4" data-testid="button-back-to-posts">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Posts
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl" data-testid="text-post-title">{selectedPost.title}</CardTitle>
                <div className="flex items-center gap-3 mt-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedPost.author?.profileImageUrl || ''} />
                    <AvatarFallback>{getInitials(selectedPost.author?.firstName, selectedPost.author?.lastName)}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <span className="font-medium">{selectedPost.author?.firstName} {selectedPost.author?.lastName}</span>
                    <span className="text-muted-foreground ml-2">
                      {formatDistanceToNow(new Date(selectedPost.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant={selectedPost.hasLiked ? "default" : "outline"} 
                  size="sm"
                  onClick={() => likePostMutation.mutate(selectedPost.id)}
                  data-testid="button-like-post"
                >
                  <Heart className={`w-4 h-4 mr-1 ${selectedPost.hasLiked ? 'fill-current' : ''}`} />
                  {selectedPost.likeCount || 0}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none" data-testid="text-post-content">
              {selectedPost.content}
            </div>
            {selectedPost.tags && selectedPost.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedPost.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary">{tag}</Badge>
                ))}
              </div>
            )}
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{selectedPost.viewCount || 0} views</span>
              <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" />{selectedPost.commentCount || 0} comments</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Comments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1"
                data-testid="input-new-comment"
              />
              <Button 
                onClick={() => createCommentMutation.mutate({ postId: selectedPost.id, content: newComment })}
                disabled={!newComment.trim() || createCommentMutation.isPending}
                data-testid="button-submit-comment"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {commentsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}
              </div>
            ) : comments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No comments yet. Be the first to comment!</p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.author?.profileImageUrl || ''} />
                      <AvatarFallback>{getInitials(comment.author?.firstName, comment.author?.lastName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{comment.author?.firstName} {comment.author?.lastName}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm mt-1" data-testid={`text-comment-${comment.id}`}>{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Community</h1>
          <p className="text-muted-foreground mt-1">Connect, share, and grow with fellow wellness enthusiasts</p>
        </div>
        {myStats && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{myStats.level || 1}</div>
                  <div className="text-xs text-muted-foreground">Level</div>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                  <div className="text-2xl font-bold">{myStats.totalPoints || 0}</div>
                  <div className="text-xs text-muted-foreground">Points</div>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="flex items-center gap-1">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="font-bold">{myStats.streak || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="forums" data-testid="tab-forums">
            <MessageSquare className="w-4 h-4 mr-2" />
            Forums
          </TabsTrigger>
          <TabsTrigger value="groups" data-testid="tab-groups">
            <Users className="w-4 h-4 mr-2" />
            Groups
          </TabsTrigger>
          <TabsTrigger value="stories" data-testid="tab-stories">
            <BookOpen className="w-4 h-4 mr-2" />
            Stories
          </TabsTrigger>
          <TabsTrigger value="badges" data-testid="tab-badges">
            <Award className="w-4 h-4 mr-2" />
            Badges
          </TabsTrigger>
          <TabsTrigger value="leaderboard" data-testid="tab-leaderboard">
            <Trophy className="w-4 h-4 mr-2" />
            Leaderboard
          </TabsTrigger>
        </TabsList>

        {/* Forums Tab */}
        <TabsContent value="forums" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedCategory && (
                <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(null)} data-testid="button-all-categories">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  All Categories
                </Button>
              )}
              <Select value={selectedCategory || ''} onValueChange={(v) => setSelectedCategory(v || null)}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Dialog open={newPostOpen} onOpenChange={setNewPostOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-new-post">
                  <Plus className="w-4 h-4 mr-2" />
                  New Post
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Post</DialogTitle>
                  <DialogDescription>Share your thoughts with the community</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Select value={newPostData.categoryId} onValueChange={(v) => setNewPostData({ ...newPostData, categoryId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Post title"
                    value={newPostData.title}
                    onChange={(e) => setNewPostData({ ...newPostData, title: e.target.value })}
                    data-testid="input-post-title"
                  />
                  <Textarea
                    placeholder="Write your post content..."
                    value={newPostData.content}
                    onChange={(e) => setNewPostData({ ...newPostData, content: e.target.value })}
                    className="min-h-[200px]"
                    data-testid="input-post-content"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setNewPostOpen(false)}>Cancel</Button>
                  <Button 
                    onClick={() => createPostMutation.mutate(newPostData)}
                    disabled={!newPostData.title || !newPostData.content || !newPostData.categoryId || createPostMutation.isPending}
                    data-testid="button-submit-post"
                  >
                    {createPostMutation.isPending ? "Publishing..." : "Publish Post"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {!selectedCategory && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {categoriesLoading ? (
                Array(10).fill(0).map((_, i) => <Skeleton key={i} className="h-24" />)
              ) : (
                categories.map((category) => (
                  <Card 
                    key={category.id} 
                    className="hover-elevate cursor-pointer"
                    onClick={() => setSelectedCategory(category.id)}
                    data-testid={`card-category-${category.slug}`}
                  >
                    <CardContent className="p-4 text-center">
                      <div 
                        className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center"
                        style={{ backgroundColor: category.color || '#10B981' }}
                      >
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-medium text-sm">{category.name}</h3>
                      <p className="text-xs text-muted-foreground">{category.postCount || 0} posts</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          <div className="space-y-4">
            {postsLoading ? (
              Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-32" />)
            ) : posts.length === 0 ? (
              <Card className="p-8 text-center">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No posts yet</h3>
                <p className="text-muted-foreground mb-4">Be the first to start a discussion!</p>
                <Button onClick={() => setNewPostOpen(true)}>Create Post</Button>
              </Card>
            ) : (
              posts.map((post) => (
                <Card 
                  key={post.id} 
                  className="hover-elevate cursor-pointer"
                  onClick={() => setSelectedPost(post)}
                  data-testid={`card-post-${post.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src={post.author?.profileImageUrl || ''} />
                        <AvatarFallback>{getInitials(post.author?.firstName, post.author?.lastName)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {post.isPinned && <Badge variant="secondary">Pinned</Badge>}
                          <h3 className="font-semibold truncate">{post.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{post.author?.firstName} {post.author?.lastName}</span>
                          <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                          <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{post.likeCount || 0}</span>
                          <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{post.commentCount || 0}</span>
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.viewCount || 0}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Groups Tab */}
        <TabsContent value="groups" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupsLoading ? (
              Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-48" />)
            ) : groups.length === 0 ? (
              <Card className="col-span-full p-8 text-center">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No groups available</h3>
                <p className="text-muted-foreground">Support groups will appear here soon.</p>
              </Card>
            ) : (
              groups.map((group) => (
                <Card key={group.id} className="hover-elevate" data-testid={`card-group-${group.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <Badge variant="outline" className="mt-1">{group.type?.replace('_', ' ')}</Badge>
                      </div>
                      <Button
                        size="sm"
                        variant={group.isMember ? "outline" : "default"}
                        onClick={() => group.isMember 
                          ? leaveGroupMutation.mutate(group.id) 
                          : joinGroupMutation.mutate(group.id)
                        }
                        disabled={joinGroupMutation.isPending || leaveGroupMutation.isPending}
                        data-testid={`button-${group.isMember ? 'leave' : 'join'}-${group.id}`}
                      >
                        {group.isMember ? (
                          <><UserMinus className="w-4 h-4 mr-1" />Leave</>
                        ) : (
                          <><UserPlus className="w-4 h-4 mr-1" />Join</>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{group.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="w-4 h-4" />{group.memberCount || 0} members</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Success Stories Tab */}
        <TabsContent value="stories" className="space-y-6">
          <div className="flex justify-end">
            <Dialog open={newStoryOpen} onOpenChange={setNewStoryOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-share-story">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Share Your Story
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Share Your Success Story</DialogTitle>
                  <DialogDescription>Inspire others with your health transformation journey</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input
                    placeholder="Story title"
                    value={newStoryData.title}
                    onChange={(e) => setNewStoryData({ ...newStoryData, title: e.target.value })}
                    data-testid="input-story-title"
                  />
                  <Input
                    placeholder="Journey duration (e.g., 6 months)"
                    value={newStoryData.journeyDuration}
                    onChange={(e) => setNewStoryData({ ...newStoryData, journeyDuration: e.target.value })}
                  />
                  <Textarea
                    placeholder="Brief summary of your transformation..."
                    value={newStoryData.summary}
                    onChange={(e) => setNewStoryData({ ...newStoryData, summary: e.target.value })}
                  />
                  <Textarea
                    placeholder="Tell your full story..."
                    value={newStoryData.content}
                    onChange={(e) => setNewStoryData({ ...newStoryData, content: e.target.value })}
                    className="min-h-[200px]"
                    data-testid="input-story-content"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setNewStoryOpen(false)}>Cancel</Button>
                  <Button 
                    onClick={() => createStoryMutation.mutate(newStoryData)}
                    disabled={!newStoryData.title || !newStoryData.content || createStoryMutation.isPending}
                    data-testid="button-submit-story"
                  >
                    {createStoryMutation.isPending ? "Submitting..." : "Submit Story"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {storiesLoading ? (
              Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-64" />)
            ) : stories.length === 0 ? (
              <Card className="col-span-full p-8 text-center">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No success stories yet</h3>
                <p className="text-muted-foreground mb-4">Be the first to share your transformation journey!</p>
                <Button onClick={() => setNewStoryOpen(true)}>Share Your Story</Button>
              </Card>
            ) : (
              stories.map((story) => (
                <Card key={story.id} className="hover-elevate" data-testid={`card-story-${story.id}`}>
                  {story.isFeatured && (
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center py-1 text-sm font-medium">
                      <Star className="w-4 h-4 inline mr-1" />Featured Story
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar>
                        <AvatarImage src={story.author?.profileImageUrl || ''} />
                        <AvatarFallback>{getInitials(story.author?.firstName, story.author?.lastName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{story.author?.firstName} {story.author?.lastName}</p>
                        <p className="text-xs text-muted-foreground">{story.journeyDuration} journey</p>
                      </div>
                    </div>
                    <CardTitle>{story.title}</CardTitle>
                    {story.summary && <CardDescription>{story.summary}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm line-clamp-3">{story.content}</p>
                    {story.beforeStats && story.afterStats && (
                      <div className="grid grid-cols-2 gap-4 mt-4 p-3 bg-muted/50 rounded-lg">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Before</p>
                          <p className="text-lg font-bold">{story.beforeStats.healthScore || '-'}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">After</p>
                          <p className="text-lg font-bold text-primary">{story.afterStats.healthScore || '-'}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{story.viewCount || 0}</span>
                      <span className="flex items-center gap-1"><Heart className="w-4 h-4" />{story.likeCount || 0}</span>
                      {story.location && <Badge variant="secondary">{story.location}</Badge>}
                    </div>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>My Achievements</CardTitle>
                <CardDescription>Badges you've earned on your journey</CardDescription>
              </CardHeader>
              <CardContent>
                {myAchievements.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Medal className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Start engaging with the community to earn badges!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {myAchievements.map((achievement) => (
                      <div key={achievement.id} className="text-center" data-testid={`badge-earned-${achievement.badge?.slug}`}>
                        <div className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center ${getRarityColor(achievement.badge?.rarity || 'common')}`}>
                          <Award className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-sm font-medium">{achievement.badge?.name}</p>
                        <p className="text-xs text-muted-foreground">+{achievement.badge?.points} pts</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Badges</CardTitle>
                <CardDescription>Complete challenges to unlock badges</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {badges.map((badge) => {
                      const earned = myAchievements.some(a => a.badge?.id === badge.id);
                      return (
                        <div 
                          key={badge.id} 
                          className={`flex items-center gap-3 p-3 rounded-lg ${earned ? 'bg-primary/10' : 'bg-muted/30'}`}
                          data-testid={`badge-${badge.slug}`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${earned ? getRarityColor(badge.rarity) : 'bg-muted'}`}>
                            <Award className={`w-5 h-5 ${earned ? 'text-white' : 'text-muted-foreground'}`} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{badge.name}</p>
                            <p className="text-xs text-muted-foreground">{badge.description}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={earned ? "default" : "outline"}>{badge.rarity}</Badge>
                            <p className="text-xs text-muted-foreground mt-1">+{badge.points} pts</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Community Leaderboard
              </CardTitle>
              <CardDescription>Top contributors this month</CardDescription>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Leaderboard data will appear as community grows</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((entry, index) => (
                    <div 
                      key={entry.userId} 
                      className={`flex items-center gap-4 p-4 rounded-lg ${index < 3 ? 'bg-primary/5' : 'bg-muted/30'}`}
                      data-testid={`leaderboard-rank-${index + 1}`}
                    >
                      <div className="w-8 text-center">
                        {index === 0 ? <Crown className="w-6 h-6 text-yellow-500 mx-auto" /> :
                         index === 1 ? <Medal className="w-6 h-6 text-gray-400 mx-auto" /> :
                         index === 2 ? <Medal className="w-6 h-6 text-amber-600 mx-auto" /> :
                         <span className="text-lg font-bold text-muted-foreground">{index + 1}</span>}
                      </div>
                      <Avatar>
                        <AvatarImage src={entry.user?.profileImageUrl || ''} />
                        <AvatarFallback>{getInitials(entry.user?.firstName, entry.user?.lastName)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{entry.user?.firstName} {entry.user?.lastName}</p>
                        <p className="text-xs text-muted-foreground">Level {entry.level || 1}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">{entry.totalPoints || 0}</p>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline">{entry.totalBadges || 0} badges</Badge>
                        <div className="flex items-center gap-1">
                          <Flame className="w-4 h-4 text-orange-500" />
                          {entry.streak || 0}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
