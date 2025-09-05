<!--
/**
 * Statistics Card Component
 * 
 * A specialized card component for displaying statistical data and metrics.
 * Designed for dashboard and analytics views with support for loading states,
 * trend indicators, and flexible value formatting. Maintains visual consistency
 * while providing clear data presentation.
 * 
 * @component StatsCard
 */
-->

<template>
  <div 
    class="rounded-lg border bg-card text-card-foreground shadow-sm p-6 transition-all duration-200"
    :class="[
      variantClasses,
      loading && 'animate-pulse',
      hover && 'hover:shadow-md hover:scale-105'
    ]"
  >
    <!-- Icon and Title Row -->
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <div v-if="icon" class="flex-shrink-0">
          <component :is="icon" class="w-5 h-5" :class="iconColorClass" />
        </div>
        <h3 class="text-sm font-medium text-muted-foreground">{{ title }}</h3>
      </div>
      
      <!-- Trend Indicator -->
      <div v-if="trend && !loading" class="flex items-center text-xs">
        <svg 
          v-if="trend.direction === 'up'"
          class="w-3 h-3 mr-1 text-green-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
        <svg 
          v-else-if="trend.direction === 'down'"
          class="w-3 h-3 mr-1 text-red-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
        <span 
          :class="trend.direction === 'up' ? 'text-green-600' : 'text-red-600'"
        >
          {{ trend.value }}
        </span>
      </div>
    </div>

    <!-- Main Value -->
    <div class="mb-1">
      <div v-if="loading" class="h-8 bg-muted rounded animate-pulse"></div>
      <div v-else-if="error" class="text-sm text-destructive">{{ error }}</div>
      <div v-else class="text-2xl font-bold" :class="valueColorClass">
        {{ formattedValue }}
      </div>
    </div>

    <!-- Subtitle/Description -->
    <p v-if="subtitle && !loading" class="text-xs text-muted-foreground">
      {{ subtitle }}
    </p>
    
    <!-- Loading subtitle -->
    <div v-if="loading && subtitle" class="h-3 w-20 bg-muted rounded animate-pulse"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Trend {
  direction: 'up' | 'down' | 'neutral'
  value: string
}

interface Props {
  title: string
  value?: number | string
  subtitle?: string
  icon?: any
  loading?: boolean
  error?: string
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info'
  trend?: Trend
  hover?: boolean
  formatter?: (value: number | string) => string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  hover: false,
  formatter: (value) => String(value)
})

const variantClasses = computed(() => {
  const variants = {
    default: 'border-border',
    success: 'border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800',
    warning: 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800',
    destructive: 'border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800',
    info: 'border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800'
  }
  return variants[props.variant]
})

const valueColorClass = computed(() => {
  const colors = {
    default: 'text-foreground',
    success: 'text-green-700 dark:text-green-300',
    warning: 'text-yellow-700 dark:text-yellow-300', 
    destructive: 'text-red-700 dark:text-red-300',
    info: 'text-blue-700 dark:text-blue-300'
  }
  return colors[props.variant]
})

const iconColorClass = computed(() => {
  const colors = {
    default: 'text-muted-foreground',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    destructive: 'text-red-600 dark:text-red-400', 
    info: 'text-blue-600 dark:text-blue-400'
  }
  return colors[props.variant]
})

const formattedValue = computed(() => {
  if (props.value === undefined || props.value === null) return '—'
  return props.formatter ? props.formatter(props.value) : String(props.value)
})
</script>