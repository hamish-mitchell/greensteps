<!--
  Tips Page - Environmental Education Content
  
  Displays curated environmental tips and educational articles.
  Features filtering by category and markdown content rendering.
-->
<script setup lang="ts">
// Page meta for SEO and layout
definePageMeta({
  layout: "app-shell",
  tagline: "Tips & Tricks to help you help the planet.",
})

import { ref, computed } from 'vue'
import { marked } from 'marked'

// UI Components
import Card from '~/components/ui/card/Card.vue'
import Button from '~/components/ui/button/Button.vue'
import Badge from '~/components/ui/badge/Badge.vue'
import Avatar from '~/components/ui/avatar/Avatar.vue'
import AvatarImage from '~/components/ui/avatar/AvatarImage.vue'
import AvatarFallback from '~/components/ui/avatar/AvatarFallback.vue'
import Separator from '~/components/ui/separator/Separator.vue'

interface Article {
  id: number
  title: string
  category: string
  excerpt: string
  author: { name: string; avatar?: string }
  slug: string
  raw: string
  html: string
}

const categories = [
  'All',
  'Transport',
  'Energy',
  'Zero-Waste',
  'Consumerism',
  'Water'
]

// Static hardcoded articles
const articles = ref<Article[]>([
  {
    id: 6,
    title: 'Lower Your Daily Commute Impact',
    category: 'Transport',
    excerpt: 'Practical ways to cut the emissions from getting to work or school.',
    author: { name: 'Ava Green', avatar: '/avatars/default-avatar.png' },
    slug: 'lower-your-daily-commute-impact',
    raw: `Swapping just one solo car trip a week for an active or public transport alternative meaningfully reduces your yearly footprint.\n\n- Batching errands onto one route.\n- Using a local car share instead of owning a second car.\n- Starting a workplace bike buddy system.\n\n> Progress beats perfection. Build one small habit and stack another next month.`,
    html: ''
  },
  {
    id: 5,
    title: 'Quick Wins for Home Energy',
    category: 'Energy',
    excerpt: 'Simple changes that trim kWh without large upfront cost.',
    author: { name: 'Liam Watt', avatar: '/avatars/default-avatar.png' },
    slug: 'quick-wins-home-energy',
    raw: `Cut standby waste first: plug strips, smart scheduling, and fill the kettle only with what you need.\n\n1. Drop hot water thermostat slightly (stay safe).\n2. Run full dishwasher / washing loads on eco.\n3. Seal obvious draughts.\n\nA cheap energy meter often reveals surprise idle hogs.`,
    html: ''
  },
  {
    id: 4,
    title: 'Zero-Waste Kitchen Starters',
    category: 'Zero-Waste',
    excerpt: 'Foundational swaps & habits to shrink kitchen waste quickly.',
    author: { name: 'Sofia Reuse', avatar: '/avatars/default-avatar.png' },
    slug: 'zero-waste-kitchen-starters',
    raw: `Focus on high‑frequency disposables first:\n\n- Swap paper towels for washable cloths.\n- Keep a freezer bag for veggie offcuts → stock.\n- Date leftovers with a pen on reusable lids.\n\nEven a ventilated countertop caddy reduces smells & trips.`,
    html: ''
  },
  {
    id: 3,
    title: 'Water Saving In 10 Minutes',
    category: 'Water',
    excerpt: 'Immediate tweaks to cut household water use.',
    author: { name: 'River Flow', avatar: '/avatars/default-avatar.png' },
    slug: 'water-saving-10-minutes',
    raw: `Install an efficient shower head, fix the drippy tap, and collect the first cold shower water for plants. Small, fast wins motivate bigger retrofits later.`,
    html: ''
  },
  {
    id: 2,
    title: 'Mindful Consumer Checklist',
    category: 'Consumerism',
    excerpt: 'A quick pre-purchase pause cuts impulse emissions.',
    author: { name: 'Calm Buyer', avatar: '/avatars/default-avatar.png' },
    slug: 'mindful-consumer-checklist',
    raw: `Before buying: Do I already have something that works? Will it last 3+ years? Can I borrow? Can I repair it? Will I still want it after a 7‑day wait?`,
    html: ''
  },
  {
    id: 1,
    title: 'Starter Sustainable Wins',
    category: 'General',
    excerpt: 'Low effort actions to build momentum.',
    author: { name: 'Green Start', avatar: '/avatars/default-avatar.png' },
    slug: 'starter-sustainable-wins',
    raw: `Pick ONE habit this week: bring a keep‑cup, prep two meat‑free meals, or set devices to auto sleep. Consistency compounds.`,
    html: ''
  }
])

// Pre-render HTML for each static article
articles.value.forEach(a => { a.html = marked.parse(a.raw) as string })

const selectedCategory = ref<string>('All')

// Computed filtered articles based on selected category
const filteredArticles = computed(() =>
  selectedCategory.value === 'All'
    ? articles.value
    : articles.value.filter(a => a.category === selectedCategory.value)
)

// Select category function
function selectCategory(cat: string) {
  selectedCategory.value = cat
}

const tipOfDay = ref({
  title: 'Create a windowsill herb garden.',
  body: 'Grow herbs at home to cut plastic packaging and transport emissions while keeping flavors fresh.',
  image: 'https://images.unsplash.com/photo-1524594154908-edd3327fb021?auto=format&fit=crop&w=800&q=60'
})

const expandedArticleId = ref<number | null>(null)

// Toggle expand article content
function toggleExpand(id: number) {
  expandedArticleId.value = expandedArticleId.value === id ? null : id
}

// Estimate read time based on content word count
function estimateReadTime(content?: string) {
  if (!content) return '1 min read'
  const words = content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.round(words / 200))
  return `${minutes} min read`
}

// Copy article link to clipboard
async function copyLink(id: number) {
  try {
    const url = `${window.location.origin}${window.location.pathname}#article-${id}`
    await navigator.clipboard.writeText(url)
    // Consider adding a toast/visual confirmation in your app shell
  } catch {
    // ignore
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-xl font-semibold tracking-tight">Tips & Tricks</h1>
        <p class="text-sm text-muted-foreground">Browse articles and daily tips to live more sustainably.</p>
      </div>
      <Button size="sm" class="whitespace-nowrap">
        + Submit a Tip
      </Button>
    </div>

    <div class="grid gap-8 lg:grid-cols-3">
      <!-- Main Articles Section -->
      <div class="lg:col-span-2 flex flex-col min-h-[60vh]">
        <h2 class="text-sm font-medium text-muted-foreground uppercase mb-2">Latest Articles</h2>
        <!-- Scrollable list -->
        <div class="space-y-3 overflow-y-auto pr-2 rounded-md scrollbar-hide" style="max-height: calc(100vh - 250px)" aria-label="Latest articles list">
          <div v-if="!filteredArticles.length" class="text-xs text-muted-foreground">No articles available.</div>
          <Card v-for="a in filteredArticles" :key="a.id" class="p-4 hover:bg-muted/40 transition cursor-pointer" :class="{ 'expanded-card': expandedArticleId === a.id }" @click="toggleExpand(a.id)">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div class="flex-1 space-y-1">
                <div class="flex items-center gap-2">
                  <Badge variant="outline" class="text-xs">{{ a.category }}</Badge>
                </div>
                <h3 class="font-semibold leading-snug">{{ a.title }}</h3>
                <p class="text-sm text-muted-foreground line-clamp-2">{{ a.excerpt }}</p>
                <transition name="fade">
                  <div v-if="expandedArticleId === a.id" class="mt-3 text-sm text-foreground">
                    <div v-if="a.html" class="prose max-w-none prose-table:table-auto prose-td:border prose-th:border prose-td:px-2 prose-th:px-2 prose-td:py-1 prose-th:py-1" v-html="a.html"></div>
                    <p v-else class="text-muted-foreground">No additional content available.</p>

                    <div class="flex items-center justify-between mt-3">
                      <div class="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>By <strong>{{ a.author.name }}</strong></span>
                        <span class="mx-1">•</span>
                        <span>{{ a.category }}</span>
                        <span class="mx-1">•</span>
                        <span>{{ estimateReadTime(a.raw) }}</span>
                      </div>

                      <div class="flex items-center gap-2">
                        <button
                          @click.stop="copyLink(a.id)"
                          class="text-xs px-2 py-1 rounded hover:bg-muted/30"
                        >
                          Copy link
                        </button>
                        <button
                          @click.stop="toggleExpand(a.id)"
                          class="text-xs px-2 py-1 rounded hover:bg-muted/30"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </transition>
              </div>
              <div class="flex items-center gap-2 shrink-0 self-start sm:self-center">
                <Avatar class="h-8 w-8">
                  <AvatarImage :src="a.author.avatar || ''" />
                  <AvatarFallback>{{ a.author.name.split(' ').map(p=>p[0]).join('') }}</AvatarFallback>
                </Avatar>
                <span class="text-xs font-medium">{{ a.author.name }}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <Card class="p-4 space-y-4">
          <h2 class="text-sm font-medium flex items-center gap-2">
            Browse by Category
          </h2>
          <div class="flex flex-wrap gap-2">
            <Badge
              v-for="cat in categories"
              :key="cat"
              :variant="selectedCategory === cat ? 'default' : 'outline'"
              class="cursor-pointer"
              @click="selectCategory(cat)"
            >
              {{ cat }}
            </Badge>
          </div>
        </Card>

        <Card class="overflow-hidden">
          <div class="aspect-[16/7] w-full bg-muted">
            <img v-if="tipOfDay.image" :src="tipOfDay.image" alt="" class="h-full w-full object-cover" />
          </div>
          <div class="p-4 space-y-2">
            <div class="flex items-center gap-2 text-sm">
              <span class="text-yellow-500">★</span>
              <span class="font-medium">Tip of the Day</span>
            </div>
            <h3 class="font-semibold leading-snug">{{ tipOfDay.title }}</h3>
            <p class="text-sm text-muted-foreground">{{ tipOfDay.body }}</p>
            <Separator class="my-2" />
            <Button variant="secondary" size="sm" class="w-full">More Tips</Button>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.scrollbar-hide {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.expanded-card {
  background: hsl(var(--muted), 0.2);
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.08);

  z-index: 10;
  transition: box-shadow 0.2s, transform 0.2s, background 0.2s;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
