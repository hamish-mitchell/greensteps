    
<template>
  <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
    <DashboardMetricCard
      v-for="(metric, index) in metrics"
      :key="index"
      :title="metric.title"
      :value="metric.value"
      :change="metric.change"
      :icon="metric.icon"
      :variant="metric.variant"
    />
  </div>
</template>

<script setup lang="ts">
defineProps({
  metrics: Array
})
</script>

  