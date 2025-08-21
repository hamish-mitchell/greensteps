<script setup lang="ts">
definePageMeta({
    layout: "app-shell",
    tagline: "Tips & Tricks to help you help the planet.",
});
</script>

<template>
    <div>
        <NuxtTime :datetime="Date.now()" />
    </div>
</template>
