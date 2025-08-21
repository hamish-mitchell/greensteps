<script setup lang="ts">
definePageMeta({ layout: "app-shell", tagline: "Complete quests to earn points and grow your streak" });
const progress = ref(0);
</script>

<template>
    <div>
        <div class="grid auto-rows-min gap-4 md:grid-cols-3">
            <div class="gap-4 flex flex-col">
                <Button class="w-full" @click="progress++">start quest</Button>
                <Progress :model-value="progress" />
            </div>
        </div>
    </div>
</template>
