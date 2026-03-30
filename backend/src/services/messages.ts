// Messages Service

import { query } from '../db/index';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: Date;
}

export interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message_at: Date;
  last_message_content: string;
  unread_count: number;
  created_at: Date;
}

export const messagesService = {
  async getConversations(userId: string): Promise<Conversation[]> {
    const result = await query(
      `SELECT c.*, 
              (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_content,
              (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND recipient_id = $1 AND is_read = FALSE) as unread_count
       FROM conversations c
       WHERE c.participant1_id = $1 OR c.participant2_id = $1
       ORDER BY last_message_at DESC`,
      [userId]
    );
    return result.rows;
  },

  async getMessages(conversationId: string, userId: string): Promise<Message[]> {
    // Verify user is part of conversation
    const conv = await query(
      'SELECT * FROM conversations WHERE id = $1 AND (participant1_id = $2 OR participant2_id = $2)',
      [conversationId, userId]
    );

    if (conv.rows.length === 0) {
      throw new Error('Conversation not found');
    }

    const result = await query(
      'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [conversationId]
    );
    return result.rows;
  },

  async sendMessage(conversationId: string, senderId: string, content: string): Promise<Message> {
    // Get conversation details
    const conv = await query(
      'SELECT * FROM conversations WHERE id = $1',
      [conversationId]
    );

    if (conv.rows.length === 0) {
      throw new Error('Conversation not found');
    }

    const conversation = conv.rows[0];
    const recipientId = conversation.participant1_id === senderId 
      ? conversation.participant2_id 
      : conversation.participant1_id;

    const result = await query(
      `INSERT INTO messages (conversation_id, sender_id, recipient_id, content)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [conversationId, senderId, recipientId, content]
    );

    // Update conversation last_message_at
    await query(
      'UPDATE conversations SET last_message_at = NOW() WHERE id = $1',
      [conversationId]
    );

    return result.rows[0];
  },

  async createConversation(participant1Id: string, participant2Id: string): Promise<Conversation> {
    // Check if conversation already exists
    const existing = await query(
      `SELECT * FROM conversations 
       WHERE (participant1_id = $1 AND participant2_id = $2) 
          OR (participant1_id = $2 AND participant2_id = $1)`,
      [participant1Id, participant2Id]
    );

    if (existing.rows.length > 0) {
      return existing.rows[0];
    }

    const result = await query(
      `INSERT INTO conversations (participant1_id, participant2_id, last_message_at)
       VALUES ($1, $2, NOW())
       RETURNING *`,
      [participant1Id, participant2Id]
    );

    return result.rows[0];
  },

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    await query(
      'UPDATE messages SET is_read = TRUE WHERE conversation_id = $1 AND recipient_id = $2 AND is_read = FALSE',
      [conversationId, userId]
    );
  },

  async getUnreadCount(userId: string): Promise<number> {
    const result = await query(
      'SELECT COUNT(*) as count FROM messages WHERE recipient_id = $1 AND is_read = FALSE',
      [userId]
    );
    return parseInt(result.rows[0].count, 10);
  }
};

export default messagesService;