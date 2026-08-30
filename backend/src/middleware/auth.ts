import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';

export interface AuthRequest extends Request {
  user?: any;
  userId?: string;
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        quietHoursStart: true,
        quietHoursEnd: true,
        reminderPrefs: true
      }
    });
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function authorizeDaveOrLJ(req: AuthRequest, res: Response, next: NextFunction) {
  const allowedEmails = [process.env.DAVE_EMAIL, process.env.LJ_EMAIL];
  
  if (!req.user || !allowedEmails.includes(req.user.email)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  next();
}