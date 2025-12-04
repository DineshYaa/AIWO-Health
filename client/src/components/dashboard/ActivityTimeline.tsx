import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TestTube, Pill, Dumbbell, Moon, Calendar } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface TimelineItem {
  id: string;
  type: "biomarker" | "protocol" | "booking" | "compliance" | "wearable";
  title: string;
  description: string;
  timestamp: Date;
  status?: "success" | "warning" | "info";
}

interface ActivityTimelineProps {
  items: TimelineItem[];
}

const iconMap = {
  biomarker: TestTube,
  protocol: Pill,
  booking: Calendar,
  compliance: Dumbbell,
  wearable: Activity,
};

const statusColors = {
  success: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  warning: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  info: "bg-chart-3/10 text-chart-3 border-chart-3/20",
};

export function ActivityTimeline({ items }: ActivityTimelineProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent activity
            </p>
          ) : (
            items.map((item, index) => {
              const Icon = iconMap[item.type];
              return (
                <div
                  key={item.id}
                  className="relative flex gap-4 pb-4"
                  data-testid={`timeline-item-${item.id}`}
                >
                  {index !== items.length - 1 && (
                    <div className="absolute left-5 top-10 bottom-0 w-px bg-border" />
                  )}
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border ${
                      statusColors[item.status || "info"]
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">{item.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {item.description}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
