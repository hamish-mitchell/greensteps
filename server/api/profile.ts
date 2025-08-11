// import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (_event) => {
    const config = useRuntimeConfig();
    console.log("Config values:", {
        url: config.public.SUPABASE_URL,
        key: config.public.SUPABASE_ANON_KEY,
    });
});
