import { Bell, CheckCheck, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/contexts/NotificationContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export function NotificationDropdown() {
  const { clientNotifications, unreadClientCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (notificationId: string, transactionId?: string) => {
    markAsRead(notificationId);
    if (transactionId) {
      navigate("/history");
      toast.info("Redirection vers l'historique", {
        description: "Consultez le statut de votre transaction",
      });
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast.success("Toutes les notifications sont marquées comme lues");
  };

  const sortedNotifications = [...clientNotifications].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5); // Afficher seulement les 5 plus récentes

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadClientCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
              {unreadClientCount > 99 ? "99+" : unreadClientCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadClientCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-xs"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Tout marquer lu
            </Button>
          )}
        </div>
        
        <div className="max-h-[400px] overflow-y-auto">
          {sortedNotifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Aucune notification
            </div>
          ) : (
            <>
              {sortedNotifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex flex-col items-start p-3 cursor-pointer ${
                    !notification.read ? "bg-muted/50" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification.id, notification.transactionId)}
                >
                  <div className="flex items-start justify-between w-full">
                    <p className={`text-sm ${!notification.read ? "font-semibold" : ""}`}>
                      {notification.message}
                    </p>
                    {!notification.read && (
                      <span className="ml-2 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </DropdownMenuItem>
              ))}
              
              {clientNotifications.length > 5 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="justify-center cursor-pointer"
                    onClick={() => navigate("/history")}
                  >
                    <History className="h-4 w-4 mr-2" />
                    Voir toutes les notifications
                  </DropdownMenuItem>
                </>
              )}
            </>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
