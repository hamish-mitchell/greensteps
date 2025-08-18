<template>
  <aside class="flex w-64 flex-col bg-card p-4 flex-shrink-0 border-r">
    <div class="flex items-center gap-3 px-4 py-5">
      <span class="text-xl font-bold">{{ title }}</span>
    </div>
    <div class="flex-grow">
      <span class="px-4 text-xs font-semibold text-muted-foreground/70">{{ menuTitle }}</span>
      <nav class="mt-2 space-y-1.5">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.href"
          :to="link.href"
          class="group flex items-center gap-3 rounded-lg px-4 py-2.5"
          :class="[link.isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent']"
        >
          <component :is="icons[link.icon]" class="h-5 w-5" :class="[link.isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-accent-foreground']" />
          <span class="text-sm font-medium" :class="[link.isActive ? 'font-semibold' : 'text-muted-foreground group-hover:text-accent-foreground']">{{ link.label }}</span>
          <span v-if="link.badge" class="ml-auto rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">{{ link.badge }}</span>
        </NuxtLink>
      </nav>
    </div>
    <div v-if="rewardsCard" class="p-2">
      <div class="rounded-lg bg-secondary p-5 text-center text-secondary-foreground relative">
        <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <component :is="icons[rewardsCard.icon]" class="h-6 w-6" />
        </div>
        <h4 class="font-semibold">{{ rewardsCard.title }}</h4>
        <p class="mt-1 text-xs text-muted-foreground">{{ rewardsCard.description }}</p>
        <Button class="mt-4 w-full">{{ rewardsCard.buttonText }}</Button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import * as icons from 'lucide-vue-next'

defineProps({
  title: String,
  menuTitle: String,
  navLinks: Array,
  rewardsCard: Object,
})
</script>