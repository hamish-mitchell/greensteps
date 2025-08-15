
<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
</script>

<template>
	<div class="p-8">
		<h1 class="text-2xl font-bold mb-4">Welcome to Greensteps!</h1>
		<div v-if="user">
			<p class="mb-2">Signed in as: <span class="font-mono">{{ user.email }}</span></p>
			<p v-if="user.user_metadata && user.user_metadata.display_name">Display Name: <span class="font-mono">{{ user.user_metadata.display_name }}</span></p>
			<p>User ID: <span class="font-mono">{{ user.id }}</span></p>
		</div>
		<div v-else>
			<p>You are not signed in.</p>
		</div>
	</div>
</template>
