import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Activity,
  ClipboardList,
  Calendar,
  User,
  Settings,
  LogOut,
  Heart,
  Sparkles,
  Stethoscope,
  Shield,
  Video,
  Users,
} from "lucide-react";
// import type { User as UserType } from "@shared/schema";

interface AppSidebarProps {
  user: any | null | undefined;
}

const baseNavItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Biomarkers",
    url: "/biomarkers",
    icon: Activity,
  },
  {
    title: "Protocols",
    url: "/protocols",
    icon: ClipboardList,
  },
  {
    title: "Doctors",
    url: "/doctors",
    icon: ClipboardList,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
  {
    title: "TeamMembers",
    url: "/teamMembers",
    icon: Users,
  },
  {
    title: "Telemedicine",
    url: "/telemedicine",
    icon: Video,
  },
  {
    title: "Wearables",
    url: "/wearables",
    icon: Activity,
  },
  {
    title: "Community",
    url: "/community",
    icon: Users,
  },
  {
    title: "Book Healthcation",
    url: "/booking",
    icon: Calendar,
  },
  {
    title: "Ask Siva",
    url: "/chat",
    icon: Sparkles,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },

];

const physicianNavItem = {
  title: "Physician",
  url: "/physician",
  icon: Stethoscope,
};

const adminNavItem = {
  title: "Admin",
  url: "/admin",
  icon: Settings,
};



const rolesNavItem = {
  title: "Roles",
  url: "/roles",
  icon: Shield,
};

export function AppSidebar({ user }: AppSidebarProps) {
  const userRole = user?.role || "user";
  console.log(userRole);

  const navItems = [
    ...baseNavItems,
    ...(userRole === 'physician' || userRole === 'admin' ? [physicianNavItem] : []),
    // ...(userRole === 'admin' ? [rolesNavItem, settingsNavItem, adminNavItem] : []),
  ];
  const [location] = useLocation();

  const getInitials = (user: any | null | undefined) => {
    if (!user) return "U";
    const first = user.firstName?.charAt(0) || "";
    const last = user.lastName?.charAt(0) || "";
    return (
      (first + last).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"
    );
  };

  const getDisplayName = (user: any | null | undefined) => {
    if (!user) return "User";
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email || "User";
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-6 border-b border-sidebar-border">
        <Link href="/" data-testid="link-logo">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-sidebar-foreground tracking-tight">
                AIWO
              </h1>
              <p className="text-xs text-muted-foreground">Healthcation</p>
            </div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  location === item.url ||
                  (item.url !== "/" && location.startsWith(item.url));

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`py-3 px-4 rounded-lg transition-colors ${isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-4 border-primary"
                        : "hover-elevate"
                        }`}
                    >
                      <Link
                        href={item.url}
                        data-testid={`link-nav-${item.title
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent/50">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarImage
              src={user?.profileImageUrl || undefined}
              alt={getDisplayName(user)}
              className="object-cover"
            />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials(user)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-medium text-sidebar-foreground truncate"
              data-testid="text-user-name"
            >
              {getDisplayName(user)}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {userRole === "physician" && (
                <Badge
                  variant="outline"
                  className="text-xs"
                  data-testid="badge-role"
                >
                  <Stethoscope className="w-3 h-3 mr-1" />
                  Physician
                </Badge>
              )}
              {userRole === "admin" && (
                <Badge
                  variant="outline"
                  className="text-xs"
                  data-testid="badge-role"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
              )}
              {userRole === "user" && (
                <Badge
                  variant="secondary"
                  className="text-xs"
                  data-testid="badge-health-score"
                >
                  Health Score: 85
                </Badge>
              )}
            </div>
          </div>
        </div>
        <a
          href="/api/logout"
          className="flex items-center gap-2 px-4 py-2 mt-2 text-sm text-muted-foreground hover-elevate rounded-lg transition-colors"
          data-testid="link-logout"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </a>
      </SidebarFooter>
    </Sidebar>
  );
}
