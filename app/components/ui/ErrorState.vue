<!--
/**
 * Error State Component
 * 
 * A reusable component for displaying error states throughout the application.
 * Provides consistent error messaging with optional retry functionality and
 * appropriate visual styling to maintain the design system consistency.
 * 
 * @component ErrorState
 */
-->

<template>
  <div class="flex flex-col items-center justify-center p-6 text-center">
    <div class="w-12 h-12 mb-4 text-red-500">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    
    <h3 class="text-lg font-semibold text-foreground mb-2">
      {{ title || 'Something went wrong' }}
    </h3>
    
    <p class="text-sm text-muted-foreground mb-4 max-w-md">
      {{ message || 'An error occurred while loading this content. Please try again.' }}
    </p>
    
    <div class="flex gap-2">
      <Button
        v-if="showRetry"
        @click="$emit('retry')"
        :disabled="retrying"
        size="sm"
        variant="outline"
      >
        <svg v-if="retrying" class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span v-else class="mr-2">↻</span>
        {{ retrying ? 'Retrying...' : 'Try Again' }}
      </Button>
      
      <Button
        v-if="showSupport"
        @click="$emit('support')"
        size="sm"
        variant="ghost"
      >
        Get Help
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '../button'

interface Props {
  title?: string
  message?: string
  showRetry?: boolean
  showSupport?: boolean
  retrying?: boolean
}

withDefaults(defineProps<Props>(), {
  showRetry: true,
  showSupport: false,
  retrying: false
})

defineEmits<{
  retry: []
  support: []
}>()
</script>