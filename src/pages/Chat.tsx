import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Send, Check, CheckCheck } from 'lucide-react';
import { auth } from '@/lib/auth';
import { ChatMessage, ChatRoom } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const Chat = () => {
    const { flatId, interestedUserId } = useParams<{ flatId: string, interestedUserId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
    const [otherUserId, setOtherUserId] = useState<number | null>(null);
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

        initializeChat();

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, [flatId]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            scrollToBottom();
        }, 100); // Give the DOM time to render

        return () => clearTimeout(timeout);
    }, [messages]);


    const initializeChat = async () => {
        try {

            const roomResponse = await auth.fetchWithAuth(
                `/api/chat/room/${flatId}/${interestedUserId || 'null'}`,
                {
                    method: 'POST',
                }
            );
            if (!roomResponse.ok) {
                throw new Error('Failed to create/get chat room');
            }
            const room: ChatRoom = await roomResponse.json();
            setChatRoom(room);

            const currentUserId = currentUser?.id;
            if (currentUserId != null) {
                const otherId =
                    room.ownerId === currentUserId ? room.interestedUserId : room.ownerId;
                setOtherUserId(otherId);
            } else {
                setOtherUserId(null);
            }

            await fetchMessages(room.id);
            connectWebSocket(room.id);
        } catch (error) {
            console.error('Error initializing chat:', error);
            toast({
                title: 'Error',
                description: 'Failed to load chat',
                variant: 'destructive',
            });
            setLoading(false);
        }
    };

    const connectWebSocket = (chatRoomId: number) => {
        const socket = new SockJS('http://localhost:8080/ws');
        const token = auth.getToken();
        const stompClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
            debug: (str) => {
                // console.log(str);
            },
        });

        stompClient.onConnect = () => {
            console.log('Connected to WebSocket');

            stompClient.subscribe(`/topic/chat.room.${chatRoomId}`, (message) => {
                try {
                    const chatMessage: ChatMessage = JSON.parse(message.body);
                    setMessages((prev) => {
                        if (prev.find((msg) => msg.id === chatMessage.id)) {
                            return prev.map((msg) =>
                                msg.id === chatMessage.id ? chatMessage : msg
                            );
                        }
                        return [...prev, chatMessage];
                    });
                    if (chatMessage.senderId !== currentUser?.id) {
                        markMessagesAsRead(chatRoomId); // as soon as message comes the read call is made
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            });

            stompClient.subscribe(`/queue/read-receipts`, (message) => {
                console.log("atleast came here")
                try {
                    const readReceipts: ChatMessage[] = JSON.parse(message.body);

                    setMessages((prev) =>
                        prev.map((msg) => {
                            const updated = readReceipts.find((r) => r.id === msg.id);
                            return updated ? { ...msg, status: 'READ' } : msg;
                        })
                    );
                } catch (error) {
                    console.error('Error parsing read receipt:', error);
                }
            });

            stompClient.subscribe(`/user/queue/messages`, (message) => {
                try {
                    const notification = JSON.parse(message.body);
                    console.log('New message notification:', notification);
                } catch (error) {
                    console.error('Error parsing personal message:', error);
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

    const fetchMessages = async (chatRoomId: number) => {
        try {
            const response = await auth.fetchWithAuth(
                `/api/chat/messages/${chatRoomId}`
            );
            if (response.ok) {
                const data: ChatMessage[] = await response.json();
                data.sort(
                    (a, b) =>
                        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                );
                setMessages(data);

                const unreadMessages = data.filter(
                    (msg) => msg.senderId !== currentUser?.id && msg.status === "SENT"
                );
                if (unreadMessages.length > 0) {
                    markMessagesAsRead(chatRoomId);
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
        if (!newMessage.trim() || !chatRoom || sending) return;

        setSending(true);
        try {
            if (stompClientRef.current?.connected) {
                stompClientRef.current.publish({
                    destination: '/app/chat.send',
                    body: JSON.stringify({
                        chatRoomId: chatRoom.id,
                        content: newMessage.trim(), // 🔹 normalized to "content"
                        contentType: 'TEXT',
                    }),
                });
                setNewMessage('');
            } else {
                toast({
                    title: 'Connecting...',
                    description: 'Reconnecting to chat. Please try again in a moment.',
                });
                if (stompClientRef.current && !stompClientRef.current.active) {
                    stompClientRef.current.activate();
                }
                throw new Error('WebSocket not connected');
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
            console.log(messages)
        }
    };

    const markMessagesAsRead = async (chatRoomId: number) => {
        try {
            await auth.fetchWithAuth(`/api/chat/messages/${chatRoomId}/read`, {
                method: 'PATCH',
            });
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };

    const scrollToBottom = () => {
        if (scrollAreaRef.current) {
            const scrollElement =
                scrollAreaRef.current.querySelector(
                    '[data-radix-scroll-area-viewport]'
                );
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
                hour12: true,
            });
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            });
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    useEffect(() => {
        if (!chatRoom) return;
        const onFocus = () => {
            const hasUnread = messages.some(
                (m) => m.senderId !== currentUser?.id && m.status == "SENT"
            );
            if (hasUnread) {
                markMessagesAsRead(chatRoom.id);
            }
        };
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [chatRoom, messages, currentUser?.id]);

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
                if (!message.content) return null
                const isOwnMessage = (currentUser?.id != null && message.senderId === currentUser.id);
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-3 py-2 ${
                        isOwnMessage
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 ${
                        isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        <span className="text-xs">
                          {formatTimestamp(message.createdAt)}
                        </span>
                        {/*  note if own message only then show single/double tick as tick for other user is not visible
                        show double when other user has red your message
                        */}
                        {isOwnMessage && (
                          <div>
                            {message.status == 'READ' ? (
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
