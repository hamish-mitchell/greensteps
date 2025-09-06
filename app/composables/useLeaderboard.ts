/**
 * Leaderboard Composable - User Ranking System
 * 
 * Manages leaderboard data fetching and display functionality.
 * Handles user rankings, points, and friend comparisons.
 * 
 * Author: Hamish Mitchell
 * Date: 11/08/2025
 */
export interface LeaderboardEntry {
  id: string
  display_name: string
  avatar_url: string | null
  total_points: number
  rank: number
  you: boolean
  friend?: boolean
}

export type LeaderboardScope = 'friends' | 'global'

export function useLeaderboard(initialScope: LeaderboardScope = 'global') {
  const user = useSupabaseUser()
  const scope = ref<LeaderboardScope>(initialScope)
  const entries = ref<LeaderboardEntry[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function load() {
    if (!user.value) return
    loading.value = true
    error.value = null
    try {
      const res = await $fetch<{ scope: string; entries: LeaderboardEntry[] }>(`/api/leaderboard?scope=${scope.value}`)
      entries.value = res.entries
    } catch (e: any) {
      error.value = e.message || 'Failed to load leaderboard'
    } finally {
      loading.value = false
    }
  }

  function setScope(s: LeaderboardScope) {
    if (scope.value !== s) {
      scope.value = s
    }
    load()
  }

  watch(() => user.value?.id, (id) => { if (id) load() }, { immediate: true })
  watch(scope, () => { load() })

  return { scope, entries, loading, error, setScope, reload: load }
}
