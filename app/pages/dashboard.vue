<script setup lang="ts">
import { Plus } from 'lucide-vue-next';

definePageMeta({
    layout: "app-shell",
    tagline: "Overview of your impact and progress.",
});

const supabase = useSupabaseClient();
const user = useSupabaseUser();

const username = ref("");
const streak = ref(0)

if (user.value?.id) {
    const userId = user.value.id;

    const { data } = await supabase
        .from("profiles")
        .select("current_streak")
        .eq("id", userId)
        .single<{ current_streak: number }>();

    username.value = user.value.identities[0]?.identity_data.display_name || "";
    streak.value = data?.current_streak || 0;

    await supabase.rpc('update_streak');
}
</script>

<template>
    <div>
        <div class="w-full px-4 flex justify-between">
            <div>
                <h1 class="text-2xl font-bold">Welcome back, {{ username }}!</h1>
                <p class="text-gray-600">🔥 You've got a streak of {{ streak }} day<span
                        v-if="streak !== 1">s</span><span v-if="streak > 7">!</span><span v-else>.</span></p>
            </div>

            <Button>
                <Plus /> New Activity
            </Button>
        </div>
        <div class="grid auto-rows-min gap-4 md:grid-cols-4 mt-4">
            <div class="aspect-video w-full bg-muted rounded-lg" />
            <div class="aspect-video w-full bg-muted rounded-lg" />
            <div class="aspect-video w-full bg-muted rounded-lg" />
            <div class="aspect-video w-full bg-muted rounded-lg" />
        </div>
    </div>
</template>