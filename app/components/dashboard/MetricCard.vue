    
<template>
  <Card :class="variant === 'primary' ? 'bg-primary text-primary-foreground' : 'bg-card'">
    <CardHeader>
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg" :class="iconBgClass">
          <component :is="icons[icon]" class="h-6 w-6" :class="iconColorClass" />
        </div>
        <CardTitle class="text-sm font-semibold" :class="variant === 'primary' ? 'text-primary-foreground/80' : 'text-muted-foreground'">{{ title }}</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <p class="text-3xl font-bold">{{ value }}</p>
      <p class="mt-1 text-xs" :class="variant === 'primary' ? 'text-primary-foreground/70' : 'text-muted-foreground'">{{ change }}</p>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import * as icons from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const props = defineProps({
  title: String,
  value: String,
  change: String,
  icon: String,
  variant: {
    type: String,
    default: 'default' // 'default' or 'primary'
  }
})

// Example of deriving styles from props. This can be more complex.
const iconBgClass = computed(() => {
  if (props.variant === 'primary') return 'bg-white/20'
  // You could have a map of icons to colors here
  const colorMap = {
    Route: 'bg-blue-100',
    Recycle: 'bg-yellow-100',
    Zap: 'bg-orange-100',
    Droplets: 'bg-sky-100',
    CheckCircle2: 'bg-purple-100',
  }
  return colorMap[props.icon] || 'bg-accent'
})

const iconColorClass = computed(() => {
  if (props.variant === 'primary') return 'text-primary-foreground'
  const colorMap = {
    Route: 'text-blue-500',
    Recycle: 'text-yellow-500',
    Zap: 'text-orange-500',
    Droplets: 'text-sky-500',
    CheckCircle2: 'text-purple-500',
  }
  return colorMap[props.icon] || 'text-accent-foreground'
})
</script>

  