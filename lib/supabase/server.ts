import { createServerClient } from "@supabase/ssr";
import { createClient as createRawClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { appEnv, hasSupabaseEnv as hasSupabaseEnvInternal } from "@/lib/env";

export function hasSupabaseEnv() {
  return hasSupabaseEnvInternal();
}

export async function createClient() {
  if (!hasSupabaseEnvInternal()) {
    throw new Error(
      "Supabase env vars chưa được cấu hình (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY).",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(
    appEnv.supabaseUrl,
    appEnv.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — ignore if Proxy is refreshing sessions.
          }
        },
      },
    },
  );
}

// Phiên bản không ném lỗi khi thiếu env — dùng cho layout/query guards.
export async function createClientOrNull() {
  if (!hasSupabaseEnvInternal()) return null;
  return createClient();
}

export async function createServiceRoleClient() {
  const key = appEnv.supabaseServiceRoleKey;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  // Must use createClient (not createServerClient) so the service role key is used
  // as the Authorization header — createServerClient would override it with the
  // user's session cookie, keeping RLS active.
  return createRawClient(appEnv.supabaseUrl, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
