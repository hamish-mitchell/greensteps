<script setup lang="ts">
definePageMeta({
  layout: "app-shell",
  tagline: "Track and understand your carbon footprint.",
})

import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

import Card from '~/components/ui/card/Card.vue'
import Button from '~/components/ui/button/Button.vue'
import Badge from '~/components/ui/badge/Badge.vue'
import Separator from '~/components/ui/separator/Separator.vue'

// Breadcrumb components
import Breadcrumb from '~/components/ui/breadcrumb/Breadcrumb.vue'
import BreadcrumbItem from '~/components/ui/breadcrumb/BreadcrumbItem.vue'
import BreadcrumbList from '~/components/ui/breadcrumb/BreadcrumbList.vue'
import BreadcrumbPage from '~/components/ui/breadcrumb/BreadcrumbPage.vue'

// Charts commented out
// import ChartBar from '~/components/ui/chart-bar/ChartBar.vue'
// import ChartDonut from '~/components/ui/chart-donut/ChartDonut.vue'

type HistoryItem = {
  id: number
  activity: string
  category: string
  date: string
  impactKg: number
  type: 'debit' | 'credit'
}

// Monthly emissions (kg CO2)
const monthlyEmissions = ref([
  { label: 'Jan', value: 45 },
  { label: 'Feb', value: 40 },
  { label: 'Mar', value: 55 },
  { label: 'Apr', value: 56 },
  { label: 'May', value: 41 },
  { label: 'Jun', value: 39 },
  { label: 'Jul', value: 30 },
])

// Category breakdown (%)
const categoryBreakdown = ref([
  { label: 'Transport', value: 45, color: '#0ea5e9' },
  { label: 'Recycling', value: 25, color: '#10b981' },
  { label: 'Energy', value: 20, color: '#f59e0b' },
  { label: 'Food', value: 10, color: '#6366f1' },
])

const history = ref<HistoryItem[]>([
  { id: 1, activity: 'Drove to work (15km)', category: 'Transport', date: 'July 29, 2025', impactKg: 5.2, type: 'debit' },
  { id: 2, activity: 'Meatless Monday', category: 'Food', date: 'July 28, 2025', impactKg: -1.8, type: 'credit' },
  { id: 3, activity: 'Recycled 5 plastic bottles', category: 'Recycling', date: 'July 28, 2025', impactKg: -0.5, type: 'credit' },
  { id: 4, activity: 'Used AC for 4 hours', category: 'Energy', date: 'July 27, 2025', impactKg: 2.1, type: 'debit' },
  { id: 5, activity: 'Cycled to shops (5km)', category: 'Transport', date: 'July 20, 2025', impactKg: -1.5, type: 'credit' },
])

const totalEmissionsYTD = computed(() =>
  history.value.filter(h => h.type === 'debit').reduce((s, i) => s + i.impactKg, 0) +
  history.value.filter(h => h.type === 'credit').reduce((s, i) => s + i.impactKg, 0)
)
const avgDailyFootprint = computed(() => (totalEmissionsYTD.value / 210).toFixed(1))
const bestCategory = computed(() => 'Recycling')

const recentActivity = computed(() => history.value.slice(0, 3))

const mode = ref<'all' | 'credit' | 'debit'>('all')
const filteredHistory = computed(() => {
  if (mode.value === 'all') return history.value
  return history.value.filter(h => h.type === mode.value)
})
function setMode(m: 'all' | 'credit' | 'debit') {
  mode.value = m
}

function fmtImpact(v: number) {
  const sign = v > 0 ? '+' : ''
  return `${sign}${v.toFixed(1)} kg`
}
function impactClass(v: number) {
  return v > 0 ? 'text-red-500' : 'text-emerald-600'
}

// ---- Chart.js Integration ----
const barCanvas = ref<HTMLCanvasElement | null>(null)
const donutCanvas = ref<HTMLCanvasElement | null>(null)

import type { Chart as ChartType } from 'chart.js'
let ChartLib: any // will hold the Chart constructor after dynamic import
let barChart: ChartType | null = null
let donutChart: ChartType | null = null

onMounted(async () => {
  // Ensure dependency installed: npm i chart.js
  // Dynamic import so SSR is safe
  const mod = await import('chart.js/auto')
  // chart.js/auto default export is the Chart constructor
  ChartLib = mod.default
  if (!ChartLib) {
    console.error('Chart.js failed to load')
    return
  }
  buildBarChart()
  buildDonutChart()
})

onBeforeUnmount(() => {
  barChart?.destroy()
  donutChart?.destroy()
})

function buildBarChart() {
  if (!barCanvas.value || !ChartLib) return
  barChart?.destroy()
  barChart = new ChartLib(barCanvas.value.getContext('2d'), {
    type: 'bar',
    data: {
      labels: monthlyEmissions.value.map(m => m.label),
      datasets: [
        {
          label: 'Monthly CO₂ (kg)',
          data: monthlyEmissions.value.map(m => m.value),
          backgroundColor: 'rgba(16,185,129,0.7)',
          borderRadius: 6,
          maxBarThickness: 38
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: getCssVar('--vis-text-color', '#666') }
        },
        y: {
          grid: { color: 'hsl(var(--border)/0.4)' },
          ticks: { color: getCssVar('--vis-text-color', '#666') },
          beginAtZero: true
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx: any) => `${ctx.parsed.y} kg` } }
      }
    }
  })
}

function buildDonutChart() {
  if (!donutCanvas.value || !ChartLib) return
  donutChart?.destroy()
  const colors = categoryBreakdown.value.map(c => c.color)
  donutChart = new ChartLib(donutCanvas.value.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: categoryBreakdown.value.map(c => c.label),
      datasets: [
        {
          label: 'Breakdown',
          data: categoryBreakdown.value.map(c => c.value),
          backgroundColor: colors,
          borderWidth: 0,
          hoverOffset: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx: any) => `${ctx.label}: ${ctx.parsed} %` } }
      }
    }
  })
}

function getCssVar(name: string, fallback: string) {
  if (typeof window === 'undefined') return fallback
  const v = getComputedStyle(document.documentElement).getPropertyValue(name)
  return v?.trim() || fallback
}
</script>

<template>
  <div class="flex flex-col h-full max-h-full">

    <div
      class="space-y-6 overflow-y-auto pr-2 custom-scroll"
      style="max-height: calc(100vh - 160px)"
      aria-label="Emissions content"
    >
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl font-semibold tracking-tight">Emissions</h1>
          <p class="text-sm text-muted-foreground">Track and understand your carbon footprint.</p>
        </div>
        <div class="flex gap-2">
          <Button size="sm" variant="outline">Download Report</Button>
          <Button size="sm">+ Add Activity</Button>
        </div>
      </div>

      <!-- KPIs -->
      <div class="grid gap-4 md:grid-cols-3">
        <Card class="p-4 flex flex-col justify-between">
          <div class="text-xs font-medium text-muted-foreground">Total Emissions (YTD)</div>
          <div class="mt-2 text-2xl font-semibold">{{ totalEmissionsYTD.toFixed(0) }} kg</div>
          <p class="mt-1 text-xs text-red-500">+5% vs last year</p>
        </Card>
        <Card class="p-4 flex flex-col justify-between">
          <div class="text-xs font-medium text-muted-foreground">Avg Daily Footprint</div>
          <div class="mt-2 text-2xl font-semibold">{{ avgDailyFootprint }} kg</div>
          <p class="mt-1 text-xs text-muted-foreground">YTD average</p>
        </Card>
        <Card class="p-4 flex flex-col justify-between">
          <div class="text-xs font-medium text-muted-foreground">Best Category</div>
          <div class="mt-2 text-2xl font-semibold">{{ bestCategory }}</div>
          <p class="mt-1 text-xs text-emerald-600">25% net reduction</p>
        </Card>
      </div>

      <!-- Charts Row -->
      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Bar Chart -->
        <Card class="p-4 lg:col-span-2 flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-sm font-medium text-muted-foreground uppercase">Monthly CO₂ Emissions (kg)</h2>
            <Button size="sm" variant="ghost" class="h-7 text-xs">View Detail</Button>
          </div>
          <div class="flex-1 h-[260px] relative">
            <canvas ref="barCanvas" aria-label="Monthly emissions bar chart" role="img"></canvas>
          </div>
        </Card>

        <!-- Donut Chart -->
        <Card class="p-4 flex flex-col">
          <h2 class="text-sm font-medium text-muted-foreground uppercase mb-4">Emissions Breakdown</h2>
          <div class="flex items-center gap-4">
            <div class="w-40 h-40 relative">
              <canvas ref="donutCanvas" aria-label="Category emissions breakdown" role="img"></canvas>
            </div>
            <ul class="flex-1 space-y-1 text-xs">
              <li v-for="c in categoryBreakdown" :key="c.label" class="flex items-center justify-between">
                <span class="flex items-center gap-2">
                  <span class="h-2 w-2 rounded-full" :style="{ background: c.color }"></span>{{ c.label }}
                </span>
                <span class="font-medium">{{ c.value }}%</span>
              </li>
            </ul>
          </div>
          <Separator class="my-4" />
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-muted-foreground">Recent Activity</span>
            <Button size="sm" variant="ghost" class="h-7 text-xs">View All</Button>
          </div>
            <div class="space-y-2">
              <div
                v-for="r in recentActivity"
                :key="r.id"
                class="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2"
              >
                <div class="flex flex-col">
                  <span class="text-xs font-medium leading-tight">{{ r.activity }}</span>
                  <span class="text-[10px] text-muted-foreground">{{ r.category }}</span>
                </div>
                <span :class="['text-xs font-semibold', impactClass(r.impactKg)]">
                  {{ fmtImpact(r.impactKg) }}
                </span>
              </div>
            </div>
        </Card>
      </div>

      <!-- History -->
      <Card class="p-4">
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 class="text-sm font-medium text-muted-foreground uppercase">Emission History</h2>
            <div class="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                :class="mode==='all' && 'bg-primary text-primary-foreground'"
                @click="setMode('all')"
              >All</Button>
              <Button
                size="sm"
                variant="outline"
                :class="mode==='credit' && 'bg-primary text-primary-foreground'"
                @click="setMode('credit')"
              >Credit</Button>
              <Button
                size="sm"
                variant="outline"
                :class="mode==='debit' && 'bg-primary text-primary-foreground'"
                @click="setMode('debit')"
              >Debit</Button>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="text-xs text-muted-foreground border-b">
                <tr>
                  <th class="py-2 text-left font-medium">Activity</th>
                  <th class="py-2 text-left font-medium">Category</th>
                  <th class="py-2 text-left font-medium">Date</th>
                  <th class="py-2 text-right font-medium">CO₂ Impact (kg)</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in filteredHistory"
                  :key="row.id"
                  class="border-b last:border-0 hover:bg-muted/40 transition-colors"
                >
                  <td class="py-2 pr-2">{{ row.activity }}</td>
                  <td class="py-2 pr-2">
                    <Badge variant="outline" class="text-[10px]">{{ row.category }}</Badge>
                  </td>
                  <td class="py-2 pr-2 text-xs text-muted-foreground">{{ row.date }}</td>
                  <td class="py-2 pl-2 text-right font-semibold" :class="impactClass(row.impactKg)">
                    {{ fmtImpact(row.impactKg) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 8px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: hsl(var(--muted));
  border-radius: 4px;
}
.custom-scroll:hover::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
}
</style>
