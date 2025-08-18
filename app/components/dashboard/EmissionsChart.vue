<template>
  <Card class="mt-8">
    <CardHeader>
      <CardTitle class="text-lg font-bold">{{ title }}</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="h-80">
        <!-- The key ensures the chart re-renders when our computed colors are ready -->
        <Line v-if="chartData" :key="chartKey" :data="chartData" :options="chartOptions" />
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, Filler } from 'chart.js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, Filler)

const props = defineProps({
  title: String,
  data: Array,
  labels: Array,
})

// --- START: NEW CODE FOR COLOR RESOLUTION ---

// Refs to store the computed color values
const primaryColor = ref('black')
const cardColor = ref('white')
const mutedForegroundColor = ref('gray')
const chartKey = ref(0) // Used to force re-render

// This function runs after the component is mounted to the DOM
onMounted(() => {
  // We can now safely access the document and its computed styles
  const styles = getComputedStyle(document.documentElement)
  
  // Get the HSL values from the CSS variables
  const primaryHsl = styles.getPropertyValue('--primary').trim()
  const cardHsl = styles.getPropertyValue('--card').trim()
  const mutedHsl = styles.getPropertyValue('--muted-foreground').trim()

  // Store the fully resolved HSL/A strings
  primaryColor.value = `hsl(${primaryHsl})`
  cardColor.value = `hsl(${cardHsl})`
  mutedForegroundColor.value = `hsl(${mutedHsl})`
  
  // Force the chart to re-render with the new colors
  chartKey.value++ 
})

// --- END: NEW CODE FOR COLOR RESOLUTION ---


const chartData = computed(() => {
  if (!process.client) return null // Prevent SSR issues
  
  // We create a dummy canvas context to build the gradient
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  const primaryHsl = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()
  
  // Use the resolved HSL values to create valid color stops
  gradient.addColorStop(0, `hsla(${primaryHsl}, 0.4)`);
  gradient.addColorStop(1, `hsla(${primaryHsl}, 0)`);

  return {
    labels: props.labels,
    datasets: [
      {
        label: 'CO2 Emissions (kg)',
        data: props.data,
        borderColor: primaryColor.value, // Use the resolved color
        backgroundColor: gradient, // Use the created gradient
        borderWidth: 3,
        pointBackgroundColor: primaryColor.value, // Use the resolved color
        pointBorderColor: cardColor.value, // Use the resolved color
        pointHoverBackgroundColor: cardColor.value, // Use the resolved color
        pointHoverBorderColor: primaryColor.value, // Use the resolved color
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.4,
        fill: true,
      },
    ],
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      grid: { drawBorder: false },
      ticks: { color: mutedForegroundColor.value }, // Use the resolved color
    },
    x: {
      grid: { display: false },
      ticks: { color: mutedForegroundColor.value }, // Use the resolved color
    },
  },
  plugins: {
    legend: { display: false },
  },
}))
</script>