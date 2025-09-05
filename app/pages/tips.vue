<script setup lang="ts">
definePageMeta({
  layout: "app-shell",
  tagline: "Tips & Tricks to help you help the planet.",
})

import { ref, computed } from 'vue'
const supabase = useSupabaseClient()

import Card from '~/components/ui/card/Card.vue'
import Button from '~/components/ui/button/Button.vue'
import Badge from '~/components/ui/badge/Badge.vue'
import Avatar from '~/components/ui/avatar/Avatar.vue'
import AvatarImage from '~/components/ui/avatar/AvatarImage.vue'
import AvatarFallback from '~/components/ui/avatar/AvatarFallback.vue'
import Separator from '~/components/ui/separator/Separator.vue'
import PersonalizedTips from '~/components/dashboard/PersonalizedTips.vue'

type Article = {
  id: number
  title: string
  category: string
  categoryColor?: string
  excerpt: string
  author: { name: string; avatar?: string }
  content?: string
}

const categories = [
  'All',
  'Transport',
  'Energy',
  'Zero-Waste',
  'Consumerism',
  'Water'
]

const articles = ref<Article[]>([])
const articlesLoading = ref(false)
const articlesError = ref<string | null>(null)
async function loadArticles() {
  articlesLoading.value = true
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, category, excerpt, author_name, author_avatar_url, content')
      .order('id', { ascending: false })
      .limit(50)
    if (error) throw error
    articles.value = (data || []).map((r: any) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      excerpt: r.excerpt,
      author: { name: r.author_name, avatar: r.author_avatar_url },
      content: r.content
    }))
  } catch (e: any) {
    articlesError.value = e.message
  } finally {
    articlesLoading.value = false
  }
}
loadArticles()

const selectedCategory = ref<string>('All')

const filteredArticles = computed(() =>
  selectedCategory.value === 'All'
    ? articles.value
    : articles.value.filter(a => a.category === selectedCategory.value)
)

function selectCategory(cat: string) {
  selectedCategory.value = cat
}

const tipOfDay = ref({
  title: 'Create a windowsill herb garden.',
  body: 'Grow herbs at home to cut plastic packaging and transport emissions while keeping flavors fresh.',
  image: 'https://images.unsplash.com/photo-1524594154908-edd3327fb021?auto=format&fit=crop&w=800&q=60'
})

const expandedArticleId = ref<number | null>(null)

function toggleExpand(id: number) {
  expandedArticleId.value = expandedArticleId.value === id ? null : id
}

// added: estimate read time and copy link helpers
function estimateReadTime(content?: string) {
  if (!content) return '1 min read'
  const words = content.split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.round(words / 200))
  return `${minutes} min read`
}

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
      <!-- Articles -->
      <div class="lg:col-span-2 flex flex-col min-h-[60vh]">
        <h2 class="text-sm font-medium text-muted-foreground uppercase mb-2">Latest Articles</h2>
        <!-- Scrollable list -->
        <div class="space-y-3 overflow-y-auto pr-2 custom-scroll rounded-md" style="max-height: calc(100vh - 250px)" aria-label="Latest articles list">
          <div v-if="articlesLoading" class="text-xs text-muted-foreground">Loading articles...</div>
          <div v-else-if="articlesError" class="text-xs text-red-500">{{ articlesError }}</div>
          <div v-else-if="!filteredArticles.length" class="text-xs text-muted-foreground">No articles yet. Seed the 'articles' table.</div>
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
                    <div class="prose max-w-none">
                      <p v-if="a.content">{{ a.content }}</p>
                      <p v-else class="text-muted-foreground">No additional content available.</p>
                    </div>

                    <div class="flex items-center justify-between mt-3">
                      <div class="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>By <strong>{{ a.author.name }}</strong></span>
                        <span class="mx-1">•</span>
                        <span>{{ a.category }}</span>
                        <span class="mx-1">•</span>
                        <span>{{ estimateReadTime(a.content) }}</span>
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
        <!-- Personalized Tips -->
        <PersonalizedTips />
        
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
  background: hsl(var(--muted), 0.7);
}

.expanded-card {
  background: hsl(var(--muted), 0.2);
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.08);
  transform: scale(1.03);
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
