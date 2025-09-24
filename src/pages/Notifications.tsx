import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Mail, Phone, CheckCircle } from 'lucide-react';
import { auth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { FlatCardSkeleton } from '@/components/layout/FlatCardSkeleton';

interface Notification {
  id: number;
  flatId: number;
  flatTitle: string;
  name: string;
  userEmail?: string;
  userPhone?: string;
  shareContact: boolean;
  read: boolean;
  createdAt: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await auth.fetchWithAuth('/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await auth.fetchWithAuth(`/notifications/${notificationId}/read`, {
        method: 'POST',
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read: true }
              : notification
          )
        );
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const clearAllNotifications = async () => {
    try {
      const response = await auth.fetchWithAuth('/notifications/deleteAll', {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotifications([]);
        toast({
          title: "Success",
          description: "All notifications cleared",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear notifications",
        variant: "destructive",
      });
    }
  };

  const handleCardClick = (notification: Notification) => {
    // Just for visual feedback, no longer auto-marking as read
    console.log('Notification clicked:', notification.id);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Notifications</h1>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <FlatCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Notifications</h1>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm">
              {notifications.filter(n => !n.read).length} unread
            </Badge>
            {notifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllNotifications}
                className="text-sm"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>

        {notifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No notifications yet</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  !notification.read 
                    ? 'bg-background border-primary/20 shadow-sm' 
                    : 'bg-muted/30 opacity-70'
                }`}
                onClick={() => handleCardClick(notification)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {notification.flatTitle}
                      </h3>
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {notification.name}
                        </span>
                        {" "}expressed interest in your flat
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Contact Details:</h4>
                      {notification.shareContact ? (
                        <div className="space-y-2">
                          {notification.userEmail && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{notification.userEmail}</span>
                            </div>
                          )}
                          {notification.userPhone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{notification.userPhone}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No contact details shared
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/chat/${notification.flatId}`);
                        }}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Chat
                      </Button>
                      {!notification.read && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;