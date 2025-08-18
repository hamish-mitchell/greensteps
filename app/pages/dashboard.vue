<template>
  <!-- NEW: This outer div creates the background and padding -->
  <div class="bg-muted/30 p-2 sm:p-4 h-screen">
    <!-- 
      NEW: The AppLayout is now styled like a large card.
      It has rounded corners, a border, and sits on the background.
    -->
    <DashboardAppLayout
      :sidebar="config.sidebar"
      :header="config.header"
      class="h-full w-full rounded-xl border bg-background shadow-sm overflow-hidden"
    >
      
      <!-- The dynamic content renderer remains the same -->
      <div v-for="(section, index) in config.layout" :key="index" :class="[section.columns, section.gap]">
        <div v-for="(col, colIndex) in section.children" :key="colIndex" :class="col.colSpan">
          <div class="space-y-8">
            <component
              v-for="(comp, compIndex) in col.children"
              :key="compIndex"
              :is="dashboardComponents[comp.component]"
              v-bind="comp.props"
            />
          </div>
        </div>
      </div>

    </DashboardAppLayout>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import config from '../../data/dashboard.json'

const dashboardComponents = {
  MetricGrid: defineAsyncComponent(() => import('@/components/dashboard/MetricGrid.vue')),
  EmissionsChart: defineAsyncComponent(() => import('@/components/dashboard/EmissionsChart.vue')),
  ImpactDonut: defineAsyncComponent(() => import('@/components/dashboard/ImpactDonut.vue')),
  ActiveQuests: defineAsyncComponent(() => import('@/components/dashboard/ActiveQuests.vue')),
  Leaderboard: defineAsyncComponent(() => import('@/components/dashboard/Leaderboard.vue')),
  Badges: defineAsyncComponent(() => import('@/components/dashboard/Badges.vue')),
}
</script>