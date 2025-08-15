
<script setup lang="ts">
const user = useSupabaseUser()
watch(user, () => {
  if (user.value) {
    return navigateTo('/')
  }
}, { immediate: true })
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-8">
    <div class="bg-white dark:bg-zinc-900 rounded-xl shadow-md p-8 max-w-md w-full text-center">
      <h2 class="text-2xl font-bold mb-4">Sign up successful!</h2>
      <p class="mb-2">Please check your email and confirm your address to activate your account.</p>
      <p class="text-muted-foreground text-sm mb-4">Once confirmed, you will be automatically redirected.</p>
      <NuxtLink to="/login" class="underline text-emerald-600">Back to login</NuxtLink>
    </div>
  </div>
</template>
