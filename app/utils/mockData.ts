/**
 * Mock Data Utilities for GreenSteps Development
 * 
 * This file provides sample data for development and demonstration purposes
 * when the backend Supabase instance is not available. It simulates realistic
 * carbon footprint tracking data to showcase the application's functionality.
 * 
 * @note This is only used for development/demo purposes
 */

import type { UserBadge } from '@/composables/useBadges'
import type { UserQuest, QuestDefinition } from '@/composables/useQuests'

/**
 * Generates sample badge data for a user
 */
export function getMockBadges(): UserBadge[] {
  return [
    {
      badge_id: 1,
      awarded_at: '2024-01-15T10:30:00Z',
      code: 'first_activity',
      name: 'First Steps',
      description: 'Logged your first carbon footprint activity',
      icon: '🌱'
    },
    {
      badge_id: 2,
      awarded_at: '2024-01-20T14:15:00Z',
      code: 'week_streak',
      name: 'Consistency Champion',
      description: 'Maintained a 7-day logging streak',
      icon: '🔥'
    },
    {
      badge_id: 3,
      awarded_at: '2024-02-01T09:45:00Z',
      code: 'low_carbon_transport',
      name: 'Green Traveler',
      description: 'Chose sustainable transport for 80% of trips',
      icon: '🚲'
    }
  ]
}

/**
 * Generates sample quest data (active quests)
 */
export function getMockActiveQuests(): UserQuest[] {
  return [
    {
      id: 1,
      quest_id: 101,
      name: 'Sustainable Commute',
      description: 'Use public transport, cycling, or walking for your commute 5 days this week',
      category: 'transport',
      min_value: null,
      max_value: 5,
      points_multiplier: 20,
      progress: 3,
      completed: false,
      completed_at: null,
      percent: 60
    },
    {
      id: 2,
      quest_id: 102,
      name: 'Meat-Free Meals',
      description: 'Enjoy 10 plant-based meals this month',
      category: 'food',
      min_value: null,
      max_value: 10,
      points_multiplier: 15,
      progress: 7,
      completed: false,
      completed_at: null,
      percent: 70
    }
  ]
}

/**
 * Generates sample available quests for discovery
 */
export function getMockDiscoverQuests(): QuestDefinition[] {
  return [
    {
      id: 103,
      name: 'Energy Saver',
      description: 'Reduce your home energy usage by 15% this month',
      category: 'energy',
      min_value: null,
      max_value: 15,
      points_multiplier: 25
    },
    {
      id: 104,
      name: 'Zero Waste Week',
      description: 'Produce minimal waste for 7 consecutive days',
      category: 'waste',
      min_value: null,
      max_value: 7,
      points_multiplier: 30
    },
    {
      id: 105,
      name: 'Local Food Hero',
      description: 'Source 80% of your food locally for 2 weeks',
      category: 'food',
      min_value: null,
      max_value: 14,
      points_multiplier: 18
    }
  ]
}

/**
 * Generates sample completed quests
 */
export function getMockCompletedQuests(): UserQuest[] {
  return [
    {
      id: 3,
      quest_id: 106,
      name: 'Water Conservation',
      description: 'Reduce water usage by 20% for one week',
      category: 'energy',
      min_value: null,
      max_value: 7,
      points_multiplier: 22,
      progress: 7,
      completed: true,
      completed_at: '2024-01-25T16:30:00Z',
      percent: 100
    }
  ]
}

/**
 * Generates sample dashboard summary data
 */
export function getMockDashboardSummary() {
  return {
    month_saved_kg: 12.5, // CO2 saved this month vs baseline
    transport_km_month: 45.2, // km of sustainable transport this month
    waste_kg_month: 8.3, // kg of waste tracked this month
    energy_kwh_month: 156.7, // kWh of energy usage this month
    total_points: 1250, // lifetime points earned
    current_streak: 8 // current daily logging streak
  }
}

/**
 * Generates sample leaderboard data
 */
export function getMockLeaderboard() {
  return [
    {
      id: 'user-1',
      display_name: 'EcoWarrior2024',
      avatar_url: null,
      total_points: 2150,
      you: false
    },
    {
      id: 'current-user',
      display_name: 'You',
      avatar_url: null,
      total_points: 1250,
      you: true
    },
    {
      id: 'user-3',
      display_name: 'GreenThumb',
      avatar_url: null,
      total_points: 890,
      you: false
    },
    {
      id: 'user-4',
      display_name: 'SustainableSarah',
      avatar_url: null,
      total_points: 756,
      you: false
    }
  ]
}

/**
 * Generates sample emissions history data
 */
export function getMockEmissionsHistory() {
  const categories = ['transport', 'food', 'energy', 'waste']
  const activities = {
    transport: ['Car journey', 'Bus ride', 'Train travel', 'Flight'],
    food: ['Beef consumption', 'Dairy products', 'Plant-based meal', 'Local produce'],
    energy: ['Electricity usage', 'Gas heating', 'Solar generation', 'Energy saving'],
    waste: ['General waste', 'Recycling', 'Composting', 'Packaging']
  }
  
  const history = []
  const now = new Date()
  
  for (let i = 0; i < 20; i++) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const category = categories[Math.floor(Math.random() * categories.length)]
    const categoryActivities = activities[category as keyof typeof activities]
    const activity = categoryActivities[Math.floor(Math.random() * categoryActivities.length)]
    
    history.push({
      id: i + 1,
      activity,
      category,
      date: date.toISOString(),
      impactKg: Math.random() * 10 + 0.5 // Random impact between 0.5 and 10.5 kg CO2
    })
  }
  
  return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

/**
 * Utility to check if we should use mock data (when Supabase is not configured)
 */
export function shouldUseMockData(): boolean {
  // Check if we're in development and missing Supabase config
  const config = useRuntimeConfig()
  return !config.public.supabaseUrl || !config.public.supabaseAnonKey
}