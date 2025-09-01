<script setup lang="ts">
definePageMeta({
  layout: "app-shell",
  tagline: "Track and understand your carbon footprint.",
})

import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

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

// Activities fetched from DB
const history = ref<HistoryItem[]>([])
const loading = ref(false)
const loadError = ref<string|null>(null)

const supabase = useSupabaseClient()
const user = useSupabaseUser()

interface ActivityRow { id: string; type: string; category: string; emission_kg: number; created_at: string; quantity: number; unit: string }

async function loadActivities() {
  if (!user.value) return
  loading.value = true
  loadError.value = null
  const { data, error } = await supabase
    .from('activities')
    .select('id, type, category, emission_kg, created_at, quantity, unit')
    .order('created_at', { ascending: false })
    .limit(250)
  if (error) {
    loadError.value = error.message
  } else if (data) {
    const rows = data as ActivityRow[]
    history.value = rows.map((a, idx) => ({
      id: idx + 1,
      activity: `${a.type} ${a.quantity ? '(' + a.quantity + ' ' + a.unit + ')' : ''}`.trim(),
      category: capitalise(a.category),
      date: new Date(a.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      impactKg: a.emission_kg,
      type: a.emission_kg >= 0 ? 'debit' : 'credit'
    }))
    rebuildCharts()
  }
  loading.value = false
}

watch(() => user.value?.id, (id) => { if (id) loadActivities() }, { immediate: true })

function capitalise(s: string) { return s.charAt(0).toUpperCase() + s.slice(1) }

const totalEmissionsYTD = computed(() =>
  history.value.reduce((s, i) => s + i.impactKg, 0)
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

// Derived datasets for charts
const monthlyEmissions = computed(() => {
  // group by YYYY-MM from history
  const buckets: Record<string, number> = {}
  history.value.forEach(h => {
    const d = new Date(h.date)
    const key = `${d.getFullYear()}-${d.getMonth()+1}`
    buckets[key] = (buckets[key] || 0) + h.impactKg
  })
  // sort chronologically, take last 7
  const entries = Object.entries(buckets).sort((a,b)=> new Date(a[0]).getTime() - new Date(b[0]).getTime()).slice(-7)
  return entries.map(([k,v]) => {
    const [y,m] = k.split('-')
    const date = new Date(Number(y), Number(m)-1, 1)
    return { label: date.toLocaleString(undefined,{ month:'short'}), value: Math.round(v*100)/100 }
  })
})

const categoryBreakdown = computed(() => {
  const total = history.value.reduce((s,i)=> s + Math.abs(i.impactKg), 0) || 1
  const bucket: Record<string, number> = {}
  history.value.forEach(h => {
    bucket[h.category] = (bucket[h.category] || 0) + Math.abs(h.impactKg)
  })
  const palette = ['#0ea5e9','#10b981','#f59e0b','#6366f1','#ec4899','#84cc16']
  return Object.entries(bucket)
    .sort((a,b)=> b[1]-a[1])
    .map(([label,val],i)=> ({ label, value: Math.round(val/total*100), color: palette[i % palette.length] }))
})

// ---- Chart.js Integration ----
const barCanvas = ref<HTMLCanvasElement | null>(null)
const donutCanvas = ref<HTMLCanvasElement | null>(null)

import type { Chart as ChartType } from 'chart.js'
let ChartLib: any // will hold the Chart constructor after dynamic import
let barChart: ChartType | null = null
let donutChart: ChartType | null = null

onMounted(async () => {
  const mod = await import('chart.js/auto')
  ChartLib = mod.default
  if (!ChartLib) return
  rebuildCharts()
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

function rebuildCharts() {
  buildBarChart();
  buildDonutChart();
}

watch(monthlyEmissions, () => rebuildCharts())
watch(categoryBreakdown, () => rebuildCharts())

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
