# PowerShell script untuk migrasi auth system
Write-Host "🔄 Memulai migrasi auth system..." -ForegroundColor Green

# Step 1: Install package baru
Write-Host "📦 Installing @supabase/ssr..." -ForegroundColor Yellow
pnpm install @supabase/ssr

# Step 2: Remove package deprecated
Write-Host "🗑️ Removing deprecated package..." -ForegroundColor Yellow
pnpm remove @supabase/auth-helpers-nextjs

# Step 3: Backup file lama
Write-Host "💾 Backing up old files..." -ForegroundColor Yellow
Copy-Item "lib/supabase/client.ts" "lib/supabase/client-backup.ts"
Copy-Item "lib/supabase/server.ts" "lib/supabase/server-backup.ts"
Copy-Item "components/auth/auth-provider.tsx" "components/auth/auth-provider-backup.tsx"

# Step 4: Replace dengan file baru
Write-Host "🔄 Replacing with new implementation..." -ForegroundColor Yellow
Copy-Item "lib/supabase/client-new.ts" "lib/supabase/client.ts"
Copy-Item "lib/supabase/server-new.ts" "lib/supabase/server.ts"
Copy-Item "components/auth/auth-provider-new.tsx" "components/auth/auth-provider.tsx"

# Step 5: Update imports (manual karena PowerShell)
Write-Host "📝 Please manually update import statements in all files:" -ForegroundColor Yellow
Write-Host "FROM: import type { User } from '@supabase/auth-helpers-nextjs'" -ForegroundColor Red
Write-Host "TO:   import type { User } from '@supabase/supabase-js'" -ForegroundColor Green

# Step 6: Test build
Write-Host "🧪 Testing build..." -ForegroundColor Yellow
pnpm run build

Write-Host "✅ Migrasi selesai!" -ForegroundColor Green
Write-Host "📚 Baca AUTH_ANALYSIS.md untuk detail lengkap" -ForegroundColor Blue
