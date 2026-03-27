import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdminClient = SupabaseClient<any, "public", any>;

export function createAdminClient(): AdminClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Lazy singleton - avoids calling createClient at module load time
let _admin: AdminClient | null = null;

function getAdmin(): AdminClient {
  if (!_admin) {
    _admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _admin;
}

// Export as a getter so `supabaseAdmin.from(...)` works directly
export const supabaseAdmin = new Proxy({} as AdminClient, {
  get(_target, prop) {
    return (getAdmin() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
