import * as React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Bell,
  Check,
  CheckCheck,
  AlertCircle,
  Calendar,
  Heart,
  MessageSquare,
  Settings,
  Trash2,
  Activity,
  FileText,
  Users,
  TrendingUp,
  Zap,
  Wifi,
  WifiOff,
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  category: string;
  priority: string;
  read: boolean;
  actionUrl: string | null;
  metadata: any;
  createdAt: string;
}

interface NotificationPreferences {
  id: string;
  userId: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  emailFrequency: string;
  categories: {
    health: boolean;
    booking: boolean;
    protocol: boolean;
    community: boolean;
    system: boolean;
  };
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
}

const categoryIcons: Record<string, any> = {
  health: Heart,
  booking: Calendar,
  protocol: FileText,
  community: MessageSquare,
  system: Settings,
  wearable: Activity,
  biomarker: TrendingUp,
  alert: AlertCircle,
};

const priorityColors: Record<string, string> = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  normal: 'bg-blue-500',
  low: 'bg-gray-400',
};

export function NotificationCenter() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!user?.id) return;

    const connect = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;
        const socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
          setWsConnected(true);
          socket.send(JSON.stringify({ type: 'auth', userId: user.id }));
        };

        socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === 'notification') {
              queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
              queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
            }
          } catch (err) {
            console.error('Failed to parse WebSocket message:', err);
          }
        };

        socket.onclose = () => {
          setWsConnected(false);
          wsRef.current = null;
          reconnectTimeoutRef.current = setTimeout(connect, 5000);
        };

        socket.onerror = () => {
          setWsConnected(false);
        };
      } catch (err) {
        console.error('WebSocket connection failed:', err);
      }
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [user?.id]);

  const { data: notifications = [], isLoading: notificationsLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    refetchInterval: wsConnected ? false : 30000,
  });

  const { data: unreadCount = { count: 0 } } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread-count"],
    refetchInterval: wsConnected ? false : 15000,
  });

  const { data: preferences, isLoading: preferencesLoading } = useQuery<NotificationPreferences>({
    queryKey: ["/api/notification-preferences"],
    enabled: preferencesOpen,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return await apiRequest("POST", `/api/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
      toast({ title: "All notifications marked as read" });
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: Partial<NotificationPreferences>) => {
      return await apiRequest("PATCH", "/api/notification-preferences", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notification-preferences"] });
      toast({ title: "Preferences updated" });
    },
    onError: () => {
      toast({ title: "Failed to update preferences", variant: "destructive" });
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    setOpen(false);
  };

  const getCategoryIcon = (category: string) => {
    const Icon = categoryIcons[category] || Bell;
    return <Icon className="w-4 h-4" />;
  };

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative" 
          data-testid="button-notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount.count > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] px-1 flex items-center justify-center text-xs"
              variant="destructive"
            >
              {unreadCount.count > 99 ? '99+' : unreadCount.count}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadNotifications.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                data-testid="button-mark-all-read"
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Mark all read
              </Button>
            )}
            <Dialog open={preferencesOpen} onOpenChange={setPreferencesOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-notification-settings">
                  <Settings className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Notification Preferences</DialogTitle>
                  <DialogDescription>
                    Manage how and when you receive notifications
                  </DialogDescription>
                </DialogHeader>
                {preferencesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : preferences ? (
                  <div className="space-y-6 py-4">
                    <div className="space-y-4">
                      <h4 className="font-medium">Delivery Channels</h4>
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="email-enabled" className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-muted-foreground" />
                            Email Notifications
                          </Label>
                          <Switch
                            id="email-enabled"
                            checked={preferences.emailEnabled}
                            onCheckedChange={(checked) => 
                              updatePreferencesMutation.mutate({ emailEnabled: checked })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="sms-enabled" className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-muted-foreground" />
                            SMS Notifications
                          </Label>
                          <Switch
                            id="sms-enabled"
                            checked={preferences.smsEnabled}
                            onCheckedChange={(checked) => 
                              updatePreferencesMutation.mutate({ smsEnabled: checked })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="push-enabled" className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-muted-foreground" />
                            Push Notifications
                          </Label>
                          <Switch
                            id="push-enabled"
                            checked={preferences.pushEnabled}
                            onCheckedChange={(checked) => 
                              updatePreferencesMutation.mutate({ pushEnabled: checked })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="inapp-enabled" className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-muted-foreground" />
                            In-App Notifications
                          </Label>
                          <Switch
                            id="inapp-enabled"
                            checked={preferences.inAppEnabled}
                            onCheckedChange={(checked) => 
                              updatePreferencesMutation.mutate({ inAppEnabled: checked })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium">Categories</h4>
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="cat-health" className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-red-500" />
                            Health Updates
                          </Label>
                          <Switch
                            id="cat-health"
                            checked={preferences.categories?.health ?? true}
                            onCheckedChange={(checked) => {
                              const currentCategories = preferences.categories || {};
                              updatePreferencesMutation.mutate({ 
                                categories: { ...currentCategories, health: checked } 
                              });
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="cat-booking" className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            Booking Reminders
                          </Label>
                          <Switch
                            id="cat-booking"
                            checked={preferences.categories?.booking ?? true}
                            onCheckedChange={(checked) => {
                              const currentCategories = preferences.categories || {};
                              updatePreferencesMutation.mutate({ 
                                categories: { ...currentCategories, booking: checked } 
                              });
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="cat-protocol" className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-green-500" />
                            Protocol Updates
                          </Label>
                          <Switch
                            id="cat-protocol"
                            checked={preferences.categories?.protocol ?? true}
                            onCheckedChange={(checked) => {
                              const currentCategories = preferences.categories || {};
                              updatePreferencesMutation.mutate({ 
                                categories: { ...currentCategories, protocol: checked } 
                              });
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="cat-community" className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-purple-500" />
                            Community Activity
                          </Label>
                          <Switch
                            id="cat-community"
                            checked={preferences.categories?.community ?? true}
                            onCheckedChange={(checked) => {
                              const currentCategories = preferences.categories || {};
                              updatePreferencesMutation.mutate({ 
                                categories: { ...currentCategories, community: checked } 
                              });
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="cat-system" className="flex items-center gap-2">
                            <Settings className="w-4 h-4 text-gray-500" />
                            System Alerts
                          </Label>
                          <Switch
                            id="cat-system"
                            checked={preferences.categories?.system ?? true}
                            onCheckedChange={(checked) => {
                              const currentCategories = preferences.categories || {};
                              updatePreferencesMutation.mutate({ 
                                categories: { ...currentCategories, system: checked } 
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No preferences found
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          {notificationsLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
              <Bell className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {unreadNotifications.length > 0 && (
                <>
                  <div className="px-4 py-2 bg-muted/50">
                    <span className="text-xs font-medium text-muted-foreground uppercase">
                      Unread ({unreadNotifications.length})
                    </span>
                  </div>
                  {unreadNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={() => handleNotificationClick(notification)}
                      getCategoryIcon={getCategoryIcon}
                    />
                  ))}
                </>
              )}
              
              {readNotifications.length > 0 && (
                <>
                  <div className="px-4 py-2 bg-muted/50">
                    <span className="text-xs font-medium text-muted-foreground uppercase">
                      Earlier
                    </span>
                  </div>
                  {readNotifications.slice(0, 20).map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={() => handleNotificationClick(notification)}
                      getCategoryIcon={getCategoryIcon}
                    />
                  ))}
                </>
              )}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function NotificationItem({ 
  notification, 
  onClick,
  getCategoryIcon,
}: { 
  notification: Notification; 
  onClick: () => void;
  getCategoryIcon: (category: string) => JSX.Element;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${
        !notification.read ? 'bg-primary/5' : ''
      }`}
      data-testid={`notification-${notification.id}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${
          notification.read ? 'bg-muted' : 'bg-primary/10 text-primary'
        }`}>
          {getCategoryIcon(notification.category)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
              {notification.title}
            </span>
            {notification.priority === 'urgent' && (
              <Badge variant="destructive" className="text-xs px-1 py-0">
                Urgent
              </Badge>
            )}
            {!notification.read && (
              <div className="w-2 h-2 bg-primary rounded-full" />
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {notification.body}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {notification.createdAt ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }) : 'Just now'}
          </p>
        </div>
      </div>
    </button>
  );
}
