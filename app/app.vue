<!--
  Root Application Component - Greensteps
  
  Main app component that renders the Nuxt layout and page system.
  Includes global toast notifications via vue-sonner.
-->
<script setup lang="ts">
// Toaster component for notifications
import { Toaster } from "@/components/ui/sonner";

// Stylesheet for the toaster component
import "vue-sonner/style.css";
</script>

<template>
    <Toaster />
    
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
</template>
