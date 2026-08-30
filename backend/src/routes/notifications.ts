import express from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

// Get user notifications
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { read } = req.query;
    const where: any = {
      userId: req.userId!
    };
    
    if (read === 'true') {
      where.read = true;
    } else if (read === 'false') {
      where.read = false;
    }
    
    const notifications = await prisma.notification.findMany({
      where,
      include: {
        event: {
          select: { id: true, title: true, date: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark notification as read
router.put('/:id/read', async (req: AuthRequest, res) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true }
    });
    
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark all as read
router.put('/read-all', async (req: AuthRequest, res) => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.userId!,
        read: false
      },
      data: { read: true }
    });
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete notification
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    await prisma.notification.delete({
      where: { id: req.params.id }
    });
    
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
