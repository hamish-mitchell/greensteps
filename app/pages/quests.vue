<script setup lang="ts">
definePageMeta({
	layout: 'app-shell',
	tagline: 'Complete challenges, earn points, and make a difference.'
})

import { ref, computed } from 'vue'
import Card from '~/components/ui/card/Card.vue'
import Button from '~/components/ui/button/Button.vue'
import Badge from '~/components/ui/badge/Badge.vue'
import Progress from '~/components/ui/progress/Progress.vue'

type Quest = {
	id: number
	title: string
	description: string
	type: 'weekly' | 'monthly' | 'community'
	goal: number // weeks, km, days etc depending on quest
	progress: number
	points: number
	unit?: string
	tag?: string
}

const activeTab = ref<'active' | 'new' | 'completed'>('active')

const quests = ref<Quest[]>([
	{
		id: 1,
		title: 'Meatless Monday',
		description: 'Skip meat for one day a week. A small change that has a big impact on the environment.',
		type: 'weekly',
		goal: 4,
		progress: 3,
		points: 150,
		unit: 'weeks',
		tag: 'Weekly Challenge'
	},
	{
		id: 2,
		title: 'Cycle to Work',
		description: 'Ditch the car and enjoy the fresh air. Track your kilometres and watch your fitness grow.',
		type: 'monthly',
		goal: 50,
		progress: 25,
		points: 500,
		unit: 'km',
		tag: 'Monthly Goal'
	},
	{
		id: 3,
		title: 'No Single-Use Plastic Week',
		description: 'Challenge yourself to avoid all single-use plastics for an entire week. Every little bit helps.',
		type: 'community',
		goal: 7,
		progress: 5,
		points: 200,
		unit: 'days',
		tag: 'Community Quest'
	}
])

const featuredQuest = ref<Quest>({
	id: 99,
	title: 'Community Garden Volunteer',
	description: 'Join forces with your neighbours to cultivate a local garden. Help grow fresh produce for the community and learn valuable gardening skills.',
	type: 'community',
	goal: 6,
	progress: 0,
	points: 300,
	unit: 'hrs',
	tag: 'Social Impact'
})

const filteredQuests = computed(() => {
	if (activeTab.value === 'active') return quests.value
	if (activeTab.value === 'new') return [] // placeholder
	return [] // completed placeholder
})

function percent(q: Quest) {
	if (!q.goal) return 0
	return Math.min(100, (q.progress / q.goal) * 100)
}

function tabClass(tab: typeof activeTab.value) {
	return [
		'px-3 py-1 text-xs font-medium rounded-full cursor-pointer transition-colors',
		activeTab.value === tab
			? 'bg-primary text-primary-foreground shadow'
			: 'bg-muted text-muted-foreground hover:bg-muted/70'
	]
}
</script>

<template>
	<div class="flex flex-col h-full max-h-full">
		<div class="space-y-6 overflow-y-auto pr-2 custom-scroll" style="max-height: calc(100vh - 160px)">
			<!-- Header -->
			<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h1 class="text-xl font-semibold tracking-tight">Quests</h1>
					<p class="text-sm text-muted-foreground">Complete challenges, earn points, and make a difference.</p>
				</div>
				<div class="flex items-center gap-2">
					<Button size="sm" variant="outline">Suggest a Quest</Button>
				</div>
			</div>

			<div class="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
				<!-- Quest List (spans 2 cols on xl) -->
				<div class="md:col-span-1 xl:col-span-2 space-y-4 order-1">
					<!-- Tabs -->
					<div class="flex items-center gap-2 text-xs font-medium">
						<button :class="tabClass('active')" @click="activeTab='active'">Active Quests (3)</button>
						<button :class="tabClass('new')" @click="activeTab='new'">New Quests</button>
						<button :class="tabClass('completed')" @click="activeTab='completed'">Completed</button>
					</div>

					<!-- Quest Cards -->
					<div v-if="filteredQuests.length" class="space-y-4">
						<Card v-for="q in filteredQuests" :key="q.id" class="p-4 flex flex-col gap-3">
							<div class="flex items-start justify-between gap-4">
								<div class="flex flex-col gap-1">
									<div class="flex items-center gap-2">
										<Badge variant="secondary" class="text-[10px] px-2 py-0.5">{{ q.tag }}</Badge>
										<span class="text-[10px] text-muted-foreground uppercase tracking-wide">+{{ q.points }} pts</span>
									</div>
									<h2 class="text-sm font-semibold leading-tight">{{ q.title }}</h2>
									<p class="text-[11px] text-muted-foreground leading-snug max-w-[680px]">{{ q.description }}</p>
								</div>
								<div class="text-[10px] text-muted-foreground whitespace-nowrap">
									<span v-if="q.unit==='weeks'">{{ q.progress }} of {{ q.goal }} weeks</span>
									<span v-else>{{ q.progress }} of {{ q.goal }} {{ q.unit }}</span>
								</div>
							</div>
							<div>
								<Progress :model-value="percent(q)" />
							</div>
						</Card>
					</div>
					<div v-else class="text-xs text-muted-foreground border rounded-md p-6 text-center">
						Nothing to show here yet.
					</div>
				</div>

				<!-- Featured Quest -->
				<div class="order-2 space-y-4">
					<Card class="p-0 overflow-hidden flex flex-col border">
						<div class="flex items-center justify-between px-4 pt-4">
							<div class="flex items-center gap-1 text-xs font-medium text-yellow-600">
								<span>⭐</span>
								<span>Featured Quest</span>
							</div>
						</div>
						<div class="mt-2 aspect-video w-full bg-muted flex items-center justify-center overflow-hidden">
							<!-- Placeholder image -->
							<img src="/placeholder.svg" alt="Featured quest" class="object-cover w-full h-full" />
						</div>
						<div class="p-4 flex flex-col gap-3">
							<div class="flex items-center gap-2">
								<Badge variant="outline" class="text-[10px] px-2 py-0.5">{{ featuredQuest.tag }}</Badge>
								<Badge variant="secondary" class="text-[10px] px-2 py-0.5">+{{ featuredQuest.points }} pts</Badge>
							</div>
							<h3 class="text-sm font-semibold leading-tight">{{ featuredQuest.title }}</h3>
							<p class="text-xs text-muted-foreground leading-snug">{{ featuredQuest.description }}</p>
							<Button size="sm" class="mt-1">Start Quest</Button>
						</div>
					</Card>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.custom-scroll::-webkit-scrollbar { width: 8px; }
.custom-scroll::-webkit-scrollbar-track { background: transparent; }
.custom-scroll::-webkit-scrollbar-thumb { background: hsl(var(--muted)); border-radius: 4px; }
.custom-scroll:hover::-webkit-scrollbar-thumb { background: hsl(var(--border)); }
</style>
