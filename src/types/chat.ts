export interface ChatMessage {
  id: number;
  chatRoomId: number;
  senderId: number;
  senderName: string;
  content: string;
  contentType: string;
  status: string;
  createdAt: string;
}

export interface ChatRoom {
  id: number;
  flatId: number;
  ownerId: number;
  interestedUserId: number;
  createdAt: string;
}

export interface SendMessageRequest {
  receiverId: number | null;
  message: string;
}