import { createClient } from "@supabase/supabase-js";

function createSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 未配置");
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

const globalForSupabase = globalThis as unknown as {
  supabaseAdmin: ReturnType<typeof createSupabaseAdmin> | undefined;
};

// 服务端管理员 client（service_role key，绕过 RLS），仅在 API Route/Server 端使用
export const supabaseAdmin =
  globalForSupabase.supabaseAdmin ?? createSupabaseAdmin();

if (process.env.NODE_ENV !== "production") {
  globalForSupabase.supabaseAdmin = supabaseAdmin;
}

export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "product-images";
