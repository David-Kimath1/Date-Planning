import express from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';
import { createNotification, logActivity, getOtherUser } from '../utils/helpers';

const router = express.Router();

const suggestionSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  proposedDate: z.string().datetime().optional(),
  proposedTime: z.string().optional(),
  eventId: z.string().optional(),
  venueId: z.string().optional(),
});

router.use(authenticate);

// Get all suggestions
router.get('/', async (req: AuthRequest, res) => {
  try {
    const suggestions = await prisma.suggestion.findMany({
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        respondedBy: {
          select: { id: true, name: true, email: true }
        },
        venue: true,
        event: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create suggestion
router.post('/', async (req: AuthRequest, res) => {
  try {
    const suggestionData = suggestionSchema.parse(req.body);
    
    const suggestion = await prisma.suggestion.create({
      data: {
        ...suggestionData,
        createdById: req.userId!
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    await logActivity(prisma, req.userId!, suggestion.eventId || undefined, 'CREATED_SUGGESTION', {
      title: suggestion.title
    });
    
    const otherUser = await getOtherUser(prisma, req.userId!);
    if (otherUser) {
      await createNotification(
        prisma,
        otherUser.id,
        'NEW_PLAN_SUGGESTION',
        'New Suggestion',
        `${req.user?.name} suggested "${suggestion.title}"`,
        suggestion.eventId || undefined
      );
    }
    
    res.status(201).json(suggestion);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    console.error('Error creating suggestion:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Respond to suggestion
router.post('/:id/respond', async (req: AuthRequest, res) => {
  try {
    const { response, status } = req.body;
    const suggestionId = req.params.id;
    
    const suggestion = await prisma.suggestion.findUnique({
      where: { id: suggestionId }
    });
    
    if (!suggestion) {
      return res.status(404).json({ message: 'Suggestion not found' });
    }
    
    const updatedSuggestion = await prisma.suggestion.update({
      where: { id: suggestionId },
      data: {
        response,
        status,
        respondedById: req.userId!
      }
    });
    
    await logActivity(prisma, req.userId!, suggestion.eventId || undefined, `SUGGESTION_${status}`, {
      title: suggestion.title
    });
    
    const otherUser = await getOtherUser(prisma, req.userId!);
    if (otherUser) {
      await createNotification(
        prisma,
        otherUser.id,
        status === 'ACCEPTED' ? 'SUGGESTION_ACCEPTED' : 'SUGGESTION_REJECTED',
        `Suggestion ${status.toLowerCase()}`,
        `${req.user?.name} ${status.toLowerCase()} "${suggestion.title}"`,
        suggestion.eventId || undefined
      );
    }
    
    res.json(updatedSuggestion);
  } catch (error) {
    console.error('Error responding to suggestion:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
