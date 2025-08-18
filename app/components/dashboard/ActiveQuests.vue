<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-lg font-bold">{{ title }}</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="space-y-5">
        <!-- DUMMY DATA: Quest data is passed via the 'quests' prop -->
        <div v-for="(quest, index) in quests" :key="index">
          <div class="mb-1 flex justify-between text-sm">
            <p class="font-medium">{{ quest.name }}</p>
            <p class="text-muted-foreground">{{ quest.status }}</p>
          </div>
          <Progress :model-value="quest.progress" />
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

defineProps({
  title: String,
  quests: {
    type: Array as () => Array<{ name: string; progress: number; status: string }>,
    default: () => []
  }
})
</script>