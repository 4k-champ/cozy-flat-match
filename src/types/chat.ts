export interface ChatMessage {
  id: number;
  chatRoomId: number;
  senderId: number;
  receiverId: number;
  senderEmail: string;
  receiverEmail: string;
  message: string;
  read: boolean;
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
  receiverId: number;
  message: string;
}