import express from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

const settingsSchema = z.object({
  quietHoursStart: z.string().nullable().optional(),
  quietHoursEnd: z.string().nullable().optional(),
  reminderPrefs: z.any().optional(),
  notificationsEnabled: z.boolean().optional(),
});

router.use(authenticate);

// Get user settings
router.get('/', async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: {
        id: true,
        name: true,
        email: true,
        quietHoursStart: true,
        quietHoursEnd: true,
        reminderPrefs: true
      }
    });
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user settings
router.put('/', async (req: AuthRequest, res) => {
  try {
    const settings = settingsSchema.parse(req.body);
    
    const updatedUser = await prisma.user.update({
      where: { id: req.userId! },
      data: settings,
      select: {
        id: true,
        name: true,
        email: true,
        quietHoursStart: true,
        quietHoursEnd: true,
        reminderPrefs: true
      }
    });
    
    res.json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
