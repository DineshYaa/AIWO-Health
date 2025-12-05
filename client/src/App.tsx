import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { useAuth } from "@/hooks/useAuth";
import { usePageTracking } from "@/hooks/usePageTracking";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationCenter } from "@/components/NotificationCenter";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Biomarkers from "@/pages/Biomarkers";
import Protocols from "@/pages/Protocols";
import Booking from "@/pages/Booking";
import Chat from "@/pages/Chat";
import Profile from "@/pages/Profile";
import Telemedicine from "@/pages/Telemedicine";
import WearableAnalytics from "@/pages/WearableAnalytics";
import Community from "@/pages/Community";
import PhysicianDashboard from "@/pages/PhysicianDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import AddDoctor from "./pages/Doctor/AddDoctor";
import DoctorList from "./pages/Doctor/DoctorList";
import ViewDoctor from "./pages/Doctor/ViewDoctor";
import LoginPage from "./pages/Login";
import ForgotPasswordPage from "./pages/ForgotPassword";
import RolesPage from "./pages/Roles";
import RolesListPage from "./pages/roles/RolesList";
import AddRolePage from "./pages/roles/AddRole";
import DoctorSchedulePage from "./pages/doctorSchedule";

function AuthenticatedLayout() {
  const { user } = useAuth();
  console.log("user : ", user);
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar user={user} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between h-14 px-4 border-b border-border shrink-0 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-2">
              <NotificationCenter />
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <Switch>
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/biomarkers" component={Biomarkers} />
              <Route path="/protocols" component={Protocols} />
              <Route path="/booking" component={Booking} />
              <Route path="/telemedicine" component={Telemedicine} />
              <Route path="/wearables" component={WearableAnalytics} />
              <Route path="/community" component={Community} />
              <Route path="/chat" component={Chat} />
              <Route path="/profile" component={Profile} />
              <Route path="/roles" component={RolesListPage} />
              <Route path="/roles/add" component={AddRolePage} />
              <Route path="/roles/edit/:id" component={AddRolePage} />
              <Route path="/physician" component={PhysicianDashboard} />
              <Route path="/doctors" component={DoctorList} />

              <Route path="/admin">
                {() => (
                  <ErrorBoundary>
                    <AdminDashboard />
                  </ErrorBoundary>
                )}
              </Route>
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  const [location] = useLocation();
  usePageTracking();
  console.log("isAuthenticated ", isAuthenticated);
  console.log("isLoading ", isLoading);
  // usePageTracking();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/20" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // return location !== "/" ? <AuthLayout /> : <Landing />;
    // Allow unauthenticated access to certain doctor routes
    if (location.startsWith("/doctors/view/")) {
      return <ViewDoctor />;
    }
    if (location.startsWith("/doctors/edit/")) {
      return <AddDoctor />;
    }

    switch (location) {
      case "/api/login":
        return <LoginPage />;
<<<<<<< HEAD
      case '/forgot-password':
        return <ForgotPasswordPage />;
      case '/api/doctor-schedule':
=======
      case "/doctors/add":
        return <AddDoctor />;
      case "/doctors":
        return <DoctorList />;
      case "/api/doctor-schedule":
>>>>>>> 85a538687f8995f8c39a11377c859c99e96ec326
        return <DoctorSchedulePage />;
      case '/roles':
        return <RolesListPage />;
      default:
        return <Landing />;
      // switch (location) {
      //   case '/api/login':
      //     return <LoginPage />;
      //   case '/api/doctor-schedule':
      //     return <DoctorSchedulePage />;
      //   default:
      //     return <Landing />;
    }
  }

  return <AuthenticatedLayout />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="aiwo-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
