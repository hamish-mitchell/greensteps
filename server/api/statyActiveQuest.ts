import { createClient } from "@supabase/supabase-js";
import { setResponseStatus, getHeader, readBody } from "h3";

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== "POST") {
    setResponseStatus(event, 405);
    return { error: "Method Not Allowed" };
  }

  const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? "";
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    setResponseStatus(event, 500);
    return { error: "Missing Supabase environment variables" };
  }

  const authHeader = getHeader(event, "authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    setResponseStatus(event, 401);
    return { error: "Unauthorized" };
  }
  const token = authHeader.replace("Bearer ", "");

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);
  if (userError || !user) {
    setResponseStatus(event, 401);
    return { error: "Authentication Failed" };
  }

  const body = await readBody(event);
  const quest_id = body?.quest_id;
  if (!quest_id) {
    setResponseStatus(event, 400);
    return { error: "Missing quest_id" };
  }

  // Insert into active_quests
  const { error } = await supabase
    .from("active_quests")
    .insert([{
      user_id: user.id,
      quest_id: quest_id,
      date_started: new Date().toISOString(),
      progress: 0
    }]);

  if (error) {
    setResponseStatus(event, 500);
    return { error: error.message };
  }

  return { success: true };
});