<!--
  Quests Page - Gamification Challenge System
  
  Displays available challenges and quests for users to complete.
  Tracks progress, rewards, and provides motivation for sustainable actions.

  Author: Hamish Mitchell
  Date: 13/08/2025
-->
<script setup lang="ts">
definePageMeta({
	layout: 'app-shell',
	tagline: 'Complete challenges, earn points, and make a difference.'
})

import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useQuests } from '~/composables/useQuests'
import Card from '~/components/ui/card/Card.vue'
import Button from '~/components/ui/button/Button.vue'
import Badge from '~/components/ui/badge/Badge.vue'
import Progress from '~/components/ui/progress/Progress.vue'

const activeTab = ref<'active' | 'new' | 'completed'>('active')
const { active, discover, completed, loading, error, enroll, incrementProgress, cancelQuest } = useQuests()
// Limit of active quests
const MAX_ACTIVE = 3
const canStartMore = computed(() => active.value.length < MAX_ACTIVE)
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, AlertDialogTrigger } from '~/components/ui/alert-dialog'
const confirmCancelId = ref<number | null>(null)

// Confetti on quest completion
let stopListener: (() => void) | null = null
onMounted(async () => {
	// Lazy import to keep SSR safe and reduce bundle size on initial load
	// @ts-ignore - types provided via local ambient or fallback to any
	const [{ useEventBus }, confettiMod] = await Promise.all([
		import('@vueuse/core'),
		// @ts-ignore
		import('canvas-confetti')
	])
	const bus = useEventBus<{ quest: any }>('quest:completed')
	const confetti = confettiMod.default || (confettiMod as any)
	const fire = () => {
		const duration = 1800
		const end = Date.now() + duration
		const colors = ['#16a34a', '#15803d', '#65a30d', '#bef264', '#86efac']
		;(function frame() {
			confetti({
				particleCount: 3,
				startVelocity: 35,
				spread: 55,
				origin: { x: Math.random() * 0.4 + 0.3, y: 0.2 },
				colors
			})
			if (Date.now() < end) requestAnimationFrame(frame)
		})()
		confetti({
			particleCount: 120,
			spread: 70,
			gravity: 0.8,
			scalar: 0.9,
			ticks: 250,
			origin: { y: 0.2 },
			colors
		})
	}
	stopListener = bus.on(({ quest }) => fire())
})
onBeforeUnmount(() => { if (stopListener) stopListener(); })

// Choose a featured quest (prioritise active, else discover)
const featuredQuest = computed(() => {
	if (active.value.length) return { type: 'active' as const, data: active.value[0] }
	if (discover.value.length) return { type: 'discover' as const, data: discover.value[0] }
	return null
})

const filteredQuests = computed(() => {
	if (activeTab.value === 'active') return active.value
	if (activeTab.value === 'new') return discover.value
	return completed.value
})

function percent(q: any) {
	if (!q?.max_value) return 0
	if (typeof q.percent === 'number') return q.percent
	if (q.progress != null && q.max_value) return Math.min(100, Math.round((q.progress / q.max_value) * 100))
	return 0
}

function questPoints(q: any) {
	const max = q?.max_value ?? 0
	const mult = q?.points_multiplier ?? 0
	return max * mult
}

function questCategory(q: any) {
	return q?.category || 'General'
}

function progressLabel(q: any) {
	if (q?.max_value == null) return ''
	const prog = q.progress ?? 0
	return `${prog} of ${q.max_value}`
}

function isUserQuest(q: any): boolean {
	return q && ('completed' in q || 'progress' in q)
}

async function startQuest(q: any) {
	// Prevent starting more than the maximum allowed active quests
	if (!canStartMore.value) return
	if (!isUserQuest(q)) {
		await enroll(q.id)
		activeTab.value = 'active'
	}
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
						<button :class="tabClass('active')" @click="activeTab='active'">Active ({{ active.length }})</button>
						<button :class="tabClass('new')" @click="activeTab='new'">New ({{ discover.length }})</button>
						<button :class="tabClass('completed')" @click="activeTab='completed'">Completed ({{ completed.length }})</button>
					</div>
					<!-- Limit notice -->
					<div v-if="!canStartMore" class="text-xs text-yellow-600">Maximum of {{ MAX_ACTIVE }} active quests reached. Complete or cancel one to start another.</div>

					<!-- Quest Cards -->
					<div v-if="filteredQuests.length" class="space-y-4" :aria-busy="loading">
						<Card v-for="q in filteredQuests" :key="q.id" class="p-4 flex flex-col gap-3">
							<div class="flex items-start justify-between gap-4">
								<div class="flex flex-col gap-1">
									<div class="flex items-center gap-2">
										<Badge variant="secondary" class="text-[10px] px-2 py-0.5">{{ questCategory(q) }}</Badge>
										<span class="text-[10px] text-muted-foreground uppercase tracking-wide">+{{ questPoints(q) }} pts</span>
									</div>
									<h2 class="text-sm font-semibold leading-tight">{{ q.name }}</h2>
									<p class="text-[11px] text-muted-foreground leading-snug max-w-[680px]">{{ q.description }}</p>
								</div>
								<div class="text-[10px] text-muted-foreground whitespace-nowrap">
									<span>{{ progressLabel(q) }}</span>
								</div>
							</div>
							<div class="flex items-center gap-2">
								<Progress :model-value="percent(q)" class="flex-1" />
								<Button v-if="!isUserQuest(q)" :disabled="!canStartMore" size="sm" @click="startQuest(q)" :title="canStartMore ? 'Start quest' : `Limit reached: ${MAX_ACTIVE} active quests`">Start</Button>
								<template v-else>
									<Badge v-if="(q as any).completed" variant="outline" class="text-[10px]">Completed</Badge>
									<div v-else class="flex items-center gap-1">
										<Button size="sm" variant="secondary" class="text-[11px] h-6" @click="incrementProgress(q.id)">+1</Button>
										<AlertDialog>
											<AlertDialogTrigger as-child>
												<Button size="sm" variant="ghost" class="text-[11px] h-6" @click.stop="confirmCancelId = q.id">Cancel</Button>
											</AlertDialogTrigger>
											<AlertDialogContent class="max-w-sm">
												<AlertDialogHeader>
													<AlertDialogTitle class="text-sm">Cancel this quest?</AlertDialogTitle>
													<AlertDialogDescription class="text-xs">You'll lose current progress. You can start it again later.</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel class="text-xs">Keep Quest</AlertDialogCancel>
													<AlertDialogAction class="text-xs" @click="cancelQuest(confirmCancelId!); confirmCancelId = null">Confirm</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</div>
								</template>
							</div>
						</Card>
					</div>
					<div v-else class="text-xs text-muted-foreground border rounded-md p-6 text-center">
						<span v-if="loading">Loading quests...</span>
						<span v-else-if="error">{{ error }}</span>
						<span v-else>Nothing to show here yet.</span>
					</div>
				</div>

				<!-- Featured Quest -->
				<div class="order-2 space-y-4" v-if="featuredQuest">
					<Card class="p-0 overflow-hidden flex flex-col border">
						<div class="flex items-center justify-between px-4 pt-4">
							<div class="flex items-center gap-1 text-xs font-medium text-yellow-600">
								<span>⭐</span>
								<span>Featured Quest</span>
							</div>
						</div>
						<div class="mt-2 aspect-video w-full bg-muted flex items-center justify-center overflow-hidden">
							<!-- Placeholder image -->
							<img src="/image.png" alt="Featured quest" class="object-cover w-full h-full" />
						</div>
						<div class="p-4 flex flex-col gap-3">
							<div class="flex items-center gap-2">
								<Badge variant="outline" class="text-[10px] px-2 py-0.5">{{ questCategory(featuredQuest.data) }}</Badge>
								<Badge variant="secondary" class="text-[10px] px-2 py-0.5">+{{ questPoints(featuredQuest.data) }} pts</Badge>
							</div>
							<h3 class="text-sm font-semibold leading-tight">{{ featuredQuest?.data?.name }}</h3>
							<p class="text-xs text-muted-foreground leading-snug">{{ featuredQuest?.data?.description }}</p>
							<Button size="sm" class="mt-1" :disabled="!canStartMore" @click="startQuest(featuredQuest?.data)" v-if="featuredQuest?.type==='discover' && featuredQuest?.data" :title="canStartMore ? 'Start quest' : `Limit reached: ${MAX_ACTIVE} active quests`">Start Quest</Button>
							<Badge v-else variant="outline" class="w-fit text-[10px]">In Progress</Badge>
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
