#!/bin/bash

echo "Checking backend files..."
echo ""

files=(
  "src/index.ts"
  "src/websocket.ts"
  "src/middleware/auth.ts"
  "src/routes/auth.ts"
  "src/routes/events.ts"
  "src/routes/venues.ts"
  "src/routes/suggestions.ts"
  "src/routes/notifications.ts"
  "src/routes/activity.ts"
  "src/routes/settings.ts"
  "src/utils/helpers.ts"
  "src/utils/initializeUsers.ts"
  "prisma/schema.prisma"
  ".env"
  "package.json"
  "tsconfig.json"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✓ $file"
  else
    echo "✗ $file (MISSING)"
  fi
done

echo ""
echo "Checking frontend files..."
echo ""

frontend_files=(
  "../frontend/src/App.tsx"
  "../frontend/src/main.tsx"
  "../frontend/src/index.css"
  "../frontend/src/store/authStore.ts"
  "../frontend/src/components/layout/AppLayout.tsx"
  "../frontend/src/pages/Login.tsx"
  "../frontend/src/pages/Home.tsx"
  "../frontend/src/pages/Calendar.tsx"
  "../frontend/src/pages/Plans.tsx"
  "../frontend/src/pages/Dave.tsx"
  "../frontend/src/pages/LJ.tsx"
  "../frontend/src/pages/Notifications.tsx"
  "../frontend/src/pages/Activity.tsx"
  "../frontend/src/pages/Settings.tsx"
  "../frontend/src/components/countdown/Countdown.tsx"
  "../frontend/src/components/events/EventDetailsModal.tsx"
  "../frontend/src/components/plans/CreatePlanModal.tsx"
  "../frontend/src/components/plans/VenueAgreementModal.tsx"
  "../frontend/src/components/venues/AddVenueModal.tsx"
  "../frontend/package.json"
  "../frontend/vite.config.ts"
  "../frontend/index.html"
)

for file in "${frontend_files[@]}"; do
  if [ -f "$file" ]; then
    echo "✓ $file"
  else
    echo "✗ $file (MISSING)"
  fi
done
