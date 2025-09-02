// Server API endpoint to provide leaderboard data with display names from auth.users
// Scope: global | friends
// Returns: { entries: { id, display_name, avatar_url, total_points, rank, you }[] }
import { defineEventHandler, getQuery, createError } from 'h3'
// Nuxt Supabase server helper
// eslint-disable-next-line import/no-unresolved
import { serverSupabaseClient } from '#supabase/server'

interface RawProfile {
  id: string
  total_points: number | null
  avatar_url: string | null
  display_name: string | null
  is_private?: boolean | null
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const scope = (query.scope as 'friends' | 'global') || 'global'

  // Need authenticated user for friends scope (and to highlight "you")
  const supabaseUser = await requireUser(event)
  const supabase = await serverSupabaseClient(event)

  // Collect friend IDs using new schema (user_a, user_b)
  interface FriendshipRow { user_a: string; user_b: string }
  const { data: frRows, error: frErr } = await supabase
    .from('friendships')
    .select('user_a, user_b')
    .or(`user_a.eq.${supabaseUser.id},user_b.eq.${supabaseUser.id}`)
  if (frErr) throw createError({ statusCode: 500, statusMessage: frErr.message })
  const friendIds = new Set<string>()
  for (const row of (frRows as FriendshipRow[] | null) || []) {
    if (row.user_a === supabaseUser.id && row.user_b) friendIds.add(row.user_b)
    else if (row.user_b === supabaseUser.id && row.user_a) friendIds.add(row.user_a)
  }

  let profiles: RawProfile[] = []
  if (scope === 'friends') {
    // Always include self
    const ids = Array.from(friendIds)
    ids.push(supabaseUser.id)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, total_points, avatar_url, display_name, is_private')
      .in('id', ids)
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    profiles = (data as any[]).filter(p => !p.is_private || p.id === supabaseUser.id)
  } else {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, total_points, avatar_url, display_name, is_private')
      .order('total_points', { ascending: false })
      .limit(50)
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    profiles = (data as any[]).filter(p => !p.is_private || p.id === supabaseUser.id)
  }

  // Sort (friends scope may not have been ordered yet)
  profiles.sort((a, b) => (b.total_points || 0) - (a.total_points || 0))

  // Map directly using profiles.display_name
  const entries = profiles.map((profile, index) => ({
    id: profile.id,
    display_name: profile.display_name || 'Anon',
    avatar_url: profile.avatar_url || null,
    total_points: profile.total_points || 0,
    rank: index + 1,
    you: profile.id === supabaseUser.id,
    friend: friendIds.has(profile.id) && profile.id !== supabaseUser.id
  }))

  return { scope, entries }
})

// Small helper to require an authenticated user
async function requireUser(event: any) {
  const supabase = await serverSupabaseClient(event)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  return user
}
