<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
    <!-- Landing page content -->
    <div class="container mx-auto px-4 py-16">
      <div class="text-center max-w-4xl mx-auto">
        <!-- Hero Section -->
        <div class="mb-16">
          <h1 class="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Track Your <span class="text-primary">Carbon Footprint</span>
          </h1>
          <p class="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Take control of your environmental impact with GreenSteps. 
            Monitor emissions, complete eco-friendly quests, and compete with friends 
            to build a more sustainable future.
          </p>
          
          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink 
              to="/login" 
              class="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Get Started
            </NuxtLink>
            <NuxtLink 
              to="/dashboard" 
              class="border border-border hover:bg-accent hover:text-accent-foreground px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              View Dashboard
            </NuxtLink>
          </div>
        </div>

        <!-- Features Section -->
        <div class="grid md:grid-cols-3 gap-8 mb-16">
          <div class="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Track Emissions</h3>
            <p class="text-muted-foreground">
              Monitor your carbon footprint across transportation, food, energy, and waste categories.
            </p>
          </div>

          <div class="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Complete Quests</h3>
            <p class="text-muted-foreground">
              Take on eco-friendly challenges and earn badges while reducing your environmental impact.
            </p>
          </div>

          <div class="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Compete with Friends</h3>
            <p class="text-muted-foreground">
              Join the leaderboard, share your progress, and motivate each other to go green.
            </p>
          </div>
        </div>

        <!-- Stats Section -->
        <div class="bg-card border border-border rounded-lg p-8 shadow-sm">
          <h2 class="text-2xl font-bold mb-4">Join the Movement</h2>
          <p class="text-muted-foreground mb-6">
            Be part of a growing community committed to environmental sustainability
          </p>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-primary">1000+</div>
              <div class="text-sm text-muted-foreground">Users Tracking</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-primary">50k+</div>
              <div class="text-sm text-muted-foreground">CO₂ Saved (kg)</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-primary">2000+</div>
              <div class="text-sm text-muted-foreground">Quests Completed</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-primary">95%</div>
              <div class="text-sm text-muted-foreground">User Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>