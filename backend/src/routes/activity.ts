import express from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

// Get activity history
router.get('/', async (req: AuthRequest, res) => {
  try {
    const activities = await prisma.activityLog.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        event: {
          select: { id: true, title: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100
    });
    
    res.json(activities);
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Clear all activity - MUST be before any /:id routes
router.delete('/clear', async (req: AuthRequest, res) => {
  try {
    const result = await prisma.activityLog.deleteMany({});
    
    res.json({ 
      message: 'Activity cleared successfully',
      deletedCount: result.count
    });
  } catch (error) {
    console.error('Error clearing activity:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
