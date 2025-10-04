import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Home, ArrowRight } from 'lucide-react';
import { auth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { FlatCardSkeleton } from '@/components/layout/FlatCardSkeleton';

interface ChatRoom {
  id: number;
  flatId: number;
  ownerId: number;
  interestedUserId: number;
  address: string;
  chatWithUserName: string;
}

const Chats = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const currentUser = auth.getUser();

  useEffect(() => {
    fetchChatRooms();
  }, []);

  const fetchChatRooms = async () => {
    try {
      const response = await auth.fetchWithAuth('/flatFit-v1/api/chat/getAllRooms');
      if (response.ok) {
        const data = await response.json();
        setChatRooms(data);
      } else {
        throw new Error('Failed to fetch chat rooms');
      }
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chats',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = (room: ChatRoom) => {
    const otherUserId = currentUser?.id === room.ownerId ? room.interestedUserId : room.ownerId;
    navigate(`/chat/${room.flatId}/${otherUserId}`);
  };

  if (!auth.isAuthenticated()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Please login to view your chats.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-foreground">My Chats</h1>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">My Chats</h1>
            <p className="text-muted-foreground">
              Continue your conversations about flats
            </p>
          </div>

          {chatRooms.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                    <MessageCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">No chats yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Start a conversation by expressing interest in a flat
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {chatRooms.map((room) => (
                <Card
                  key={room.id}
                  className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/40 hover:scale-[1.01] group"
                  onClick={() => handleChatClick(room)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {room.chatWithUserName?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg text-foreground truncate">
                            {room.chatWithUserName}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Home className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{room.address}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          Flat #{room.flatId}
                        </Badge>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
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

export default Chats;
