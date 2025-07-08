"use client";

import TestSupabase from "@/components/test-supabase";

export default function DebugPage() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
      <TestSupabase />
    </div>
  );
}
