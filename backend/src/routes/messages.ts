// Messages Routes
// All protected routes require authentication

import { Router, Response } from 'express';
import { messagesService } from '../services/messages';
import { authenticateToken, type AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/messages/conversations - Protected - Get user's conversations
router.get('/conversations', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const conversations = await messagesService.getConversations(req.user!.userId);
    res.json(conversations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/messages/conversations/:conversationId - Protected - Get messages in a conversation
router.get('/conversations/:conversationId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const messages = await messagesService.getMessages(req.params.conversationId, req.user!.userId);
    res.json(messages);
  } catch (error: any) {
    if (error.message === 'Conversation not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// POST /api/messages/conversations - Protected - Start a new conversation
router.post('/conversations', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { participantId } = req.body;
    
    if (!participantId) {
      res.status(400).json({ error: 'Participant ID is required' });
      return;
    }
    
    const conversation = await messagesService.createConversation(
      req.user!.userId,
      participantId
    );
    res.status(201).json(conversation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/messages/conversations/:conversationId - Protected - Send a message
router.post('/conversations/:conversationId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim() === '') {
      res.status(400).json({ error: 'Message content is required' });
      return;
    }
    
    const message = await messagesService.sendMessage(
      req.params.conversationId,
      req.user!.userId,
      content.trim()
    );
    res.status(201).json(message);
  } catch (error: any) {
    if (error.message === 'Conversation not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// PATCH /api/messages/conversations/:conversationId/read - Protected - Mark messages as read
router.patch('/conversations/:conversationId/read', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await messagesService.markAsRead(req.params.conversationId, req.user!.userId);
    res.json({ message: 'Messages marked as read' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/messages/unread-count - Protected - Get unread message count
router.get('/unread-count', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const count = await messagesService.getUnreadCount(req.user!.userId);
    res.json({ unreadCount: count });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;