/**
 * Content Configuration - Nuxt Content Setup
 * 
 * Defines collection schemas for structured content management.
 * Currently configured for articles with author and category metadata.
 */
import { defineContentConfig } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    articles: {
      source: [
        {
          // relative to project root
          dir: 'content/articles'
        }
      ],
      schema: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          title: { type: 'string' },
          category: { type: 'string' },
          excerpt: { type: 'string' },
          author: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              avatar: { type: 'string' }
            },
            required: ['name']
          }
        },
        required: ['title']
      }
    }
  }
})
