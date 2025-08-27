<template>
  <div class="antialiased bg-body font-body overflow-hidden h-screen w-screen">

    <!-- Header section -->
    <section class="relative bg-teal-900">
      <img class="absolute top-0 left-0 w-full h-full" src="/images/lines.svg" alt="">
      <nav class="py-6">
        <div class="container mx-auto px-4">
          <div class="relative flex items-center justify-between">
            <!-- Logo -->
            <NuxtLink to="#" class="inline-block">
              <img class="h-8 text-white" src="/images/the-asset.svg" alt="Greensteps">
            </NuxtLink>

            <!-- Desktop menu -->
            <ul class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden md:flex">
              <li class="mr-8">
                <NuxtLink class="inline-block text-white hover:text-lime-500 font-medium" to="about">About us</NuxtLink>
              </li>
              <li class="mr-8">
                <NuxtLink class="inline-block text-white hover:text-lime-500 font-medium" to="pricing">Pricing
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <!-- Hero -->
      <div class="relative pt-18 pb-24 sm:pb-32 lg:pt-36 lg:pb-62">
        <div class="container mx-auto px-4 relative">
          <div class="max-w-lg xl:max-w-xl mx-auto text-center">
            <h1 class="font-heading text-5xl xs:text-7xl xl:text-8xl tracking-tight text-white mb-8">
              GreenSteps
            </h1>
            <p class="max-w-md xl:max-w-none text-lg text-white  mb-10">
              Inspiring a greener <strong>world</strong>, a greener <strong>everyone</strong>, and a greener
              <strong>you</strong>.
            </p>
            <NuxtLink to="#"
              class="inline-flex py-4 px-6 items-center justify-center text-lg font-medium text-white hover:text-[#012606] border border-[#00a34a] hover:border-[#36e26a] bg-[#00a34a] hover:bg-[#36e26a] rounded-full transition duration-200">
              Sign Up - It's free!
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Mobile menu -->
    <div :class="{ 'block': mobileNavOpen, 'hidden': !mobileNavOpen }"
      class="hidden fixed top-0 left-0 bottom-0 w-full xs:w-5/6 xs:max-w-md z-50">
      <div class="fixed inset-0 bg-violet-900 opacity-20" @click="mobileNavOpen = !mobileNavOpen" />
      <nav class="relative flex flex-col py-7 px-10 w-full h-full bg-white overflow-y-auto">
        <div class="flex items-center justify-between">
          <NuxtLink to="#" class="inline-block">
            <img class="h-8" src="/images/the-asset.svg" alt="">
          </NuxtLink>
          <div class="flex items-center">
            <NuxtLink to="#"
              class="inline-flex py-2.5 px-4 mr-6 items-center justify-center text-sm font-medium text-teal-900 hover:text-white border border-teal-900 hover:bg-teal-900 rounded-full transition duration-200">
              Login
            </NuxtLink>
            <button @click="mobileNavOpen = !mobileNavOpen">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M23.2 8.79999L8.80005 23.2M8.80005 8.79999L23.2 23.2" stroke="#1D1F1E" stroke-width="1.5"
                  stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const mobileNavOpen = ref(false)
</script>