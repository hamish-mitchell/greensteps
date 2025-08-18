<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const streak = ref<number | null>(null)
const loadingStreak = ref(false)
const streakError = ref<string | null>(null)

async function fetchStreak() {
  if (!user.value) return
  loadingStreak.value = true
  streakError.value = null
  try {
    const result = await $fetch('/api/getStreak', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${await supabase.auth.getSession().then(r => r.data.session?.access_token ?? '')}`
      }
    }) as { error?: string; current_streak?: number }
    if ('error' in result) {
      streakError.value = result.error ?? null
      streak.value = null
    } else {
      streak.value = result.current_streak ?? null
    }
  } catch (e: any) {
    streakError.value = e.message
    streak.value = null
  } finally {
    loadingStreak.value = false
  }
}

watchEffect(() => {
  if (user.value) fetchStreak()
})
</script>

<template>
	<div class="p-8">
		<h1 class="text-2xl font-bold mb-4">Welcome to Greensteps!</h1>
		<div v-if="user">
			<p class="mb-2">Signed in as: <span class="font-mono">{{ user.email }}</span></p>
			<p v-if="user.user_metadata && user.user_metadata.display_name">Display Name: <span class="font-mono">{{ user.user_metadata.display_name }}</span></p>
			<p>User ID: <span class="font-mono">{{ user.id }}</span></p>
			<div class="mt-4">
				<p v-if="loadingStreak">Loading streak...</p>
				<p v-else-if="streakError" class="text-red-500">Error: {{ streakError }}</p>
				<p v-else>🔥 Current Streak: <span class="font-mono">{{ streak }}</span></p>
			</div>
		</div>
		<div v-else>
			<p>You are not signed in.</p>
		</div>
	</div>
</template>
