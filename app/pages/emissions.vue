<script setup lang="ts">
definePageMeta({
    layout: "app-shell",
    tagline: "emissions",
});

import Card from '~/components/ui/card/Card.vue'
import Input from '~/components/ui/input/Input.vue'
import Button from '~/components/ui/button/Button.vue'

import { ref } from 'vue'

const distanceDriven = ref('')
const waterUsed = ref('')
const foodEaten = ref('')
const electricityUsed = ref('')
</script>

<template>
  <div class="flex justify-center items-center min-h-[80vh]">
    <Card class="w-full max-w-md p-8 space-y-6">
      <h2 class="text-2xl font-bold mb-4">Enter Emissions Data</h2>
      <form @submit.prevent>
        <div class="mb-4">
          <label class="block mb-1 font-medium">Distance Driven (km)</label>
          <Input v-model="distanceDriven" type="number" placeholder="e.g. 15" />
        </div>
        <div class="mb-4">
          <label class="block mb-1 font-medium">Water Used (litres)</label>
          <Input v-model="waterUsed" type="number" placeholder="e.g. 120" />
        </div>
        <div class="mb-4">
          <label class="block mb-1 font-medium">Food Eaten (servings)</label>
          <Input v-model="foodEaten" type="number" placeholder="e.g. 3" />
        </div>
        <div class="mb-4">
          <label class="block mb-1 font-medium">Electricity Used (kWh)</label>
          <Input v-model="electricityUsed" type="number" placeholder="e.g. 5" />
        </div>
        <Button type="submit" class="w-full">Submit</Button>
      </form>
    </Card>
  </div>
</template>
