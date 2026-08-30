import { PrismaClient, NotificationType } from '@prisma/client';

export async function createNotification(
  prisma: PrismaClient,
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  eventId?: string
) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      eventId,
    },
  });
}

export async function logActivity(
  prisma: PrismaClient,
  userId: string,
  eventId: string | undefined | null,
  action: string,
  details?: any
) {
  const data: any = {
    userId,
    action,
    details: details || {},
  };
  
  if (eventId) {
    data.eventId = eventId;
  }
  
  return prisma.activityLog.create({
    data,
  });
}

export async function getOtherUser(prisma: PrismaClient, currentUserId: string) {
  const users = await prisma.user.findMany({
    where: {
      id: { not: currentUserId }
    },
    take: 1
  });
  return users[0];
}

export function calculateCountdown(targetDate: Date) {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  
  if (diff <= 0) {
    return {
      isPast: true,
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: Math.abs(diff) / 1000
    };
  }
  
  let years = 0;
  let months = 0;
  
  const tempDate = new Date(targetDate);
  const currentDate = new Date(now);
  
  while (addYears(currentDate, years + 1) <= tempDate) years++;
  
  const afterYears = addYears(currentDate, years);
  while (addMonths(afterYears, months + 1) <= tempDate) months++;
  
  const afterYearsAndMonths = addMonths(afterYears, months);
  const remainingMs = tempDate.getTime() - afterYearsAndMonths.getTime();
  
  const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
  
  return {
    isPast: false,
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    totalSeconds: diff / 1000
  };
}

function addYears(date: Date, years: number): Date {
  const newDate = new Date(date);
  newDate.setFullYear(newDate.getFullYear() + years);
  return newDate;
}

function addMonths(date: Date, months: number): Date {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
}

export function shouldDelayNotification(userSettings: any, notificationTime: Date = new Date()): boolean {
  if (!userSettings.quietHoursStart || !userSettings.quietHoursEnd) {
    return false;
  }
  
  const currentHour = notificationTime.getHours();
  const currentMinutes = notificationTime.getMinutes();
  
  const [startHour, startMinutes] = userSettings.quietHoursStart.split(':').map(Number);
  const [endHour, endMinutes] = userSettings.quietHoursEnd.split(':').map(Number);
  
  const currentTime = currentHour * 60 + currentMinutes;
  const quietStart = startHour * 60 + startMinutes;
  const quietEnd = endHour * 60 + endMinutes;
  
  if (quietStart <= quietEnd) {
    return currentTime >= quietStart && currentTime < quietEnd;
  } else {
    return currentTime >= quietStart || currentTime < quietEnd;
  }
}

export function getNextAvailableTime(userSettings: any): Date {
  if (!userSettings.quietHoursStart || !userSettings.quietHoursEnd) {
    return new Date();
  }
  
  const now = new Date();
  const [endHour, endMinutes] = userSettings.quietHoursEnd.split(':').map(Number);
  
  const nextAvailable = new Date(now);
  nextAvailable.setHours(endHour, endMinutes, 0, 0);
  
  const [startHour] = userSettings.quietHoursStart.split(':').map(Number);
  if (startHour > endHour && now.getHours() >= startHour) {
    nextAvailable.setDate(nextAvailable.getDate() + 1);
  }
  
  if (startHour <= endHour && now.getHours() < endHour) {
  } else if (startHour <= endHour && now.getHours() >= endHour) {
    return now;
  }
  
  return nextAvailable;
}
