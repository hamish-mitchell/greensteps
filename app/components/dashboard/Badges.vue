<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-lg font-bold">{{ title }}</CardTitle>
    </CardHeader>
    <CardContent>
      <!-- DUMMY DATA: Badge data is passed via the 'badges' prop -->
      <div class="grid grid-cols-4 gap-4 text-center">
        <div
          v-for="(badge, index) in badges"
          :key="index"
          :title="badge.name"
        >
          <component
            :is="icons[badge.icon]"
            class="h-10 w-10 inline-block transition-opacity"
            :class="[badge.unlocked ? badge.color : 'text-muted-foreground/50', badge.unlocked ? 'opacity-100' : 'opacity-40']"
          />
          <p
            class="mt-1 text-xs font-medium"
            :class="{ 'text-muted-foreground': !badge.unlocked }"
          >
            {{ badge.name }}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import * as icons from 'lucide-vue-next'

defineProps({
  title: String,
  badges: {
    type: Array as () => Array<{ name: string; icon: string; color: string; unlocked: boolean }>,
    default: () => []
  }
})
</script>