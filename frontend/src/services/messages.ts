// Messages Service - Frontend

import api from './api';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message_at: string;
  last_message_content: string;
  unread_count: number;
  created_at: string;
  other_participant?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export const messagesService = {
  async getConversations(): Promise<Conversation[]> {
    const response = await api.get<Conversation[]>('/messages/conversations');
    return response.data;
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    const response = await api.get<Message[]>(`/messages/conversations/${conversationId}`);
    return response.data;
  },

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    const response = await api.post<Message>(`/messages/conversations/${conversationId}`, { content });
    return response.data;
  },

  async createConversation(participantId: string): Promise<Conversation> {
    const response = await api.post<Conversation>('/messages/conversations', { participantId });
    return response.data;
  },

  async markAsRead(conversationId: string): Promise<void> {
    await api.patch(`/messages/conversations/${conversationId}/read`);
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get<{ unreadCount: number }>('/messages/unread-count');
    return response.data.unreadCount;
  }
};

export default messagesService;