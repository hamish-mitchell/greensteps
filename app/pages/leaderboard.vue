<script setup lang="ts">
definePageMeta({
  layout: "app-shell",
  tagline: "See how you stack up against the competition."
})

import { ref, computed } from 'vue'

import Card from '~/components/ui/card/Card.vue'
import Button from '~/components/ui/button/Button.vue'
import Badge from '~/components/ui/badge/Badge.vue'
import Avatar from '~/components/ui/avatar/Avatar.vue'
import AvatarImage from '~/components/ui/avatar/AvatarImage.vue'
import AvatarFallback from '~/components/ui/avatar/AvatarFallback.vue'
import Separator from '~/components/ui/separator/Separator.vue'

type Player = {
  id: number
  name: string
  avatar?: string
  points: number
  rank?: number
  status?: string // e.g. "You"
}

type Scope = 'friends' | 'regional' | 'global'
const scope = ref<Scope>('friends')

const basePlayers: Player[] = [
  { id: 1, name: 'Jane Doe', points: 18340 },
  { id: 2, name: 'John Doe', points: 12425, status: 'You' },
  { id: 3, name: 'Alex Smith', points: 10250 },
  { id: 4, name: 'Emily White', points: 9875 },
  { id: 5, name: 'Chris Lee', points: 9450 },
  { id: 6, name: 'Sarah Chen', points: 9100 },
  { id: 7, name: 'David Kim', points: 8800 },
  { id: 8, name: 'Lisa Wong', points: 8720 },
  { id: 9, name: 'Brian Smith', points: 8590 },
  { id:10, name: 'Nancy Green', points: 8225 }
]

const leaderboards: Record<Scope, Player[]> = {
  friends: basePlayers,
  regional: basePlayers.map(p => ({ ...p, points: Math.round(p.points * 1.1) })),
  global: basePlayers.map(p => ({ ...p, points: Math.round(p.points * 1.27) }))
}

const players = computed(() => {
  const list = [...leaderboards[scope.value]].sort((a,b)=> b.points - a.points)
  return list.map((p,i)=> ({ ...p, rank: i+1 }))
})

const top3 = computed(() => players.value.slice(0,3))
const rest = computed(() => players.value.slice(3))

function setScope(s: Scope) { scope.value = s }

function initials(name: string) {
  return name.split(' ').map(p=>p[0]).join('').slice(0,2)
}

function formatPts(n: number) {
  return n.toLocaleString() + ' pts'
}
</script>

<template>
  <div class="flex flex-col h-full max-h-full">
    <!-- Single breadcrumb (optional) -->
    <div class="mb-4">
      <div class="text-xs text-muted-foreground">Leaderboard</div>
    </div>

    <div class="overflow-y-auto pr-2 custom-scroll space-y-6" style="max-height: calc(100vh - 140px)">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl font-semibold tracking-tight">Leaderboard</h1>
          <p class="text-sm text-muted-foreground">See how you stack up against the competition.</p>
        </div>
        <div class="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            :class="scope==='friends' && 'bg-primary text-primary-foreground'"
            @click="setScope('friends')"
          >Friends</Button>
          <Button
            size="sm"
            variant="outline"
            :class="scope==='regional' && 'bg-primary text-primary-foreground'"
            @click="setScope('regional')"
          >Regional</Button>
            <Button
            size="sm"
            variant="outline"
            :class="scope==='global' && 'bg-primary text-primary-foreground'"
            @click="setScope('global')"
          >Global</Button>
        </div>
      </div>

      <!-- Rankings Card -->
      <Card class="p-6 space-y-6">
        <h2 class="text-sm font-medium">Rankings</h2>

        <!-- Podium -->
        <div class="w-full flex flex-col gap-10 md:flex-row md:justify-between md:gap-24 items-start">
          <div
            v-for="p in top3"
            :key="p.id"
            class="flex flex-col items-center text-center flex-1"
          >
            <div
              class="podium-base relative flex items-center justify-center rounded-full h-28 w-28 md:h-32 md:w-32"
              :class=" [
                p.rank===1 && 'podium-gold',
                p.rank===2 && 'podium-silver',
                p.rank===3 && 'podium-bronze'
              ]"
            >
              <Avatar class="h-24 w-24 md:h-28 md:w-28">
                <AvatarImage :src="p.avatar ?? ''" />
                <AvatarFallback>{{ initials(p.name) }}</AvatarFallback>
              </Avatar>
              <div
                class="absolute -top-3 -right-3 h-8 w-8 flex items-center justify-center rounded-full text-xs font-bold text-white shadow"
                :class=" [
                  p.rank===1 && 'bg-yellow-400',
                  p.rank===2 && 'bg-slate-400',
                  p.rank===3 && 'bg-amber-700'
                ]"
              >{{ p.rank }}</div>
            </div>
            <div class="mt-4 flex items-center gap-2">
              <span class="text-sm font-medium">{{ p.name }}</span>
              <Badge
                v-if="p.status"
                variant="secondary"
                class="text-[10px] px-2 py-0.5 leading-none"
              >{{ p.status }}</Badge>
            </div>
            <div class="text-[11px] text-muted-foreground">{{ formatPts(p.points) }}</div>
          </div>
        </div>

        <Separator />

        <!-- Remaining ranks -->
        <div class="rounded-md border overflow-hidden">
          <ul>
            <li
              v-for="p in rest"
              :key="p.id"
              class="flex items-center gap-4 px-4 py-2 text-sm hover:bg-muted/50 transition-colors border-b last:border-b-0"
            >
              <span class="w-6 text-xs font-semibold text-muted-foreground">{{ p.rank }}</span>
              <Avatar class="h-8 w-8 shrink-0">
                <AvatarImage :src="p.avatar ?? ''" />
                <AvatarFallback>{{ initials(p.name) }}</AvatarFallback>
              </Avatar>
              <div class="flex flex-col flex-1">
                <span class="font-medium leading-tight">{{ p.name }}</span>
                <span class="text-[10px] text-muted-foreground">{{ formatPts(p.points) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <Badge v-if="p.status" variant="outline" class="text-[10px]">{{ p.status }}</Badge>
                <Button size="sm" variant="ghost" class="h-7 text-xs px-2">View Profile</Button>
              </div>
            </li>
          </ul>
        </div>
      </Card>
    </div>
  </div>
</template>

<style scoped>
/* Metallic podium effects */
.podium-base {
  position: relative;
  isolation: isolate;
}

/* Shared glossy sheen */
.podium-base::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background:
    linear-gradient(150deg,
      rgba(255,255,255,.65) 0%,
      rgba(255,255,255,.25) 25%,
      rgba(255,255,255,0) 55%,
      rgba(255,255,255,.35) 72%,
      rgba(255,255,255,0) 100%);
  mix-blend-mode: screen;
  pointer-events: none;
}

/* Gradient ring border using mask (Chrome/Edge/Safari) */
.podium-gold::before,
.podium-silver::before,
.podium-bronze::before {
  content: "";
  position: absolute;
  inset: -6px;
  padding: 6px;
  border-radius: 9999px;
  background: conic-gradient(
    from 10deg,
    var(--c1),
    var(--c2),
    var(--c3),
    var(--c2),
    var(--c1)
  );
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
  filter: saturate(1.15);
  pointer-events: none;
}

.podium-gold { --c1:#fff7d1; --c2:#f5c842; --c3:#d49a15; }
.podium-silver { --c1:#f5f7fa; --c2:#d0d7e2; --c3:#8f97a3; }
.podium-bronze { --c1:#ffe3c2; --c2:#d28a36; --c3:#8b5520; }

/* Subtle rotating shimmer (optional) */
@keyframes spinShine {
  to { transform: rotate(360deg); }
}
.podium-base::before {
  animation: spinShine 6s linear infinite;
  animation-play-state: paused; /* hover to animate */
}
.podium-base:hover::before {
  animation-play-state: running;
}

.custom-scroll::-webkit-scrollbar {
  width: 8px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: hsl(var(--muted));
  border-radius: 4px;
}
.custom-scroll:hover::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
}
</style>
