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

Examples:
"I drove to work for 30 minutes" → {"category": "Transport", "transport": {"mode": "Car", "durationMinutes": 30}, "confidence": 0.9}
"Had a beef burger for lunch" → {"category": "Food", "food": {"subcategory": "Red Meat", "amountKg": 0.25}, "confidence": 0.8}
"Used 5 kWh of electricity today" → {"category": "Electricity", "electricity": {"kWh": 5}, "confidence": 0.95}`
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
  
  // Transport patterns
  if (lowerInput.includes('drove') || lowerInput.includes('car') || lowerInput.includes('drive')) {
    const timeMatch = lowerInput.match(/(\d+)\s*(min|hour|hr)/i)
    const minutes = timeMatch ? 
      (timeMatch[2].startsWith('h') ? parseInt(timeMatch[1]) * 60 : parseInt(timeMatch[1])) : 30
    
    return {
      activity: {
        category: 'Transport',
        transport: { mode: 'Car', durationMinutes: minutes },
        confidence: 0.7
      }
    }
  }
  
  if (lowerInput.includes('walk') || lowerInput.includes('bike') || lowerInput.includes('cycle')) {
    const timeMatch = lowerInput.match(/(\d+)\s*(min|hour|hr)/i)
    const minutes = timeMatch ? 
      (timeMatch[2].startsWith('h') ? parseInt(timeMatch[1]) * 60 : parseInt(timeMatch[1])) : 30
    
    return {
      activity: {
        category: 'Transport',
        transport: { mode: 'Walk/Ride', durationMinutes: minutes },
        confidence: 0.7
      }
    }
  }

  // Food patterns
  if (lowerInput.includes('beef') || lowerInput.includes('steak') || lowerInput.includes('lamb')) {
    return {
      activity: {
        category: 'Food',
        food: { subcategory: 'Red Meat', amountKg: 0.25 },
        confidence: 0.6
      }
    }
  }

  if (lowerInput.includes('chicken') || lowerInput.includes('fish') || lowerInput.includes('turkey')) {
    return {
      activity: {
        category: 'Food',
        food: { subcategory: 'White Meat', amountKg: 0.2 },
        confidence: 0.6
      }
    }
  }

  // Electricity patterns
  const kwhMatch = lowerInput.match(/(\d+(?:\.\d+)?)\s*kwh/i)
  if (kwhMatch) {
    return {
      activity: {
        category: 'Electricity',
        electricity: { kWh: parseFloat(kwhMatch[1]) },
        confidence: 0.8
      }
    }
  }

  // Default fallback
  return {
    activity: {
      category: 'Transport',
      transport: { mode: 'Car', durationMinutes: 30 },
      confidence: 0.3
    }
  }
}