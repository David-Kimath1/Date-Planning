import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

export function setupWebSocket(io: Server, prisma: PrismaClient) {
  // Authentication middleware
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, name: true, email: true }
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.data.user = user;
      socket.join(`user:${user.id}`);
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.user.id;
    console.log(`User connected: ${socket.data.user.name} (${userId})`);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Handle joining event rooms
    socket.on('join:event', (eventId: string) => {
      socket.join(`event:${eventId}`);
    });

    socket.on('leave:event', (eventId: string) => {
      socket.leave(`event:${eventId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.user.name}`);
    });
  });
}

// Helper function to emit notifications
export async function emitNotification(
  io: Server,
  userId: string,
  notification: any
) {
  io.to(`user:${userId}`).emit('notification', notification);
}

// Helper function to emit event updates
export async function emitEventUpdate(
  io: Server,
  eventId: string,
  update: any
) {
  io.to(`event:${eventId}`).emit('event:update', update);
}
