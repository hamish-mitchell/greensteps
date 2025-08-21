<template>
  <div class="antialiased bg-body text-body font-body">
    <div>
      <div>
        <section class="overflow-hidden">
          <nav class="mx-4 py-6 border-b">
            <div class="container mx-auto px-4">
              <div class="relative flex items-center justify-between">
                <NuxtLink class="inline-block" to="/">
                  <img class="h-8 lg:h-10" src="#" alt="" >
                </NuxtLink>
                <div class="lg:hidden">
                  <button class="navbar-burger flex items-center text-primary p-3">
                    <svg
class="block h-4 w-4" fill="currentColor" viewBox="0 0 20 20"
                         xmlns="http://www.w3.org/2000/svg">
                      <title>Mobile menu</title>
                      <path
fill-rule="evenodd"
                            d="M3 5h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2z"
                            clip-rule="evenodd"/>
                    </svg>
                  </button>
                </div>
                <ul class="hidden lg:flex lg:items-center lg:ml-auto lg:space-x-10">
                  <li><NuxtLink class="text-sm text-body font-medium hover:text-gray-900" to="#">Product</NuxtLink></li>
                  <li><NuxtLink class="text-sm text-body font-medium hover:text-gray-900" to="#">Features</NuxtLink></li>
                  <li><NuxtLink class="text-sm text-body font-medium hover:text-gray-900" to="#">Pricing</NuxtLink></li>
                  <li><NuxtLink class="text-sm text-body font-medium hover:text-gray-900" to="#">Resources</NuxtLink></li>
                </ul>
                <div class="hidden lg:block lg:ml-6">
                  <NuxtLink class="text-sm font-medium text-primary hover:text-indigo-700" to="#">Sign In</NuxtLink>
                  <NuxtLink
class="ml-4 text-sm font-medium text-white bg-primary hover:bg-indigo-700 px-4 py-2 rounded"
                            to="#">Sign Up</NuxtLink>
                </div>
              </div>
            </div>
          </nav>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
/* Add local styles here if needed */
</style>
