#!/bin/bash

# Script untuk migrasi auth dari deprecated auth-helpers ke @supabase/ssr

echo "🔄 Memulai migrasi auth system..."

# Step 1: Install package baru
echo "📦 Installing @supabase/ssr..."
pnpm install @supabase/ssr

# Step 2: Remove package deprecated
echo "🗑️ Removing deprecated package..."
pnpm remove @supabase/auth-helpers-nextjs

# Step 3: Backup file lama
echo "💾 Backing up old files..."
cp lib/supabase/client.ts lib/supabase/client-backup.ts
cp lib/supabase/server.ts lib/supabase/server-backup.ts
cp components/auth/auth-provider.tsx components/auth/auth-provider-backup.tsx

# Step 4: Replace dengan file baru
echo "🔄 Replacing with new implementation..."
cp lib/supabase/client-new.ts lib/supabase/client.ts
cp lib/supabase/server-new.ts lib/supabase/server.ts
cp components/auth/auth-provider-new.tsx components/auth/auth-provider.tsx

# Step 5: Update imports
echo "📝 Updating import statements..."
find app/ -name "*.tsx" -exec sed -i 's/@supabase\/auth-helpers-nextjs/@supabase\/supabase-js/g' {} \;

# Step 6: Test build
echo "🧪 Testing build..."
pnpm run build

echo "✅ Migrasi selesai!"
echo "📚 Baca AUTH_ANALYSIS.md untuk detail lengkap"
