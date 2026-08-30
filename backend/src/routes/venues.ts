import express from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';
import { createNotification, logActivity, getOtherUser } from '../utils/helpers';

const router = express.Router();

const venueSchema = z.object({
  name: z.string().min(1).max(200),
  location: z.string().optional(),
  website: z.string().optional(),
  category: z.enum(['DATE', 'FOOD', 'MOVIE', 'TRIP', 'BIRTHDAY', 'ANNIVERSARY', 'SHOPPING', 'IMPORTANT', 'CUSTOM']).default('CUSTOM'),
  icon: z.string().default('map-pin'),
  emoji: z.string().optional(),
  notes: z.string().optional(),
  eventId: z.string().optional(),
});

router.use(authenticate);

// Get all venues
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { user: userFilter } = req.query;
    const where: any = {};
    
    if (userFilter === 'dave') {
      where.suggestedBy = { email: process.env.DAVE_EMAIL };
    } else if (userFilter === 'lj') {
      where.suggestedBy = { email: process.env.LJ_EMAIL };
    }
    
    const venues = await prisma.venue.findMany({
      where,
      include: {
        suggestedBy: {
          select: { id: true, name: true, email: true }
        },
        event: {
          select: { id: true, title: true, date: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json(venues);
  } catch (error) {
    console.error('Error fetching venues:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create venue
router.post('/', async (req: AuthRequest, res) => {
  try {
    const venueData = venueSchema.parse(req.body);
    
    const venue = await prisma.venue.create({
      data: {
        ...venueData,
        suggestedById: req.userId!
      },
      include: {
        suggestedBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    await logActivity(prisma, req.userId!, venue.eventId || undefined, 'CREATED_VENUE', {
      name: venue.name,
      location: venue.location
    });
    
    res.status(201).json(venue);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    console.error('Error creating venue:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Agree on venue
router.post('/:id/agree', async (req: AuthRequest, res) => {
  try {
    const venueId = req.params.id;
    
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
      include: { event: true }
    });
    
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    
    const updatedVenue = await prisma.venue.update({
      where: { id: venueId },
      data: { status: 'AGREED' }
    });
    
    if (venue.eventId) {
      const userEmail = req.user?.email;
      const isDave = userEmail === process.env.DAVE_EMAIL;
      
      const agreement = await prisma.agreement.upsert({
        where: {
          eventId_venueId: {
            eventId: venue.eventId,
            venueId: venueId
          }
        },
        update: {
          agreedByDave: isDave ? true : undefined,
          agreedByLJ: !isDave ? true : undefined,
        },
        create: {
          eventId: venue.eventId,
          venueId: venueId,
          agreedByDave: isDave,
          agreedByLJ: !isDave,
        }
      });
      
      if (agreement.agreedByDave && agreement.agreedByLJ) {
        await prisma.agreement.update({
          where: { id: agreement.id },
          data: { agreedAt: new Date() }
        });
        
        await prisma.event.update({
          where: { id: venue.eventId },
          data: { status: 'AWAITING_AGREEMENT' }
        });
      }
    }
    
    await logActivity(prisma, req.userId!, venue.eventId || undefined, 'AGREED_VENUE', {
      name: venue.name
    });
    
    res.json(updatedVenue);
  } catch (error) {
    console.error('Error agreeing on venue:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reject venue
router.post('/:id/reject', async (req: AuthRequest, res) => {
  try {
    const venueId = req.params.id;
    
    const venue = await prisma.venue.findUnique({
      where: { id: venueId }
    });
    
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    
    const updatedVenue = await prisma.venue.update({
      where: { id: venueId },
      data: { status: 'REJECTED' }
    });
    
    await logActivity(prisma, req.userId!, venue.eventId || undefined, 'REJECTED_VENUE', {
      name: venue.name
    });
    
    const otherUser = await getOtherUser(prisma, req.userId!);
    if (otherUser) {
      await createNotification(
        prisma,
        otherUser.id,
        'VENUE_REJECTED',
        'Venue Rejected',
        `${req.user?.name} rejected ${venue.name}`,
        venue.eventId || undefined
      );
    }
    
    res.json(updatedVenue);
  } catch (error) {
    console.error('Error rejecting venue:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete venue
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const venueId = req.params.id;
    
    const venue = await prisma.venue.findUnique({
      where: { id: venueId }
    });
    
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    
    await prisma.venue.delete({
      where: { id: venueId }
    });
    
    await logActivity(prisma, req.userId!, venue.eventId || undefined, 'DELETED_VENUE', {
      name: venue.name
    });
    
    res.json({ message: 'Venue deleted successfully' });
  } catch (error) {
    console.error('Error deleting venue:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
