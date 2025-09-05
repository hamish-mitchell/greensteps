import { ref } from 'vue'

// Types for activity parsing
export type ParsedActivity = {
  category: 'Food' | 'Transport' | 'Electricity' | 'Waste'
  food?: { subcategory: string; amountKg: number }
  transport?: { mode: string; durationMinutes: number }
  electricity?: { kWh: number }
  waste?: { amountKg: number }
  confidence: number
}

export type PersonalizedTip = {
  title: string
  description: string
  category: string
  relevanceScore: number
  actionable: boolean
}

export const useAI = () => {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Parse natural language input into structured activity data
   */
  const parseActivity = async (input: string): Promise<ParsedActivity | null> => {
    if (!input.trim()) return null
    
    isLoading.value = true
    error.value = null
    
    try {
      const response = await $fetch<{ activity: ParsedActivity }>('/api/ai/parse-activity', {
        method: 'POST',
        body: { input }
      })
      
      return response.activity
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to parse activity'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Generate personalized tips based on user data
   */
  const generatePersonalizedTips = async (userId: string): Promise<PersonalizedTip[]> => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await $fetch<{ tips: PersonalizedTip[] }>('/api/ai/personalized-tips', {
        method: 'POST',
        body: { userId }
      })
      
      return response.tips || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to generate tips'
      return []
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading: readonly(isLoading),
    error: readonly(error),
    parseActivity,
    generatePersonalizedTips
  }
}