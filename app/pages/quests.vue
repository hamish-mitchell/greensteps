<script setup lang="ts">
definePageMeta({
    layout: "app-shell",
    tagline: "Complete quests to earn points and grow your streak",
});

const supabase = useSupabaseClient();
const user = useSupabaseUser();

interface Quest {
    id: number;
    name: string;
    description: string;
    category: string;
    min_value: number;
    max_value: number;
}

interface UserQuest {
    id: number;
    user_id: string;
    quest_id: number;
    value: number;
    progress: number;
    created_at?: string;
}

const quests = ref<Quest[]>([])
const activeQuests = ref<UserQuest[]>([])
const completedQuests = ref<UserQuest[]>([])

const {data} = await supabase
    .from("quests")
    .select("*")

let activeQuestsData: UserQuest[] | null = [];
if (user.value?.id) {
    const { data: fetchedActive } = await supabase
        .from("user_quests")
        .select("*")
        .eq("user_id", user.value.id);
    activeQuestsData = fetchedActive;
}

quests.value = data || [];
activeQuests.value = activeQuestsData?.filter(quest => quest.progress < quest.value) || [];
completedQuests.value = activeQuestsData?.filter(quest => quest.progress >= quest.value) || [];

async function startQuest(questId: number) {
    if (!user.value?.id) return;

    const userId = user.value.id;
    const quest = quests.value[questId - 1]

    const { error } = await supabase
        .from("user_quests")
        // @ts-expect-error Supabase doesn't like unknown types, but this is fine
        .insert({ user_id: userId, quest_id: quest.id, value: quest.min_value, progress: 0 });

    if (error) {
        console.error("Error starting quest:", error.message);
    } else {
        alert(`Quest "${quest!.name}" started!`);
    }
}
</script>

<template>
    <div>
        <div class="grid auto-rows-min gap-4 md:grid-cols-3">
            <div class="gap-4 flex flex-col">
                <Button v-for="quest in quests" :key="quest.id" @click="startQuest(quest.id)">Start Quest "{{ quest.name }}"</Button>
                <div class="mt-4">
                    <h2 class="font-bold">Active Quests</h2>
                    <p class="font-mono">{{ activeQuests }}</p>
                </div>
                <div class="mt-4">
                    <h2 class="font-bold">Completed Quests</h2>
                    <p class="font-mono">{{ completedQuests }}</p>
                </div>
            </div>
        </div>
    </div>
</template>
