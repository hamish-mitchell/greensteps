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
