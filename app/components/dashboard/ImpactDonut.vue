<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-lg font-bold">{{ title }}</CardTitle>
    </CardHeader>
    <CardContent class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
      <div class="mx-auto h-40 w-40">
        <Doughnut :data="chartData" :options="chartOptions" />
      </div>
      <div class="space-y-2 text-sm">
        <div v-for="item in data" :key="item.label" class="flex justify-between">
          <span class="flex items-center gap-2">
            <span class="h-2 w-2 rounded-full" :class="item.color"></span>
            {{ item.label }}
          </span>
          <span class="font-semibold">{{ item.value }}%</span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  title: String,
  data: {
    type: Array as () => Array<{ label: string; value: number; color: string }>,
    default: () => []
  }
})

// <!-- DUMMY DATA: The chart data is derived from the 'data' prop -->
const chartData = computed(() => ({
  labels: props.data.map(d => d.label),
  datasets: [
    {
      data: props.data.map(d => d.value),
      // In a real app, colors might be better managed via CSS variables
      backgroundColor: props.data.map(d => {
        // A simple map to convert tailwind bg colors to hex/rgb for the chart
        const colorMap = {
          'bg-blue-500': '#3b82f6',
          'bg-yellow-500': '#eab308',
          'bg-orange-500': '#f97316',
          'bg-green-500': '#22c55e',
        }
        return colorMap[d.color] || d.color
      }),
      borderWidth: 0,
      hoverOffset: 8,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '75%',
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: false,
    },
  },
}
</script>