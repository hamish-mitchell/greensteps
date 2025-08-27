<script setup lang="ts">
import { Plus } from 'lucide-vue-next';
import { ref, computed, watch } from 'vue';

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

// Dummy leaderboard data
const leaderboard = [
    { name: "Alice", score: 120 },
    { name: "Bob", score: 110 },
    { name: "You", score: 100 },
    { name: "Charlie", score: 90 },
];

// Dummy badges TODO: make other later please
const badges = [
    { name: "Eco Starter", icon: "🌱" },
    { name: "Recycler", icon: "♻️" },
    { name: "Energy Saver", icon: "💡" },
    { name: "Water Wise", icon: "💧" },
    { name: "Streak Master", icon: "🔥" },
];
</script>

<template>
    <div>
        <div class="w-full px-4 flex justify-between">
            <div>
                <h1 class="text-2xl font-bold">Welcome back, {{ username }}!</h1>
                <p class="text-gray-600">{{ streakLabel }}</p>
            </div>
            <DashboardInputActivity>
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
                <div class="bg-green-100 rounded-lg p-4 flex flex-col items-center shadow">
                    <span class="text-3xl font-bold text-green-700">12.5kg</span>
                    <span class="text-green-800 mt-2 font-semibold">Emissions Saved</span>
                    <span class="text-xs text-green-600 mt-1">This month</span>
                </div>
                <!-- Sustainable Travel Card -->
                <div class="bg-blue-100 rounded-lg p-4 flex flex-col items-center shadow">
                    <span class="text-3xl font-bold text-blue-700">34km</span>
                    <span class="text-blue-800 mt-2 font-semibold">Sustainable Travel</span>
                    <span class="text-xs text-blue-600 mt-1">Walked, biked, or PT</span>
                </div>
                <!-- Items Recycled Card -->
                <div class="bg-yellow-100 rounded-lg p-4 flex flex-col items-center shadow">
                    <span class="text-3xl font-bold text-yellow-700">18</span>
                    <span class="text-yellow-800 mt-2 font-semibold">Items Recycled</span>
                    <span class="text-xs text-yellow-600 mt-1">Plastic, paper, etc.</span>
                </div>
                <!-- Energy Saved Card -->
                <div class="bg-purple-100 rounded-lg p-4 flex flex-col items-center shadow">
                    <span class="text-3xl font-bold text-purple-700">22kWh</span>
                    <span class="text-purple-800 mt-2 font-semibold">Energy Saved</span>
                    <span class="text-xs text-purple-600 mt-1">Lights off, efficient use</span>
                </div>
                <!-- Water Saved Card -->
                <div class="bg-cyan-100 rounded-lg p-4 flex flex-col items-center shadow">
                    <span class="text-3xl font-bold text-cyan-700">150L</span>
                    <span class="text-cyan-800 mt-2 font-semibold">Water Saved</span>
                    <span class="text-xs text-cyan-600 mt-1">Shorter showers, reuse</span>
                </div>
                <!-- Quests Done Card -->
                <div class="bg-pink-100 rounded-lg p-4 flex flex-col items-center shadow">
                    <span class="text-3xl font-bold text-pink-700">5</span>
                    <span class="text-pink-800 mt-2 font-semibold">Quests Done</span>
                    <span class="text-xs text-pink-600 mt-1">Keep up the good work!</span>
                </div>
            </div>
            <!-- Leaderboard card (spans 1 column on large screens, full width on mobile) -->
            <div class="bg-white rounded-lg p-4 shadow flex flex-col col-span-1">
                <h2 class="text-xl font-bold mb-2 text-gray-800">🏆 Leaderboard</h2>
                <ol class="space-y-1">
                    <li v-for="(entry, i) in leaderboard" :key="entry.name" class="flex items-center justify-between">
                        <span>
                            <span v-if="i === 0" class="mr-1">🥇</span>
                            <span v-else-if="i === 1" class="mr-1">🥈</span>
                            <span v-else-if="i === 2" class="mr-1">🥉</span>
                            {{ entry.name }}
                        </span>
                        <span class="font-semibold text-green-700">{{ entry.score }}</span>
                    </li>
                </ol>
            </div>
        </div>

        <!-- Badges row -->
        <div class="mt-8">
            <h2 class="text-lg font-bold mb-3 text-gray-800">Your Badges</h2>
            <div class="flex flex-wrap gap-4">
                <div
                    v-for="badge in badges"
                    :key="badge.name"
                    class="flex flex-col items-center bg-gray-100 rounded-lg px-4 py-2 shadow"
                >
                    <span class="text-3xl">{{ badge.icon }}</span>
                    <span class="mt-1 text-sm font-medium">{{ badge.name }}</span>
                </div>
            </div>
        </div>
    </div>
</template>