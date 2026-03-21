import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export function createSupabaseClient(req: Request) {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "https://pvwafgwpxhocyaeqykzj.supabase.co",
    Deno.env.get("SUPABASE_ANON_KEY") ??
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d2FmZ3dweGhvY3lhZXF5a3pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MzcyMTYsImV4cCI6MjA4OTQxMzIxNn0.nOYCdsLpgo69zND_z5W1_2rEUH8L39DbfOuHTsRig_I",
    {
      global: {
        headers: { Authorization: req.headers.get("Authorization")! },
      },
    },
  );
}

export function createServiceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "https://pvwafgwpxhocyaeqykzj.supabase.co",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d2FmZ3dweGhvY3lhZXF5a3pqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzgzNzIxNiwiZXhwIjoyMDg5NDEzMjE2fQ.k1EiqWIiiAFs-JgJzkgL11-fQXYa_CH3mG8IWb8a3AE",
  );
}
