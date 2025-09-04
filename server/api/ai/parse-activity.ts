import OpenAI from 'openai'
import { setResponseStatus } from 'h3'

export default defineEventHandler(async (event) => {
  // Only allow POST
  if (event.node.req.method !== 'POST') {
    setResponseStatus(event, 405)
    return { error: 'Method Not Allowed' }
  }

  const { input } = await readBody(event)
  
  if (!input || typeof input !== 'string') {
    setResponseStatus(event, 400)
    return { error: 'Invalid input' }
  }

  // Check for OpenAI API key
  const openaiKey = process.env.OPENAI_API_KEY
  if (!openaiKey) {
    // Fallback to rule-based parsing if no API key
    return fallbackParseActivity(input)
  }

  try {
    const openai = new OpenAI({ apiKey: openaiKey })

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant that parses natural language descriptions of daily activities into structured carbon footprint tracking data.

Categories and their subcategories:
- Food: Red Meat, White Meat, Dairy, Baked Goods, Fruit/Veg.
- Transport: Car, Walk/Ride, Bus, Train, Tram, Plane
- Electricity: (just kWh amount)
- Waste: (just kg amount)

For each input, respond with a JSON object containing:
- category: one of the 4 main categories
- food/transport/electricity/waste: relevant subcategory data
- confidence: 0-1 score for parsing accuracy

IMPORTANT: Extract specific amounts from the input text. Use realistic portion sizes when amounts aren't specified.

Food amount guidelines:
- Small portion: 0.1-0.15 kg
- Medium/regular portion: 0.2-0.3 kg  
- Large portion: 0.35-0.5 kg
- Burger patty: 0.1-0.15 kg
- Steak: 0.2-0.4 kg
- Chicken breast: 0.15-0.25 kg
- Fish fillet: 0.15-0.2 kg

Examples:
"I drove to work for 30 minutes" → {"category": "Transport", "transport": {"mode": "Car", "durationMinutes": 30}, "confidence": 0.9}
"Had a beef burger for lunch" → {"category": "Food", "food": {"subcategory": "Red Meat", "amountKg": 0.12}, "confidence": 0.8}
"Ate a large 300g steak" → {"category": "Food", "food": {"subcategory": "Red Meat", "amountKg": 0.3}, "confidence": 0.95}
"Small chicken breast for dinner" → {"category": "Food", "food": {"subcategory": "White Meat", "amountKg": 0.15}, "confidence": 0.85}
"Had 2 pieces of fish" → {"category": "Food", "food": {"subcategory": "White Meat", "amountKg": 0.3}, "confidence": 0.8}
"Used 5 kWh of electricity today" → {"category": "Electricity", "electricity": {"kWh": 5}, "confidence": 0.95}
"Drove for 45 minutes" → {"category": "Transport", "transport": {"mode": "Car", "durationMinutes": 45}, "confidence": 0.85}
"Walked 2 hours to the park" → {"category": "Transport", "transport": {"mode": "Walk/Ride", "durationMinutes": 120}, "confidence": 0.9}`
        },
        {
          role: 'user',
          content: input
        }
      ],
      temperature: 0.1,
      max_tokens: 150
    })

    const result = completion.choices[0]?.message?.content
    if (!result) {
      return fallbackParseActivity(input)
    }

    try {
      const parsed = JSON.parse(result)
      return { activity: parsed }
    } catch {
      return fallbackParseActivity(input)
    }
  } catch (error) {
    console.error('OpenAI API error:', error)
    return fallbackParseActivity(input)
  }
})

// Simple rule-based fallback when OpenAI is not available
function fallbackParseActivity(input: string) {
  const lowerInput = input.toLowerCase()
  
  // Helper function to extract numerical amounts with units
  function extractAmount(text: string, defaultAmount: number): number {
    // Look for specific amounts: "300g", "0.5kg", "500 grams", etc.
    const gramsMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:g|grams?)\b/i)
    if (gramsMatch) {
      return parseFloat(gramsMatch[1]) / 1000 // Convert grams to kg
    }
    
    const kgMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilograms?)\b/i)
    if (kgMatch) {
      return parseFloat(kgMatch[1])
    }

    // Look for quantity indicators: "2 pieces", "3 slices", etc.
    const piecesMatch = text.match(/(\d+)\s*(?:pieces?|slices?|servings?)\b/i)
    if (piecesMatch) {
      return parseFloat(piecesMatch[1]) * defaultAmount
    }

    // Look for size descriptors
    if (text.includes('large') || text.includes('big')) {
      return defaultAmount * 1.5
    }
    if (text.includes('small') || text.includes('little')) {
      return defaultAmount * 0.6
    }
    if (text.includes('medium') || text.includes('regular')) {
      return defaultAmount
    }

    return defaultAmount
  }

  // Helper function to extract time durations
  function extractDuration(text: string, defaultMinutes: number): number {
    // Look for hours and minutes: "2 hours 30 minutes", "1.5 hours", "90 minutes"
    const hoursMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)\b/i)
    const minutesMatch = text.match(/(\d+)\s*(?:minutes?|mins?)\b/i)
    
    let totalMinutes = 0
    if (hoursMatch) {
      totalMinutes += parseFloat(hoursMatch[1]) * 60
    }
    if (minutesMatch) {
      totalMinutes += parseInt(minutesMatch[1])
    }
    
    // If we found time information, use it
    if (totalMinutes > 0) {
      return totalMinutes
    }

    // Look for distance indicators that can be converted to time
    const kmMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:km|kilometers?|kilometres?)\b/i)
    if (kmMatch) {
      const distance = parseFloat(kmMatch[1])
      // Rough conversion: walking ~5km/h, driving ~30km/h in city
      if (text.includes('walk') || text.includes('bike')) {
        return Math.round(distance * 12) // 5km/h = 12 min/km
      } else if (text.includes('drive') || text.includes('car')) {
        return Math.round(distance * 2) // 30km/h = 2 min/km
      }
    }

    return defaultMinutes
  }
  
  // Transport patterns
  if (lowerInput.includes('drove') || lowerInput.includes('car') || lowerInput.includes('drive')) {
    const minutes = extractDuration(lowerInput, 25) // More realistic default
    
    return {
      activity: {
        category: 'Transport',
        transport: { mode: 'Car', durationMinutes: minutes },
        confidence: 0.7
      }
    }
  }
  
  if (lowerInput.includes('walk') || lowerInput.includes('bike') || lowerInput.includes('cycle')) {
    const minutes = extractDuration(lowerInput, 20) // More realistic for walking
    
    return {
      activity: {
        category: 'Transport',
        transport: { mode: 'Walk/Ride', durationMinutes: minutes },
        confidence: 0.7
      }
    }
  }

  if (lowerInput.includes('bus') || lowerInput.includes('train') || lowerInput.includes('tram')) {
    const minutes = extractDuration(lowerInput, 30)
    const mode = lowerInput.includes('train') ? 'Train' : 
                 lowerInput.includes('tram') ? 'Tram' : 'Bus'
    
    return {
      activity: {
        category: 'Transport',
        transport: { mode, durationMinutes: minutes },
        confidence: 0.8
      }
    }
  }

  // Food patterns with better amount estimation
  if (lowerInput.includes('beef') || lowerInput.includes('steak') || lowerInput.includes('lamb')) {
    const baseAmount = lowerInput.includes('steak') ? 0.25 : 0.12 // Steak vs burger
    const amount = extractAmount(lowerInput, baseAmount)
    
    return {
      activity: {
        category: 'Food',
        food: { subcategory: 'Red Meat', amountKg: Math.round(amount * 1000) / 1000 },
        confidence: 0.75
      }
    }
  }

  if (lowerInput.includes('chicken') || lowerInput.includes('fish') || lowerInput.includes('turkey')) {
    const baseAmount = lowerInput.includes('fish') ? 0.15 : 0.18 // Fish vs chicken
    const amount = extractAmount(lowerInput, baseAmount)
    
    return {
      activity: {
        category: 'Food',
        food: { subcategory: 'White Meat', amountKg: Math.round(amount * 1000) / 1000 },
        confidence: 0.75
      }
    }
  }

  if (lowerInput.includes('cheese') || lowerInput.includes('milk') || lowerInput.includes('yogurt') || lowerInput.includes('dairy')) {
    const baseAmount = 0.15 // Typical dairy serving
    const amount = extractAmount(lowerInput, baseAmount)
    
    return {
      activity: {
        category: 'Food',
        food: { subcategory: 'Dairy', amountKg: Math.round(amount * 1000) / 1000 },
        confidence: 0.7
      }
    }
  }

  if (lowerInput.includes('bread') || lowerInput.includes('pasta') || lowerInput.includes('pizza') || lowerInput.includes('cake')) {
    const baseAmount = 0.1 // Typical baked goods serving
    const amount = extractAmount(lowerInput, baseAmount)
    
    return {
      activity: {
        category: 'Food',
        food: { subcategory: 'Baked Goods', amountKg: Math.round(amount * 1000) / 1000 },
        confidence: 0.7
      }
    }
  }

  if (lowerInput.includes('fruit') || lowerInput.includes('vegetable') || lowerInput.includes('salad') || lowerInput.includes('apple') || lowerInput.includes('banana')) {
    const baseAmount = 0.15 // Typical fruit/veg serving
    const amount = extractAmount(lowerInput, baseAmount)
    
    return {
      activity: {
        category: 'Food',
        food: { subcategory: 'Fruit/Veg.', amountKg: Math.round(amount * 1000) / 1000 },
        confidence: 0.7
      }
    }
  }

  // Electricity patterns with better extraction
  const kwhMatch = lowerInput.match(/(\d+(?:\.\d+)?)\s*kwh/i)
  if (kwhMatch || lowerInput.includes('electricity') || lowerInput.includes('power')) {
    const kWh = kwhMatch ? parseFloat(kwhMatch[1]) : 
                lowerInput.includes('high') || lowerInput.includes('lot') ? 8 :
                lowerInput.includes('low') || lowerInput.includes('little') ? 2 : 5
    
    return {
      activity: {
        category: 'Electricity',
        electricity: { kWh },
        confidence: kwhMatch ? 0.9 : 0.6
      }
    }
  }

  // Waste patterns
  const wasteMatch = lowerInput.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilograms?)\s*(?:waste|trash|garbage)/i)
  if (wasteMatch || lowerInput.includes('waste') || lowerInput.includes('trash') || lowerInput.includes('garbage')) {
    const kg = wasteMatch ? parseFloat(wasteMatch[1]) : 1.5 // Typical daily waste
    
    return {
      activity: {
        category: 'Waste',
        waste: { amountKg: kg },
        confidence: wasteMatch ? 0.8 : 0.5
      }
    }
  }

  // Default fallback - try to guess from context
  if (lowerInput.includes('ate') || lowerInput.includes('food') || lowerInput.includes('meal') || 
      lowerInput.includes('lunch') || lowerInput.includes('dinner') || lowerInput.includes('breakfast')) {
    return {
      activity: {
        category: 'Food',
        food: { subcategory: 'White Meat', amountKg: 0.15 },
        confidence: 0.3
      }
    }
  }

  return {
    activity: {
      category: 'Transport',
      transport: { mode: 'Car', durationMinutes: 20 },
      confidence: 0.2
    }
  }
}