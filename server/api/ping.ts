import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (_event) => {
    const config = useRuntimeConfig();
    const supabase = createClient(
        config.public.SUPABASE_URL,
        config.public.SUPABASE_ANON_KEY
    );
    // Try to fetch from a system table (should always exist)
    const { error } = await supabase
        .from("pg_tables")
        .select("tablename")
        .limit(1);
    if (error) {
        return { ok: false, error: error.message };
    }
    return { ok: true };
});
