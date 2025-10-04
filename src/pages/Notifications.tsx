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
  interestedUserId: string,
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Notifications</h1>
              <p className="text-muted-foreground">Stay updated with your flat interests</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="default" className="text-sm px-3 py-1">
                {notifications.filter(n => !n.read).length} unread
              </Badge>
              {notifications.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllNotifications}
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {notifications.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                    <MessageCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">No notifications yet</h3>
                    <p className="text-sm text-muted-foreground">
                      When someone expresses interest in your flats, you'll see it here
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.01] ${
                    !notification.read 
                      ? 'bg-background border-primary/30 shadow-md' 
                      : 'bg-muted/50 opacity-80'
                  }`}
                  onClick={() => handleCardClick(notification)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg text-foreground">
                            {notification.flatTitle}
                          </h3>
                          {!notification.read && (
                            <Badge variant="default" className="text-xs">New</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          <span className="font-semibold text-foreground">
                            {notification.name}
                          </span>
                          {" "}expressed interest in your flat
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 space-y-4">
                    {notification.shareContact && (notification.userEmail || notification.userPhone) && (
                      <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                        <h4 className="font-semibold text-sm text-foreground mb-2">Contact Details</h4>
                        {notification.userEmail && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-primary" />
                            <span className="text-foreground">{notification.userEmail}</span>
                          </div>
                        )}
                        {notification.userPhone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-primary" />
                            <span className="text-foreground">{notification.userPhone}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/chat/${notification.flatId}/${notification.interestedUserId}`);
                        }}
                        className="flex-1 sm:flex-initial"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Start Chat
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
                          Mark Read
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;