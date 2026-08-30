import express from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

const eventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  date: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  location: z.string().optional(),
  category: z.enum(['DATE', 'FOOD', 'MOVIE', 'TRIP', 'BIRTHDAY', 'ANNIVERSARY', 'SHOPPING', 'IMPORTANT', 'CUSTOM']).default('CUSTOM'),
  icon: z.string().default('calendar'),
  emoji: z.string().optional(),
  isImportant: z.boolean().default(false),
  notes: z.string().optional(),
  status: z.enum(['IDEA', 'PROPOSED', 'AWAITING_AGREEMENT', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).default('IDEA')
});

router.use(authenticate);

// Get all events
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { status, from, to } = req.query;
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from as string);
      if (to) where.date.lte = new Date(to as string);
    }
    
    const events = await prisma.event.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });
    
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create event
router.post('/', async (req: AuthRequest, res) => {
  try {
    const eventData = eventSchema.parse(req.body);
    
    const event = await prisma.event.create({
      data: {
        ...eventData,
        createdById: req.userId!
      }
    });
    
    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          userId: req.userId!,
          eventId: event.id,
          action: 'CREATED_EVENT',
          details: {
            title: event.title,
            date: event.date,
            category: event.category
          }
        }
      });
    } catch (logError) {
      console.error('Error logging activity:', logError);
    }
    
    // Create notification for other user
    try {
      const users = await prisma.user.findMany({
        where: { id: { not: req.userId! } },
        take: 1
      });
      
      if (users[0]) {
        await prisma.notification.create({
          data: {
            userId: users[0].id,
            type: 'NEW_EVENT',
            title: 'New Plan Created',
            message: `${req.user?.name} created "${event.title}"`,
            eventId: event.id
          }
        });
      }
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
    }
    
    res.status(201).json(event);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single event
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete event - with proper cascade handling
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const eventId = req.params.id;
    
    console.log('Attempting to delete event:', eventId);
    
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Delete related records first
    try {
      // Delete notifications for this event
      await prisma.notification.deleteMany({
        where: { eventId: eventId }
      });
    } catch (e) {
      console.log('No notifications to delete or error:', e);
    }
    
    try {
      // Delete activity logs for this event
      await prisma.activityLog.deleteMany({
        where: { eventId: eventId }
      });
    } catch (e) {
      console.log('No activity logs to delete or error:', e);
    }
    
    try {
      // Delete agreements for this event
      await prisma.agreement.deleteMany({
        where: { eventId: eventId }
      });
    } catch (e) {
      console.log('No agreements to delete or error:', e);
    }
    
    try {
      // Delete reminder configs for this event
      await prisma.reminderConfig.deleteMany({
        where: { eventId: eventId }
      });
    } catch (e) {
      console.log('No reminders to delete or error:', e);
    }
    
    // Now delete the event itself
    await prisma.event.delete({
      where: { id: eventId }
    });
    
    console.log('Event deleted successfully');
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ 
      message: 'Failed to delete event',
      detail: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Confirm event
router.post('/:id/confirm', async (req: AuthRequest, res) => {
  try {
    const eventId = req.params.id;
    
    const confirmedEvent = await prisma.event.update({
      where: { id: eventId },
      data: { status: 'CONFIRMED' }
    });
    
    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          userId: req.userId!,
          eventId: eventId,
          action: 'CONFIRMED_EVENT',
          details: {
            title: confirmedEvent.title
          }
        }
      });
    } catch (logError) {
      console.error('Error logging activity:', logError);
    }
    
    res.json(confirmedEvent);
  } catch (error) {
    console.error('Error confirming event:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
