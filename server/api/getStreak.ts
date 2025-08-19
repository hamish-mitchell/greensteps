import { createClient } from "@supabase/supabase-js";
import { setResponseStatus, getHeader } from "h3";

export default defineEventHandler(async (event) => {
    // Only allow POST
    if (event.node.req.method !== "POST") {
        setResponseStatus(event, 405);
        return { error: "Method Not Allowed" };
    }

    // Get env vars
    const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? "";
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        setResponseStatus(event, 500);
        return { error: "Missing Supabase environment variables" };
    }

    // Get Authorization header
    const authHeader = getHeader(event, "authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        setResponseStatus(event, 401);
        return { error: "Unauthorized" };
    }
    const token = authHeader.replace("Bearer ", "");

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false },
    });

    // Get user from token
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser(token);
    if (userError || !user) {
        setResponseStatus(event, 401);
        return { error: "Authentication Failed" };
    }

    // Fetch current_streak from profiles_duplicate
    const { data, error } = await supabase
        .from("profiles_duplicate")
        .select("current_streak")
        .eq("id", user.id)
        .single();

    if (error) {
        // Handle "no rows" error gracefully
        if (error.code === "PGRST116" || error.message?.includes("0 rows")) {
            return { current_streak: 0 };
        }
        setResponseStatus(event, 500);
        return { error: error.message };
    }

    return { current_streak: data?.current_streak ?? 0 };
});
