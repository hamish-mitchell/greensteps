<template>
  <!-- The root element is now a simple div, styling is passed from the parent -->
  <div class="overflow-hidden h-full w-full">
    <ResizablePanelGroup direction="horizontal" class="h-full items-stretch">
      <!-- Desktop Sidebar -->
      <ResizablePanel
        :default-size="defaultSize"
        :min-size="minSize"
        :max-size="20"
        :class="cn('hidden md:block transition-all duration-300 ease-in-out', isCollapsed && 'min-w-[50px]')"
        class="!overflow-visible"
      >
        <div class="flex h-full flex-col gap-2 p-4 pt-6">
          <div :class="cn('flex items-center', isCollapsed ? 'h-9 justify-center' : 'justify-between')">
            <NuxtLink v-if="!isCollapsed" :to="navLinks[0]?.href || '/'" class="flex items-center gap-2 font-semibold">
              <span>{{ sidebar.title }}</span>
            </NuxtLink>
            <!-- NEW: Collapse toggle button -->
            <Button
              variant="ghost"
              size="icon"
              class="rounded-lg"
              @click="isCollapsed = !isCollapsed"
            >
              <ChevronsLeft :class="cn('h-5 w-5 transition-transform duration-300', isCollapsed && 'rotate-180')" />
            </Button>
          </div>
          <div class="flex-grow mt-4">
            <span v-if="!isCollapsed" class="px-4 text-xs font-semibold text-muted-foreground/70">{{ sidebar.menuTitle }}</span>
            <nav class="mt-2 grid items-start text-sm font-medium">
              <!-- DUMMY DATA: Sidebar links from JSON config -->
              <TooltipProvider v-for="link in navLinks" :key="link.href">
                <Tooltip :delay-duration="0">
                  <TooltipTrigger as-child>
                    <NuxtLink
                      :to="link.href"
                      :class="cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                        link.isActive && 'bg-muted text-primary',
                        isCollapsed && 'justify-center'
                      )"
                    >
                      <component :is="icons[link.icon]" class="h-5 w-5" />
                      <!-- NEW: Text is now conditional -->
                      <span v-if="!isCollapsed">{{ link.label }}</span>
                      <Badge v-if="link.badge && !isCollapsed" class="ml-auto">
                        {{ link.badge }}
                      </Badge>
                    </NuxtLink>
                  </TooltipTrigger>
                  <!-- NEW: Tooltip for collapsed state -->
                  <TooltipContent side="right" :side-offset="5">
                    {{ link.label }}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </nav>
          </div>
          <!-- NEW: Rewards card is now conditional -->
          <div v-if="sidebar.rewardsCard && !isCollapsed" class="mt-auto p-0">
            <Card>
              <CardHeader class="p-2 pt-0 md:p-4">
                <CardTitle>{{ sidebar.rewardsCard.title }}</CardTitle>
                <CardDescription>{{ sidebar.rewardsCard.description }}</CardDescription>
              </CardHeader>
              <CardContent class="p-2 pt-0 md:p-4 md:pt-0">
                <Button size="sm" class="w-full">
                  {{ sidebar.rewardsCard.buttonText }}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </ResizablePanel>

      <ResizableHandle with-handle class="hidden md:flex" />

      <!-- Page Content -->
      <ResizablePanel :default-size="80" class="flex flex-col">
        <!-- Main Header -->
        <header class="flex h-20 items-center gap-4 px-4 md:px-6 shrink-0">
          <div>
            <h2 class="text-2xl font-bold">{{ header.title }}</h2>
            <p class="mt-1 text-sm text-muted-foreground">{{ header.subtitle }}</p>
          </div>
          
          <!-- Mobile Nav Trigger -->
          <Sheet>
            <SheetTrigger as-child>
              <Button variant="outline" size="icon" class="ml-auto md:hidden">
                <Menu class="h-5 w-5" />
                <span class="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" class="flex flex-col">
              <!-- Mobile nav content is the same as before -->
            </SheetContent>
          </Sheet>

          <!-- Header Right Side -->
          <div class="hidden md:flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <form class="ml-auto flex-1 sm:flex-initial">
              <div class="relative">
                <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search..." class="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]" />
              </div>
            </form>
            <div class="flex items-center gap-3">
              <Button variant="ghost" size="icon" class="rounded-full">
                <Bell class="h-5 w-5" />
              </Button>
              <div class="h-8 w-px bg-border"></div>
              <div class="flex items-center gap-3">
                <Avatar>
                  <AvatarImage :src="header.user.avatarUrl" :alt="header.user.name" />
                  <AvatarFallback>{{ header.user.name.charAt(0) }}</AvatarFallback>
                </Avatar>
                <div class="hidden sm:block">
                  <p class="text-sm font-semibold">{{ header.user.name }}</p>
                  <p class="text-xs text-muted-foreground">{{ header.user.points }}</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <main class="flex-1 overflow-y-auto p-8 pt-0 bg-muted/20">
            <slot />
        </main>
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import * as icons from 'lucide-vue-next'
import { Menu, Search, Bell, ChevronsLeft } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/utils/shadcn' // Assuming you have this from shadcn-vue setup

const props = defineProps({
  sidebar: Object,
  header: Object,
})

const navLinks = computed(() => props.sidebar?.navLinks || [])

// NEW: State for controlling sidebar collapse
const isCollapsed = ref(false)

// NEW: Dynamic sizes for the resizable panel
const defaultSize = computed(() => isCollapsed.value ? 4 : 20)
const minSize = computed(() => isCollapsed.value ? 4 : 15)
</script>