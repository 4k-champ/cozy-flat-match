export interface ChatMessage {
  id: number;
  flatId: number;
  senderEmail: string;
  receiverEmail: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface SendMessageRequest {
  receiverEmail: string;
  message: string;
}