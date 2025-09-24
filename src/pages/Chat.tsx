import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Send, Check, CheckCheck } from 'lucide-react';
import { auth } from '@/lib/auth';
import { ChatMessage, SendMessageRequest } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const Chat = () => {
  const { flatId } = useParams<{ flatId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUserEmail, setOtherUserEmail] = useState<string | null>(null);
  const [flatDetails, setFlatDetails] = useState<any>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const stompClientRef = useRef<Client | null>(null);

  const currentUser = auth.getUser();
  const currentUserEmail = currentUser?.email;

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      navigate('/');
      return;
    }

    if (!flatId) {
      navigate('/flats');
      return;
    }

    fetchMessages();
    connectWebSocket();

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [flatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connectWebSocket = () => {
    const socket = new SockJS('http://localhost:8080/ws-chat');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str) => {
        console.log(str);
      },
    });

    stompClient.onConnect = () => {
      console.log('Connected to WebSocket');
      stompClient.subscribe(`/topic/chat/${flatId}`, (message) => {
        try {
          const chatMessage: ChatMessage = JSON.parse(message.body);
          setMessages(prev => {
            // Avoid duplicate messages
            if (prev.find(msg => msg.id === chatMessage.id)) {
              return prev.map(msg => 
                msg.id === chatMessage.id ? chatMessage : msg
              );
            }
            return [...prev, chatMessage];
          });
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });
    };

    stompClient.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    stompClient.activate();
    stompClientRef.current = stompClient;
  };

  const fetchMessages = async () => {
    try {
      const response = await auth.fetchWithAuth(`/chat/${flatId}`);
      if (response.ok) {
        const data: ChatMessage[] = await response.json();
        setMessages(data);
        
        // Determine other user email and mark unread messages as read
        if (data.length > 0) {
          const otherUser = data.find(msg => 
            msg.senderEmail !== currentUserEmail && msg.receiverEmail === currentUserEmail
          );
          if (otherUser) {
            setOtherUserEmail(otherUser.senderEmail);
            // Mark unread messages as read
            const unreadMessages = data.filter(msg => 
              msg.receiverEmail === currentUserEmail && !msg.read
            );
            unreadMessages.forEach(msg => markAsRead(msg.id));
          }
        }
      } else {
        throw new Error('Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !otherUserEmail || sending) return;

    setSending(true);
    try {
      const messageData: SendMessageRequest = {
        receiverEmail: otherUserEmail,
        message: newMessage.trim(),
      };

      const response = await auth.fetchWithAuth(`/chat/${flatId}`, {
        method: 'POST',
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        setNewMessage('');
        // Message will be added via WebSocket
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (messageId: number) => {
    try {
      await auth.fetchWithAuth(`/chat/${messageId}/read`, {
        method: 'PATCH',
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true 
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <Card className="rounded-none border-x-0 border-t-0">
        <CardHeader className="flex flex-row items-center space-y-0 p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/flats')}
            className="mr-3"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {flatDetails?.postedBy?.name?.[0] || 'F'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">Chat - Flat #{flatId}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {flatDetails?.address || 'Loading...'}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
          <div className="py-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = message.senderEmail === currentUserEmail;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-3 py-2 ${
                        isOwnMessage
                          ? 'bg-muted text-foreground'
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 ${
                        isOwnMessage ? 'text-muted-foreground' : 'text-primary-foreground/70'
                      }`}>
                        <span className="text-xs">
                          {formatTimestamp(message.createdAt)}
                        </span>
                        {isOwnMessage && (
                          <div>
                            {message.read ? (
                              <CheckCheck className="h-3 w-3" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <Card className="rounded-none border-x-0 border-b-0">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                disabled={sending}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Chat;