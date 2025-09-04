<script setup lang="ts">
import { ref } from 'vue'
import Card from '~/components/ui/card/Card.vue'
import Button from '~/components/ui/button/Button.vue'
import { Textarea } from '~/components/ui/textarea'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

// Demo state
const naturalLanguageInput = ref('')
const parsedResult = ref<any>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

// Demo tips
const demoTips = ref([
  {
    title: 'Try Meatless Mondays',
    description: 'Replace meat with plant-based alternatives one day per week. This simple change can reduce your food-related emissions by up to 15%.',
    category: 'Food',
    relevanceScore: 0.8,
    actionable: true
  },
  {
    title: 'Optimize Your Home Heating',
    description: 'Lower your thermostat by 1-2 degrees and use programmable settings. You could save 10% on heating costs and reduce emissions.',
    category: 'Energy',
    relevanceScore: 0.7,
    actionable: true
  },
  {
    title: 'Plan Your Trips',
    description: 'Combine errands into single trips and consider walking or cycling for short distances under 2km. This reduces both emissions and costs.',
    category: 'Transport',
    relevanceScore: 0.8,
    actionable: true
  }
])

// Demo natural language parsing
async function demoParseActivity() {
  if (!naturalLanguageInput.value.trim()) return
  
  isLoading.value = true
  error.value = null
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simple rule-based demo parsing
    const input = naturalLanguageInput.value.toLowerCase()
    
    if (input.includes('drove') || input.includes('car')) {
      parsedResult.value = {
        category: 'Transport',
        transport: { mode: 'Car', durationMinutes: 30 },
        confidence: 0.8
      }
    } else if (input.includes('beef') || input.includes('steak')) {
      parsedResult.value = {
        category: 'Food',
        food: { subcategory: 'Red Meat', amountKg: 0.25 },
        confidence: 0.7
      }
    } else if (input.includes('walk') || input.includes('bike')) {
      parsedResult.value = {
        category: 'Transport',
        transport: { mode: 'Walk/Ride', durationMinutes: 20 },
        confidence: 0.9
      }
    } else {
      parsedResult.value = {
        category: 'Transport',
        transport: { mode: 'Car', durationMinutes: 30 },
        confidence: 0.4
      }
    }
  } catch (err) {
    error.value = 'Demo parsing failed'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="container max-w-6xl mx-auto p-6 space-y-8">
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold">🤖 AI Integration Demo</h1>
      <p class="text-muted-foreground max-w-2xl mx-auto">
        Experience natural language activity input and personalized sustainability tips powered by AI.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Natural Language Activity Input Demo -->
      <Card class="p-6 space-y-6">
        <div>
          <h2 class="text-xl font-semibold mb-2">Natural Language Activity Input</h2>
          <p class="text-sm text-muted-foreground">
            Describe your activities in plain English and watch AI parse them into structured data.
          </p>
        </div>

        <div class="space-y-4">
          <div class="space-y-2">
            <Label class="text-sm font-medium">Describe your activity</Label>
            <Textarea
              v-model="naturalLanguageInput"
              placeholder="e.g., 'I drove to work for 30 minutes' or 'Had a beef burger for lunch'"
              class="min-h-[100px]"
            />
          </div>
          
          <Button
            @click="demoParseActivity"
            :disabled="!naturalLanguageInput.trim() || isLoading"
            class="w-full"
          >
            {{ isLoading ? '🔄 Processing...' : '✨ Parse Activity' }}
          </Button>
          
          <div v-if="error" class="text-sm text-red-600 p-2 bg-red-50 rounded">
            {{ error }}
          </div>
          
          <div v-if="parsedResult" class="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 class="font-medium text-green-800 mb-2">Parsed Result:</h4>
            <div class="text-sm space-y-1">
              <div><strong>Category:</strong> {{ parsedResult.category }}</div>
              <div v-if="parsedResult.transport">
                <strong>Transport:</strong> {{ parsedResult.transport.mode }} - {{ parsedResult.transport.durationMinutes }} minutes
              </div>
              <div v-if="parsedResult.food">
                <strong>Food:</strong> {{ parsedResult.food.subcategory }} - {{ parsedResult.food.amountKg }} kg
              </div>
              <div><strong>Confidence:</strong> {{ (parsedResult.confidence * 100).toFixed(0) }}%</div>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <h4 class="font-medium">Try these examples:</h4>
          <div class="flex flex-wrap gap-2">
            <Button 
              v-for="example in ['I drove to work for 30 minutes', 'Had a beef burger', 'Walked to the store', 'Used 5 kWh today']"
              :key="example"
              variant="outline" 
              size="sm"
              @click="naturalLanguageInput = example"
            >
              {{ example }}
            </Button>
          </div>
        </div>
      </Card>

      <!-- Personalized Tips Demo -->
      <Card class="p-6 space-y-6">
        <div>
          <h2 class="text-xl font-semibold mb-2">🎯 Personalized Tips</h2>
          <p class="text-sm text-muted-foreground">
            AI-generated sustainability tips tailored to your lifestyle and activities.
          </p>
        </div>

        <div class="space-y-4">
          <div v-for="(tip, index) in demoTips" :key="index" class="p-4 border rounded-lg">
            <div class="flex items-start gap-2 mb-2">
              <span 
                class="text-xs px-2 py-1 rounded border"
                :class="{
                  'border-green-200 text-green-700 bg-green-50': tip.category === 'Energy',
                  'border-blue-200 text-blue-700 bg-blue-50': tip.category === 'Transport',
                  'border-orange-200 text-orange-700 bg-orange-50': tip.category === 'Food'
                }"
              >
                {{ tip.category }}
              </span>
              <div v-if="tip.relevanceScore > 0.75" class="text-xs text-yellow-600 font-medium">
                High Impact
              </div>
            </div>
            
            <h4 class="font-semibold text-sm mb-1">{{ tip.title }}</h4>
            <p class="text-xs text-muted-foreground leading-relaxed">{{ tip.description }}</p>
            
            <div v-if="tip.actionable" class="mt-2">
              <span class="text-xs text-green-600 font-medium">✓ Actionable</span>
            </div>
          </div>
        </div>

        <div class="text-center">
          <Button variant="outline" size="sm">
            Refresh Tips 🔄
          </Button>
        </div>
      </Card>
    </div>

    <!-- Integration Information -->
    <Card class="p-6">
      <h3 class="text-lg font-semibold mb-4">🔧 Technical Implementation</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        <div>
          <h4 class="font-medium mb-2">Natural Language Processing</h4>
          <ul class="space-y-1 text-muted-foreground">
            <li>• OpenAI GPT-3.5-turbo for parsing</li>
            <li>• Fallback rule-based system</li>
            <li>• Confidence scoring</li>
            <li>• Support for Food, Transport, Energy, Waste categories</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">Personalized Tips</h4>
          <ul class="space-y-1 text-muted-foreground">
            <li>• User profile analysis</li>
            <li>• Activity history patterns</li>
            <li>• Relevance scoring</li>
            <li>• Actionable recommendations</li>
          </ul>
        </div>
      </div>
    </Card>

    <div class="text-center">
      <p class="text-sm text-muted-foreground">
        This demo shows the AI integration capabilities. In production, add your OpenAI API key to enable full functionality.
      </p>
    </div>
  </div>
</template>