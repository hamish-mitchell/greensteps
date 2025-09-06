<!--
  Dashboard Page - Main User Dashboard
  
  Primary dashboard displaying user's carbon footprint metrics, 
  activity tracking, recent achievements, and quick action buttons.

  Author: Thomas Clemow
  Date: 06/08/2025
-->
<script setup lang="ts">
import { Plus } from 'lucide-vue-next';
import { ref, computed, watch } from 'vue';
import { useBadges } from '@/composables/useBadges';
import { useLeaderboard } from '@/composables/useLeaderboard';
// Activities composable (client-side prototype)
import { useActivities } from '@/composables/useActivities';
// Import RawFormPayload type for proper typing of activity submissions
import type { } from '@/composables/useActivities';
import { useDashboardSummary } from '@/composables/useDashboardSummary';
import { useQuests } from '@/composables/useQuests';

definePageMeta({
    layout: "app-shell",
    tagline: "Overview of your impact and progress.",
});

const supabase = useSupabaseClient();
const user = useSupabaseUser();

const streak = ref(0);

// Define a type for user metadata
type UserMetadata = {
    full_name?: string;
};

// Safer username derivation
const username = computed(() => {
    // Prefer display_name from DB profile if available
    const displayName = user.value?.user_metadata?.display_name;
    if (displayName) return displayName;

    // Fallback to full_name from user metadata
    const fullName = (user.value?.user_metadata as UserMetadata)?.full_name;
    if (fullName) return fullName;

    // Fallback to email prefix
    return user.value?.email?.split("@")[0] || "";
});

// Friendly label (handles plural + punctuation)
const streakLabel = computed(() => {
    const v = streak.value;
    return `🔥 You've got a streak of ${v} day${v === 1 ? '' : 's'}${v > 7 ? '!' : '.'}`;
});

// Load & update streak when user id becomes available
watch(
    () => user.value?.id,
    async (id) => {
        if (!id) return;
        const { data, error } = await supabase
            .from("profiles")
            .select("current_streak")
            .eq("id", id)
            .single<{ current_streak: number }>();

        if (!error) streak.value = data?.current_streak ?? 0;

        // Fire and forget; ignore result for simplicity
        supabase.rpc("update_streak");
    },
    { immediate: true }
);

const { badges, loading: badgesLoading, error: badgesError } = useBadges();
const { entries: leaderboardEntries, loading: leaderboardLoading, error: leaderboardError } = useLeaderboard('global');
interface LeaderboardEntry { id: string; display_name: string; total_points: number; you?: boolean }
const topLeaderboard = computed<LeaderboardEntry[]>(() => (leaderboardEntries.value as LeaderboardEntry[] || []).slice(0,5));

// Dashboard summary
const { data: summary, loading: summaryLoading, error: summaryError, refresh: refreshSummary } = useDashboardSummary();

// Quests (for completed quests count)
const { completed: completedQuests, loading: questsLoading, error: questsError } = useQuests();
const questsDoneCount = computed(() => completedQuests.value.length);
const questsDoneLabel = computed(() => {
    const c = questsDoneCount.value;
    if (!c) return 'No quests completed yet';
    return c === 1 ? '1 quest completed' : `${c} quests completed`;
});

// Activity handling
const { addFromForm, loading: addingActivity, error: addError } = useActivities();
const lastActivity = ref<null | { type: string; category: string; emission_kg: number }>(null);

// Re-declare minimal shape matching RawFormPayload (cannot import directly if not exported; adjust if exported)
type ActivityFormPayload = {
    category: string;
    food: null | { subcategory: string; amountKg: number | null };
    transport: null | { mode: string; durationHours: number; durationMinutes: number; totalMinutes: number };
    electricity: null | { kWh: number | null };
    waste: null | { amountKg: number | null };
    diet: null | { meals: number | null };
    recycling: null | { items: number | null };
};
async function handleSaveActivity(payload: ActivityFormPayload) {
    const result = await addFromForm(payload);
    if (result) {
        lastActivity.value = { type: result.type, category: result.category, emission_kg: result.emission_kg };
    refreshSummary();
    }
}
</script>

<template>
    <div>
        <div class="w-full px-4 flex justify-between">
            <div>
                <h1 class="text-2xl font-bold">Welcome back, {{ username }}!</h1>
                <p class="text-gray-600">{{ streakLabel }}</p>
                                <div v-if="summaryLoading" class="text-xs text-gray-500 mt-1">Loading summary...</div>
                                <div v-if="summaryError" class="text-xs text-red-500 mt-1">{{ summaryError }}</div>
                                <div v-if="addingActivity" class="text-xs text-gray-500 mt-1">Saving activity...</div>
                                <div v-if="addError" class="text-xs text-red-500 mt-1">{{ addError }}</div>
                                <div v-if="lastActivity" class="text-xs text-emerald-600 mt-1">
                                    Added {{ lastActivity.type }} ({{ lastActivity.category }}) – {{ lastActivity.emission_kg }} kg CO₂e
                                </div>
            </div>
                        <DashboardInputActivity @save="handleSaveActivity">
                <template #trigger>
                    <Button>
                        <Plus /> New Activity
                    </Button>
                </template>
            </DashboardInputActivity>
        </div>

        <!-- Stats + Leaderboard grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
            <!-- Stats cards (span 2 columns on large screens) -->
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 col-span-1 lg:col-span-2">
                <!-- Emissions Card -->
                                <div
                                    class="rounded-lg p-4 flex flex-col items-center shadow transition"
                                    :class="[
                                        summaryLoading ? 'animate-pulse' : '',
                                        summary ? (summary.month_saved_kg < 0 ? 'bg-red-100' : 'bg-green-100') : 'bg-green-100'
                                    ]"
                                >
                                    <span
                                        class="text-3xl font-bold"
                                        :class="summary && summary.month_saved_kg < 0 ? 'text-red-700' : 'text-green-700'"
                                    >
                                        {{ summary ? (summary.month_saved_kg.toFixed(1) + 'kg') : '—' }}
                                    </span>
                                    <span
                                        class="mt-2 font-semibold flex items-center gap-1"
                                        :class="summary && summary.month_saved_kg < 0 ? 'text-red-800' : 'text-green-800'"
                                    >
                                        <span v-if="summary && summary.month_saved_kg < 0">😞 Over Baseline</span>
                                        <span v-else>Emissions Saved</span>
                                    </span>
                                    <span
                                        class="text-xs mt-1"
                                        :class="summary && summary.month_saved_kg < 0 ? 'text-red-600' : 'text-green-600'"
                                    >
                                        <template v-if="summary && summary.month_saved_kg < 0">
                                           Sadly, your days are numbered 🔪🩸
                                        </template>
                                        <template v-else>
                                            This month
                                        </template>
                                    </span>
                                </div>
                <!-- Sustainable Travel Card -->
                <div class="bg-blue-100 rounded-lg p-4 flex flex-col items-center shadow" :class="summaryLoading && 'animate-pulse'">
                    <span class="text-3xl font-bold text-blue-700">{{ summary ? (summary.transport_km_month.toFixed(0) + 'km') : '—' }}</span>
                    <span class="text-blue-800 mt-2 font-semibold">Transport Distance</span>
                    <span class="text-xs text-blue-600 mt-1">Logged this month</span>
                </div>
                <!-- Items Recycled Card -->
                <div class="bg-yellow-100 rounded-lg p-4 flex flex-col items-center shadow" :class="summaryLoading && 'animate-pulse'">
                    <span class="text-3xl font-bold text-yellow-700">{{ summary ? summary.waste_kg_month.toFixed(1) : '—' }}</span>
                    <span class="text-yellow-800 mt-2 font-semibold">Waste (kg)</span>
                    <span class="text-xs text-yellow-600 mt-1">Logged this month</span>
                </div>
                <!-- Energy Saved Card -->
                <div class="bg-purple-100 rounded-lg p-4 flex flex-col items-center shadow" :class="summaryLoading && 'animate-pulse'">
                    <span class="text-3xl font-bold text-purple-700">{{ summary ? (summary.energy_kwh_month.toFixed(1) + 'kWh') : '—' }}</span>
                    <span class="text-purple-800 mt-2 font-semibold">Energy Use</span>
                    <span class="text-xs text-purple-600 mt-1">This month</span>
                </div>
                <!-- Water Saved Card -->
                <div class="bg-cyan-100 rounded-lg p-4 flex flex-col items-center shadow">
                    <span class="text-3xl font-bold text-cyan-700">—</span>
                    <span class="text-cyan-800 mt-2 font-semibold">Water Saved</span>
                    <span class="text-xs text-cyan-600 mt-1">Not tracked yet</span>
                </div>
                <!-- Quests Done Card -->
                <div class="bg-pink-100 rounded-lg p-4 flex flex-col items-center shadow" :class="questsLoading && 'animate-pulse'">
                    <span class="text-3xl font-bold text-pink-700">{{ questsLoading ? '…' : questsDoneCount }}</span>
                    <span class="text-pink-800 mt-2 font-semibold">Quests Done</span>
                    <span class="text-xs mt-1" :class="questsError ? 'text-red-600' : 'text-pink-600'">
                        <template v-if="questsError">{{ questsError }}</template>
                        <template v-else>{{ questsDoneLabel }}</template>
                    </span>
                </div>
            </div>
            <!-- Leaderboard card (spans 1 column on large screens, full width on mobile) -->
                        <div class="bg-white rounded-lg p-4 shadow flex flex-col col-span-1">
                                <h2 class="text-xl font-bold mb-2 text-gray-800">🏆 Leaderboard</h2>
                                <div v-if="leaderboardLoading" class="text-xs text-gray-500">Loading...</div>
                                <div v-else-if="leaderboardError" class="text-xs text-red-500">{{ leaderboardError }}</div>
                                <div v-else>
                                    <ol v-if="topLeaderboard.length" class="space-y-1">
                                        <li v-for="(entry, i) in topLeaderboard" :key="entry.id" class="flex items-center justify-between">
                                            <span>
                                                <span v-if="i === 0" class="mr-1">🥇</span>
                                                <span v-else-if="i === 1" class="mr-1">🥈</span>
                                                <span v-else-if="i === 2" class="mr-1">🥉</span>
                                                {{ entry.display_name }} <span v-if="entry.you" class="text-xs text-gray-500">(You)</span>
                                            </span>
                                            <span class="font-semibold text-green-700">{{ entry.total_points }}</span>
                                        </li>
                                    </ol>
                                    <div v-else class="text-xs text-muted-foreground">No data yet.</div>
                                </div>
                        </div>
        </div>

        <!-- Badges row -->
                <div class="mt-8">
                    <h2 class="text-lg font-bold mb-3 text-gray-800 flex items-center gap-2">Your Badges</h2>
                    <div v-if="badgesLoading" class="text-xs text-gray-500">Loading badges...</div>
                    <div v-else-if="badgesError" class="text-xs text-red-500">{{ badgesError }}</div>
                    <div v-else-if="!badges.length" class="text-xs text-muted-foreground">No badges yet. Start logging activities!</div>
                    <div v-else class="flex flex-wrap gap-4">
                        <div v-for="b in badges" :key="b.badge_id" class="flex flex-col items-center bg-gray-100 rounded-lg px-4 py-2 shadow" :title="b.description || ''">
                            <span class="text-3xl">{{ b.icon || '🏅' }}</span>
                            <span class="mt-1 text-sm font-medium">{{ b.name }}</span>
                        </div>
                    </div>
                </div>
    </div>
</template>