<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Card from '~/components/ui/card/Card.vue'
import Button from '~/components/ui/button/Button.vue'
import Badge from '~/components/ui/badge/Badge.vue'

type PersonalizedTip = {
  title: string
  description: string
  category: string
  relevanceScore: number
  actionable: boolean
}

const user = useSupabaseUser()
const { generatePersonalizedTips, isLoading, error } = useAI()

const tips = ref<PersonalizedTip[]>([])
const hasLoadedTips = ref(false)

async function loadPersonalizedTips() {
  if (!user.value?.id || hasLoadedTips.value) return
  
  const personalizedTips = await generatePersonalizedTips(user.value.id)
  tips.value = personalizedTips.sort((a, b) => b.relevanceScore - a.relevanceScore)
  hasLoadedTips.value = true
}

async function refreshTips() {
  hasLoadedTips.value = false
  await loadPersonalizedTips()
}

onMounted(loadPersonalizedTips)
</script>

<template>
  <Card class="p-4 space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-medium flex items-center gap-2">
        🎯 Personalized Tips
      </h2>
      <Button 
        variant="ghost" 
        size="sm"
        @click="refreshTips"
        :disabled="isLoading"
      >
        {{ isLoading ? '🔄' : '↻' }}
      </Button>
    </div>
    
    <div v-if="error" class="text-sm text-red-600 p-2 bg-red-50 rounded">
      {{ error }}
    </div>
    
    <div v-if="isLoading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="animate-pulse">
        <div class="h-4 bg-muted rounded w-3/4 mb-2"></div>
        <div class="h-3 bg-muted rounded w-full mb-1"></div>
        <div class="h-3 bg-muted rounded w-5/6"></div>
      </div>
    </div>
    
    <div v-else-if="tips.length === 0" class="text-sm text-muted-foreground text-center py-4">
      No personalized tips available right now.
    </div>
    
    <div v-else class="space-y-3">
      <div 
        v-for="(tip, index) in tips.slice(0, 4)" 
        :key="index"
        class="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
      >
        <div class="flex items-start gap-2 mb-2">
          <Badge 
            variant="outline" 
            class="text-xs"
            :class="{
              'border-green-200 text-green-700': tip.category === 'Energy',
              'border-blue-200 text-blue-700': tip.category === 'Transport',
              'border-orange-200 text-orange-700': tip.category === 'Food',
              'border-purple-200 text-purple-700': tip.category === 'Waste'
            }"
          >
            {{ tip.category }}
          </Badge>
          <div 
            v-if="tip.relevanceScore > 0.8" 
            class="text-xs text-yellow-600 font-medium"
          >
            High Impact
          </div>
        </div>
        
        <h4 class="font-semibold text-sm mb-1">{{ tip.title }}</h4>
        <p class="text-xs text-muted-foreground leading-relaxed">{{ tip.description }}</p>
        
        <div v-if="tip.actionable" class="mt-2">
          <span class="text-xs text-green-600 font-medium">✓ Actionable</span>
        </div>
      </div>
    </div>
    
    <div v-if="tips.length > 4" class="text-center">
      <Button variant="ghost" size="sm" class="text-xs">
        View All Tips ({{ tips.length }})
      </Button>
    </div>
  </Card>
</template>