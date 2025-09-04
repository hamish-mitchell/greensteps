<!--
  tips.vue
  -------------------------------
  Tips & Tricks page for GreenSteps app.
  - Displays a list of sustainability articles fetched from Supabase.
  - Allows filtering by category and expanding articles for full content.
  - Includes a "Tip of the Day" and category sidebar.
  - Uses a simple Markdown renderer for article content - [Markdown-it](https://github.com/markdown-it/markdown-it)
  Author: Hamish Mitchel
  Date: [Date]
-->

<script setup lang="ts">
// Page meta for Nuxt layout and tagline
definePageMeta({
  layout: "app-shell",
  tagline: "Tips & Tricks to help you help the planet.",
})

import { ref, computed } from 'vue'
// Supabase client composable
const supabase = useSupabaseClient()

// UI components
import Card from '~/components/ui/card/Card.vue'
import Button from '~/components/ui/button/Button.vue'
import Badge from '~/components/ui/badge/Badge.vue'
import Avatar from '~/components/ui/avatar/Avatar.vue'
import AvatarImage from '~/components/ui/avatar/AvatarImage.vue'
import AvatarFallback from '~/components/ui/avatar/AvatarFallback.vue'
import Separator from '~/components/ui/separator/Separator.vue'

// Article type definition
type Article = {
  id: number
  title: string
  category: string
  categoryColor?: string
  excerpt: string
  author: { name: string; avatar?: string }
  content?: string
}

// List of categories for filtering
const categories = [
  'All',
  'Transport',
  'Energy',
  'Zero-Waste',
  'Consumerism',
  'Water'
]

// State for articles and loading/error
const articles = ref<Article[]>([])
const articlesLoading = ref(false)
const articlesError = ref<string | null>(null)

// Fetch articles from Supabase on load
async function loadArticles() {
  articlesLoading.value = true
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, category, excerpt, author_name, author_avatar_url, content')
      .order('id', { ascending: false })
      .limit(50)
    if (error) throw error
    // Map DB rows to Article objects
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

// State for selected category filter
const selectedCategory = ref<string>('All')

// Computed: filter articles by selected category
const filteredArticles = computed(() =>
  selectedCategory.value === 'All'
    ? articles.value
    : articles.value.filter(a => a.category === selectedCategory.value)
)

// Handler for selecting a category
function selectCategory(cat: string) {
  selectedCategory.value = cat
}

// Tip of the Day (static for now)
const tipOfDay = ref({
  title: 'Create a windowsill herb garden.',
  body: 'Grow herbs at home to cut plastic packaging and transport emissions while keeping flavors fresh.',
  image: 'https://images.unsplash.com/photo-1524594154908-edd3327fb021?auto=format&fit=crop&w=800&q=60'
})

// State for expanded article (for details view)
const expandedArticleId = ref<number | null>(null)

// Toggle expanded/collapsed state for an article
function toggleExpand(id: number) {
  expandedArticleId.value = expandedArticleId.value === id ? null : id
}

// Estimate read time for article content
function estimateReadTime(content?: string) {
  if (!content) return '1 min read'
  const words = content.split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.round(words / 200))
  return `${minutes} min read`
}

// Copy article link to clipboard
async function copyLink(id: number) {
  try {
    const url = `${window.location.origin}${window.location.pathname}#article-${id}`
    await navigator.clipboard.writeText(url)
    // Optionally show a toast/notification
  } catch {
    // ignore
  }
}

// --- Simple, dependency-free Markdown renderer (safe-ish):

// Escape HTML for safe rendering
function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Sanitize URLs to prevent XSS
function sanitizeUrl(url: string) {
  // Disallow javascript: and data: URIs to avoid XSS vectors
  if (!url) return ''
  const trimmed = url.trim()
  if (/^javascript:/i.test(trimmed) || /^data:/i.test(trimmed)) return ''
  return trimmed
}

// Render inline markdown (links, images, code, bold, italic)
function inlineToHtml(text: string) {
  // images: ![alt](url)
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, url) => {
    const u = sanitizeUrl(url)
    return u ? `<img src="${escapeHtml(u)}" alt="${escapeHtml(alt)}" />` : escapeHtml(alt)
  })

  // links: [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, url) => {
    const u = sanitizeUrl(url)
    if (!u) return escapeHtml(label)
    return `<a href="${escapeHtml(u)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`
  })

  // inline code `code`
  text = text.replace(/`([^`]+)`/g, (_m, code) => `<code>${escapeHtml(code)}</code>`)

  // bold **text**
  text = text.replace(/\*\*(.+?)\*\*/g, (_m, t) => `<strong>${escapeHtml(t)}</strong>`)

  // italic *text*
  text = text.replace(/\*(.+?)\*/g, (_m, t) => `<em>${escapeHtml(t)}</em>`)

  return text
}

// Render block-level markdown (headings, lists, blockquotes, code blocks, paragraphs)
function renderMarkdown(md?: string) {
  if (!md) return ''

  // Step 1: extract fenced code blocks so they don't get mangled
  const codeBlocks: string[] = []
  let tmp = md.replace(/```([\s\S]*?)```/g, (_m, code) => {
    const idx = codeBlocks.push(code) - 1
    return `@@CODEBLOCK${idx}@@`
  })

  // Normalize line endings
  const lines: string[] = tmp.split(/\r?\n/)
  let out: string[] = []
  let inUl = false
  let inOl = false
  let paraBuf: string[] = []

  // Helper to flush paragraph buffer
  function flushPara() {
    if (!paraBuf.length) return
    const joined = paraBuf.join(' ')
    // parse markdown inline from raw text, inlineToHtml will escape fragments as needed
    out.push(`<p>${inlineToHtml(joined)}</p>`)
    paraBuf = []
  }

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i] || ''
    if (!line.trim()) {
      // blank line -> close lists and flush paragraph
      if (inUl) { out.push('</ul>'); inUl = false }
      if (inOl) { out.push('</ol>'); inOl = false }
      flushPara()
      continue
    }

    // headings
    const h = line.match(/^(#{1,6})\s+(.*)$/)
    if (h) {
      flushPara()
      if (inUl) { out.push('</ul>'); inUl = false }
      if (inOl) { out.push('</ol>'); inOl = false }
      const level = (h[1] || '').length
      out.push(`<h${level}>${inlineToHtml(h[2] || '')}</h${level}>`)
      continue
    }

    // unordered list
    const ul = line.match(/^\s*[-*]\s+(.*)$/)
    if (ul) {
      flushPara()
      if (!inUl) { out.push('<ul>'); inUl = true }
      out.push(`<li>${inlineToHtml(ul[1] || '')}</li>`)
      continue
    }

    // ordered list
    const ol = line.match(/^\s*\d+\.\s+(.*)$/)
    if (ol) {
      flushPara()
      if (!inOl) { out.push('<ol>'); inOl = true }
      out.push(`<li>${inlineToHtml(ol[1] || '')}</li>`)
      continue
    }

    // blockquote
    const bq = line.match(/^>\s?(.*)$/)
    if (bq) {
      flushPara()
      out.push(`<blockquote>${inlineToHtml(bq[1] || '')}</blockquote>`)
      continue
    }

    // already a placeholder for code block
    const codePlaceholder = line.match(/^@@CODEBLOCK(\d+)@@$/)
    if (codePlaceholder) {
      flushPara()
      const idx = Number(codePlaceholder[1])
      const code = codeBlocks[idx] || ''
      out.push(`<pre><code>${escapeHtml(code)}</code></pre>`)
      continue
    }

    // normal paragraph line (accumulate)
    paraBuf.push(line.trim())
  }

  // cleanup
  if (inUl) out.push('</ul>')
  if (inOl) out.push('</ol>')
  flushPara()

  return out.join('\n')
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
                      <div v-if="a.content" v-html="renderMarkdown(a.content)"></div>
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
