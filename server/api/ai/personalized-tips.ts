import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'
import { setResponseStatus, getHeader } from 'h3'

export default defineEventHandler(async (event) => {
  // Only allow POST
  if (event.node.req.method !== 'POST') {
    setResponseStatus(event, 405)
    return { error: 'Method Not Allowed' }
  }

  // Get Authorization header
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    setResponseStatus(event, 401)
    return { error: 'Unauthorized' }
  }

  const { userId } = await readBody(event)
  
  if (!userId) {
    setResponseStatus(event, 400)
    return { error: 'User ID required' }
  }

  // Get env vars
  const SUPABASE_URL = process.env.SUPABASE_URL ?? ''
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? ''
  const openaiKey = process.env.OPENAI_API_KEY

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    setResponseStatus(event, 500)
    return { error: 'Missing Supabase environment variables' }
  }

  if (!openaiKey) {
    // Return fallback tips if no OpenAI key
    return { tips: getFallbackTips() }
  }

  try {
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false }
    })

    // Get user profile and recent activities
    const [profileResult, activitiesResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('diet_type, car_ownership, home_type, heating_type, green_power_percent')
        .eq('id', userId)
        .single(),
      supabase
        .from('activities')
        .select('category, type, emission_kg, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)
    ])

    const profile = profileResult.data
    const activities = activitiesResult.data || []

    // Analyze user data to create context
    const context = analyzeUserData(profile, activities)

    const openai = new OpenAI({ apiKey: openaiKey })

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a sustainability expert providing personalized tips to help users reduce their carbon footprint. 

Generate 3-5 actionable tips based on the user's profile and activity history. Each tip should be:
- Specific and actionable
- Relevant to their lifestyle
- Focused on high-impact areas
- Encouraging and positive

Respond with a JSON array of tip objects with these fields:
- title: Short, catchy tip title
- description: 2-3 sentence explanation with specific action steps
- category: One of (Transport, Energy, Food, Waste, General)
- relevanceScore: 0-1 score for how relevant this is to the user
- actionable: true/false for whether this tip has clear actions

Focus on areas where the user has high emissions or could easily improve.`
        },
        {
          role: 'user',
          content: `User profile: ${context}`
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    })

    const result = completion.choices[0]?.message?.content
    if (!result) {
      return { tips: getFallbackTips() }
    }

    try {
      const tips = JSON.parse(result)
      return { tips: Array.isArray(tips) ? tips : getFallbackTips() }
    } catch {
      return { tips: getFallbackTips() }
    }
  } catch (error) {
    console.error('Personalized tips error:', error)
    return { tips: getFallbackTips() }
  }
})

function analyzeUserData(profile: any, activities: any[]) {
  let context = 'User characteristics: '
  
  if (profile) {
    if (profile.diet_type) context += `Diet: ${profile.diet_type}. `
    if (profile.car_ownership) context += `Owns a car. `
    if (profile.home_type) context += `Home type: ${profile.home_type}. `
    if (profile.heating_type) context += `Heating: ${profile.heating_type}. `
    if (profile.green_power_percent) context += `Uses ${profile.green_power_percent}% green energy. `
  }

  if (activities.length > 0) {
    const categoryEmissions = activities.reduce((acc: any, activity) => {
      acc[activity.category] = (acc[activity.category] || 0) + (activity.emission_kg || 0)
      return acc
    }, {})

    const highestEmission = Object.entries(categoryEmissions)
      .sort(([,a]: any, [,b]: any) => b - a)[0]

    if (highestEmission) {
      context += `Highest emissions from ${highestEmission[0]} (${(highestEmission[1] as number).toFixed(1)}kg CO2e recently). `
    }

    context += `Recent activities: ${activities.slice(0, 5).map(a => `${a.category}-${a.type}`).join(', ')}.`
  }

  return context
}

function getFallbackTips() {
  return [
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
  ]
}