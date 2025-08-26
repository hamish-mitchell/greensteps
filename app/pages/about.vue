<template>
  <div class="antialiased bg-body font-body h-screen w-screen">
    <!-- Header section -->
    <section class="relative bg-teal-900">
      <nav class="py-6">
        <div class="container mx-auto px-4">
          <div class="relative flex items-center justify-between">
            <!-- Logo -->
            <NuxtLink to="/" class="inline-block">
              <img class="h-8 text-white" src="/images/the-asset.svg" alt="Greensteps" >
            </NuxtLink>

            <!-- Desktop menu -->
            <ul class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden md:flex">
              <li class="mr-8"><NuxtLink class="inline-block text-white hover:text-lime-500 font-medium" to="#">About us</NuxtLink></li>
              <li class="mr-8"><NuxtLink class="inline-block text-white hover:text-lime-500 font-medium" to="pricing">Pricing</NuxtLink></li>

            </ul>
          </div>
        </div>
      </nav>
      <!-- Mobile Menu Button -->
      <button
        class="md:hidden p-2 rounded hover:bg-gray-200"
        @click="mobileNavOpen = !mobileNavOpen">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path
stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <!-- Mobile Menu -->
      <div
        v-if="mobileNavOpen"
        class="md:hidden px-4 pb-4 space-y-2 border-b"
      >
        <NuxtLink to="/" class="block hover:underline">Home</NuxtLink>
        <NuxtLink to="#" class="block hover:underline">About</NuxtLink>
        <NuxtLink to="pricing" class="block hover:underline">Pricing</NuxtLink>
      </div>

      <!-- Hero Section -->
      
        <div class="container mx-auto px-4 py-20 text-center">
          <h1 class="text-4xl font-bold mb-4 text-white">Welcome to GreenSteps</h1>
          <p class="max-w-xl mx-auto text-lg text-white mb-6">
            We track carbon emissions - turning insights into actions.
          </p>
          <div>
            <button class="items-center justify-center text-lg font-medium text-white hover:text-[#012606] border border-[#00a34a] hover:border-[#36e26a] bg-[#00a34a] hover:bg-[#36e26a] rounded-full transition duration-200">
            <NuxtLink
              to=""
              class="inline-block px-6 py-3"
            >
              Sign Up
            </NuxtLink>
            </button>
          </div>
        </div>
      </section>


      <!-- Example Content Section -->
      <section id="services" class="py-16 bg-white">
        <div class="container mx-auto px-4">
          <h2 class="text-3xl font-semibold text-center mb-12 text-[#012606]">Our Services</h2>
          <div class="grid md:grid-cols-3 gap-8">
            <div class="p-6 bg-gray-50 rounded-lg shadow hover:shadow-lg transition">
              <img src="/images/calculate.svg" alt="icon"></img>
              <h3 class="text-xl font-medium mb-2 text-[#012606]">Track Your Progress</h3>
              <p class="text-[#00a34a]">
                Track your carbon footprint 
              </p>
            </div>
            <div class="p-6 bg-gray-50 rounded-lg shadow hover:shadow-lg transition">
              <img src="/images/gem.svg" alt="icon"></img>
              <h3 class="text-xl font-medium mb-2 text-[#012606]">Earn Points</h3>
              <p class="text-[#00a34a]">
                Earn in-game points as you reduce your carbon footprint.
              </p>
            </div>
            <div class="p-6 bg-gray-50 rounded-lg shadow hover:shadow-lg transition">
              <img src="/images/game.svg" alt="icon"></img>
              <h3 class="text-xl font-medium mb-2 text-[#012606]">Play the Game</h3>
              <p class="text-[#00a34a]">
                Use those points in our game: Treetop Towers.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const mobileNavOpen = ref(false)
</script>

<style scoped>
/* Add any additional custom styles here */
</style>
