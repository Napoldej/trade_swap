import { Bell, Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsService } from "@/services/notifications.service";
import { format } from "date-fns";

const Notifications = () => {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationsService.getMyNotifications,
  });

  const markReadMutation = useMutation({
    mutationFn: notificationsService.markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllMutation = useMutation({
    mutationFn: notificationsService.markAllAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-6 flex-1 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Notifications</h1>
          {notifications.some((n) => !n.is_read) && (
            <button
              className="text-sm text-primary hover:underline"
              onClick={() => markAllMutation.mutate()}
              disabled={markAllMutation.isPending}
            >
              Mark all as read
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map((n) => (
              <div
                key={n.notification_id}
                onClick={() => !n.is_read && markReadMutation.mutate(n.notification_id)}
                className={`flex items-start gap-4 p-4 rounded-xl transition-colors hover:bg-muted/50 cursor-pointer ${!n.is_read ? "bg-primary/5" : ""}`}
              >
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.is_read ? "bg-primary" : "invisible"}`} />
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-muted text-primary">
                  <Bell className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {format(new Date(n.created_at), "MMM d, h:mm a")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
