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
const username = computed(() =>
  (user.value?.user_metadata as UserMetadata)?.full_name ||
  user.value?.email?.split("@")[0] ||
  ""
);

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
    <div class="grid auto-rows-min gap-4 md:grid-cols-4 mt-4">
      <div class="aspect-video w-full bg-muted rounded-lg" />
      <div class="aspect-video w-full bg-muted rounded-lg" />
      <div class="aspect-video w-full bg-muted rounded-lg" />
      <div class="aspect-video w-full bg-muted rounded-lg" />
    </div>
  </div>
</template>