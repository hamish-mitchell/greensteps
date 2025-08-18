<template>
  <header class="flex h-24 flex-shrink-0 items-center justify-between border-b px-8">
    <div>
      <h2 class="text-2xl font-bold">{{ title }}</h2>
      <p class="mt-1 text-sm text-muted-foreground">{{ subtitle }}</p>
    </div>
    <div class="flex items-center gap-6">
      <div class="relative hidden md:block">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input type="text" placeholder="Search..." class="w-72 pl-11" />
      </div>
      <div class="flex items-center gap-3">
        <Button variant="ghost" size="icon">
          <Bell class="h-6 w-6 text-muted-foreground" />
        </Button>
        <div class="h-8 w-px bg-border"></div>
        <div class="flex items-center gap-3">
          <Avatar>
            <AvatarImage :src="user.avatarUrl" :alt="user.name" />
            <AvatarFallback>{{ user.name.charAt(0) }}</AvatarFallback>
          </Avatar>
          <div>
            <p class="text-sm font-semibold">{{ user.name }}</p>
            <p class="text-xs text-muted-foreground">{{ user.points }}</p>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import { Search, Bell } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

defineProps({
  title: String,
  subtitle: String,
  user: Object,
})
</script>