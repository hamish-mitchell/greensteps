<!--
/**
 * Loading Spinner Component
 * 
 * A versatile loading component that provides visual feedback during async operations.
 * Supports different sizes and can display optional loading text. Maintains consistency
 * with the application's design system and provides accessible loading states.
 * 
 * @component LoadingSpinner
 */
-->

<template>
  <div class="flex flex-col items-center justify-center p-4">
    <div 
      class="animate-spin rounded-full border-solid border-current border-r-transparent"
      :class="[
        sizeClasses,
        'border-2',
        colorClass
      ]"
      role="status"
      :aria-label="ariaLabel"
    >
      <span class="sr-only">{{ ariaLabel }}</span>
    </div>
    
    <p 
      v-if="text" 
      class="mt-2 text-sm font-medium"
      :class="textColorClass"
    >
      {{ text }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  variant?: 'primary' | 'muted' | 'accent'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'primary'
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  }
  return sizes[props.size]
})

const colorClass = computed(() => {
  const colors = {
    primary: 'text-primary',
    muted: 'text-muted-foreground',
    accent: 'text-accent-foreground'
  }
  return colors[props.variant]
})

const textColorClass = computed(() => {
  const textColors = {
    primary: 'text-foreground',
    muted: 'text-muted-foreground',
    accent: 'text-accent-foreground'
  }
  return textColors[props.variant]
})

const ariaLabel = computed(() => props.text || 'Loading...')
</script>