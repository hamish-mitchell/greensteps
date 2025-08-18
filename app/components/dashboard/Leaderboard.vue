<template>
  <Card class="flex flex-col">
    <CardHeader>
      <div class="flex justify-between items-center">
        <CardTitle class="text-lg font-bold">{{ title }}</CardTitle>
        <Tabs default-value="friends" class="text-sm">
          <TabsList class="grid w-full grid-cols-2">
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="regional">Regional</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </CardHeader>
    <CardContent class="flex-grow overflow-hidden">
      <Tabs default-value="friends">
        <TabsContent value="friends" class="h-full">
          <!-- DUMMY DATA: User data is passed via the 'users' prop -->
          <div class="space-y-3 custom-scrollbar pr-2" style="max-height: 440px; overflow-y: auto;">
            <div
              v-for="user in users"
              :key="user.rank"
              class="flex items-center justify-between rounded-lg p-3"
              :class="{
                'border-2 border-yellow-300 bg-yellow-50': user.rank === 1,
                'border-2 border-primary bg-primary/10': user.name === currentUser,
                'bg-muted/50': user.rank > 1 && user.name !== currentUser
              }"
            >
              <div class="flex items-center gap-4">
                <span class="text-lg font-bold w-4 text-center" :class="{'text-yellow-500': user.rank === 1, 'text-primary': user.name === currentUser, 'text-muted-foreground': user.rank > 1}">
                  {{ user.rank }}
                </span>
                <Avatar>
                  <AvatarImage :src="user.avatarUrl" :alt="user.name" />
                  <AvatarFallback>{{ user.name.slice(0, 2) }}</AvatarFallback>
                </Avatar>
                <div>
                  <p class="font-semibold">
                    {{ user.name }}
                    <span v-if="user.name === currentUser" class="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">You</span>
                  </p>
                  <p class="text-sm text-muted-foreground">{{ user.points }}</p>
                </div>
              </div>
              <Trophy v-if="user.rank === 1" class="h-6 w-6 text-yellow-400" />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="regional">
            <p class="text-center text-muted-foreground p-8">Regional leaderboard coming soon.</p>
        </TabsContent>
      </Tabs>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Trophy } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

defineProps({
  title: String,
  currentUser: String,
  users: {
    type: Array as () => Array<{ rank: number; name: string; points: string; avatarUrl: string }>,
    default: () => []
  }
})
</script>

<style scoped>
/* Simple scrollbar styling for webkit browsers */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground));
}
</style>