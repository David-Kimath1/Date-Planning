-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('IDEA', 'PROPOSED', 'AWAITING_AGREEMENT', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "VenueStatus" AS ENUM ('PROPOSED', 'AGREED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SuggestionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COUNTER_PROPOSED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NEW_VENUE_SUGGESTION', 'NEW_PLAN_SUGGESTION', 'VENUE_AGREED', 'VENUE_REJECTED', 'SUGGESTION_ACCEPTED', 'SUGGESTION_REJECTED', 'COUNTER_PROPOSAL', 'NEW_EVENT', 'EVENT_UPDATED', 'EVENT_CANCELLED', 'PLAN_CONFIRMED', 'REMINDER', 'CUSTOM_REMINDER');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('DATE', 'FOOD', 'MOVIE', 'TRIP', 'BIRTHDAY', 'ANNIVERSARY', 'SHOPPING', 'IMPORTANT', 'CUSTOM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "quietHoursStart" TEXT,
    "quietHoursEnd" TEXT,
    "reminderPrefs" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "keys" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "location" TEXT,
    "category" "Category" NOT NULL DEFAULT 'CUSTOM',
    "icon" TEXT NOT NULL DEFAULT 'calendar',
    "emoji" TEXT,
    "status" "EventStatus" NOT NULL DEFAULT 'IDEA',
    "isImportant" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venue" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "website" TEXT,
    "category" "Category" NOT NULL DEFAULT 'CUSTOM',
    "icon" TEXT NOT NULL DEFAULT 'map-pin',
    "emoji" TEXT,
    "notes" TEXT,
    "suggestedById" TEXT NOT NULL,
    "eventId" TEXT,
    "status" "VenueStatus" NOT NULL DEFAULT 'PROPOSED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Suggestion" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "proposedDate" TIMESTAMP(3),
    "proposedTime" TEXT,
    "eventId" TEXT,
    "createdById" TEXT NOT NULL,
    "respondedById" TEXT,
    "status" "SuggestionStatus" NOT NULL DEFAULT 'PENDING',
    "response" TEXT,
    "venueId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Suggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agreement" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "agreedByDave" BOOLEAN NOT NULL DEFAULT false,
    "agreedByLJ" BOOLEAN NOT NULL DEFAULT false,
    "agreedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "eventId" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "deliveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "eventId" TEXT,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReminderConfig" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "monthsBefore" INTEGER,
    "weeksBefore" INTEGER,
    "daysBefore" INTEGER,
    "hoursBefore" INTEGER,
    "minutesBefore" INTEGER,
    "customMessage" TEXT,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReminderConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountdownConfig" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "showYears" BOOLEAN NOT NULL DEFAULT true,
    "showMonths" BOOLEAN NOT NULL DEFAULT true,
    "showDays" BOOLEAN NOT NULL DEFAULT true,
    "showHours" BOOLEAN NOT NULL DEFAULT true,
    "showMinutes" BOOLEAN NOT NULL DEFAULT true,
    "showSeconds" BOOLEAN NOT NULL DEFAULT true,
    "preset" TEXT DEFAULT 'full',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CountdownConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");

-- CreateIndex
CREATE INDEX "Event_date_idx" ON "Event"("date");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");

-- CreateIndex
CREATE INDEX "Event_createdById_idx" ON "Event"("createdById");

-- CreateIndex
CREATE INDEX "Venue_suggestedById_idx" ON "Venue"("suggestedById");

-- CreateIndex
CREATE INDEX "Venue_eventId_idx" ON "Venue"("eventId");

-- CreateIndex
CREATE INDEX "Suggestion_createdById_idx" ON "Suggestion"("createdById");

-- CreateIndex
CREATE INDEX "Suggestion_status_idx" ON "Suggestion"("status");

-- CreateIndex
CREATE INDEX "Suggestion_eventId_idx" ON "Suggestion"("eventId");

-- CreateIndex
CREATE INDEX "Agreement_eventId_idx" ON "Agreement"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Agreement_eventId_venueId_key" ON "Agreement"("eventId", "venueId");

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_eventId_idx" ON "ActivityLog"("eventId");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");

-- CreateIndex
CREATE INDEX "ReminderConfig_eventId_idx" ON "ReminderConfig"("eventId");

-- CreateIndex
CREATE INDEX "ReminderConfig_userId_idx" ON "ReminderConfig"("userId");

-- CreateIndex
CREATE INDEX "ReminderConfig_sent_idx" ON "ReminderConfig"("sent");

-- CreateIndex
CREATE UNIQUE INDEX "ReminderConfig_eventId_userId_key" ON "ReminderConfig"("eventId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "CountdownConfig_eventId_key" ON "CountdownConfig"("eventId");

-- CreateIndex
CREATE INDEX "CountdownConfig_eventId_idx" ON "CountdownConfig"("eventId");

-- CreateIndex
CREATE INDEX "CountdownConfig_userId_idx" ON "CountdownConfig"("userId");

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venue" ADD CONSTRAINT "Venue_suggestedById_fkey" FOREIGN KEY ("suggestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venue" ADD CONSTRAINT "Venue_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suggestion" ADD CONSTRAINT "Suggestion_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suggestion" ADD CONSTRAINT "Suggestion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suggestion" ADD CONSTRAINT "Suggestion_respondedById_fkey" FOREIGN KEY ("respondedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suggestion" ADD CONSTRAINT "Suggestion_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agreement" ADD CONSTRAINT "Agreement_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agreement" ADD CONSTRAINT "Agreement_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReminderConfig" ADD CONSTRAINT "ReminderConfig_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReminderConfig" ADD CONSTRAINT "ReminderConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountdownConfig" ADD CONSTRAINT "CountdownConfig_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountdownConfig" ADD CONSTRAINT "CountdownConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
