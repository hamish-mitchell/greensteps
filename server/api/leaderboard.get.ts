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

  // Collect profile ids based on scope
  let profiles: RawProfile[] = []
  if (scope === 'friends') {
    const { data: fr, error: frErr } = await supabase
      .from('friendships')
      .select('friend_id')
      .eq('user_id', supabaseUser.id)
    if (frErr) throw createError({ statusCode: 500, statusMessage: frErr.message })
    const friendIds: string[] = (fr || []).map((r: any) => r.friend_id).filter(Boolean)
    if (!friendIds.includes(supabaseUser.id)) friendIds.push(supabaseUser.id)
    if (friendIds.length) {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, total_points, avatar_url, display_name, is_private')
        .in('id', friendIds)
      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      profiles = (data as any[]).filter(p => !p.is_private || p.id === supabaseUser.id)
    }
  } else { // global
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
    you: profile.id === supabaseUser.id
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
