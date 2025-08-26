<template>
  <div class="antialiased bg-body h-screen overflow-hidden">
    <div class="h-full">
      <div class="h-full">
        <section class="relative bg-teal-900 h-full">
          <img class="absolute top-0 left-0 w-full h-full" src="/fauna-assets/headers/bg-waves.png" alt="" >
          <nav class="py-6">
            <div class="container mx-auto px-4">
              <div class="relative flex items-center justify-between">
                <!-- Logo -->
                <NuxtLink to="/" class="inline-block">
                  <img class="h-8 text-white" src="/images/the-asset.svg" alt="Greensteps" >
                </NuxtLink>
                <div class="lg:hidden">
                  <button class="navbar-burger flex items-center text-primary p-3">
                    <svg class="block h-4 w-4 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <title>Mobile menu</title>
                      <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
                    </svg>
                  </button>
                </div>
                <ul class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden md:flex">
                  <li class="mr-8">
                    <NuxtLink class="inline-block text-white hover:text-lime-500 font-medium" to="about">About us
                    </NuxtLink>
                  </li>
                  <li class="mr-8">
                    <NuxtLink class="inline-block text-white hover:text-lime-500 font-medium" to="#">Pricing
                    </NuxtLink>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
          <div class="container mx-auto px-4">
            <div class="max-w-5xl mx-auto">
              <div class="text-center py-20">
                <div class="max-w-2xl mx-auto mb-8">
                  <h1 class="text-4xl lg:text-5xl text-white font-bold mt-4 mb-6">
                    GreenSteps
                  </h1>
                  <p class="text-lg text-white text-body">
                    Helping you help the planet
                  </p>
                </div>
              </div>
            </div>
          </div>
          <section class="flex justify-center">
            <div class="text-center font-bold flex items-center justify-center text-[150pt] text-white/40">
              <p>
                <strong>It's Free.</strong> 
              </p>
            </div>
          </section>
        </section>
      </div>
    </div>
  </div>
</template>