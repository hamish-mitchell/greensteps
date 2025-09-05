# GreenSteps Development Guide

This guide covers the development setup, code structure, and contribution guidelines for the GreenSteps carbon footprint tracking application.

## 🚀 Quick Start

1. **Clone and install dependencies**
   ```bash
   git clone https://github.com/hamish-mitchell/greensteps
   cd greensteps
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

### Core Directories

```
app/
├── components/         # Reusable Vue components
│   ├── dashboard/     # Dashboard-specific components
│   └── ui/           # Design system components
├── composables/       # Vue composables for business logic
├── layouts/          # Application layouts
├── pages/            # Route pages (auto-generated routing)
├── plugins/          # Nuxt plugins
└── utils/            # Utility functions and helpers

server/               # Server-side API routes
public/               # Static assets
types/                # TypeScript type definitions
```

### Key Components

- **AutoForm System** (`app/components/ui/auto-form/`): Dynamic form generation from Zod schemas
- **Dashboard Components** (`app/components/dashboard/`): Activity tracking and analytics
- **UI Components** (`app/components/ui/`): Design system based on shadcn/ui

## 📦 Technology Stack

### Frontend
- **Nuxt 4**: Vue.js framework with SSR/SPA capabilities
- **Vue 3**: Progressive JavaScript framework with Composition API
- **TypeScript**: Type-safe JavaScript development
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Component library for consistent design

### Backend Integration
- **Supabase**: Backend-as-a-Service for authentication, database, and real-time features
- **Zod**: TypeScript-first schema validation
- **Chart.js**: Data visualization for emissions tracking

### Development Tools
- **ESLint**: Code linting and quality assurance
- **Prettier**: Code formatting
- **Husky**: Git hooks for code quality
- **Vite**: Fast build tool and development server

## 🧪 Development Workflow

### Code Quality

Run linting and formatting:
```bash
npm run lint          # Check for linting errors
npm run lint:fix      # Auto-fix linting issues
npm run format        # Format code with Prettier
```

### Building

```bash
npm run build         # Production build
npm run preview       # Preview production build
npm run generate      # Generate static site
```

### Testing

Currently the project focuses on TypeScript type checking and linting for quality assurance. Integration tests can be added using Vitest or Playwright as needed.

## 🎨 Component Development

### UI Components

All UI components follow the shadcn/ui pattern and include:
- Comprehensive TypeScript interfaces
- Accessibility features (ARIA labels, keyboard navigation)
- Consistent styling with Tailwind CSS
- JSDoc documentation

Example component structure:
```vue
<!--
/**
 * Component Description
 * 
 * Detailed explanation of the component's purpose,
 * features, and usage examples.
 * 
 * @component ComponentName
 */
-->

<template>
  <!-- Component template -->
</template>

<script setup lang="ts">
// Component logic with TypeScript
</script>
```

### Composables

Business logic is organized into Vue composables following these patterns:
- Reactive state management
- Error handling with user-friendly messages
- Loading states for async operations
- TypeScript interfaces for data structures

### Form Handling

The application uses an AutoForm system for consistent form handling:
- Zod schema-based validation
- Automatic field generation
- Inter-field dependencies
- Accessible form controls

## 🔧 Configuration

### Environment Variables

Key configuration options in `.env`:

```bash
# Required for backend functionality
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key

# Optional configurations
NUXT_PUBLIC_SITE_URL=http://localhost:3000
NUXT_PUBLIC_SUPPORT_EMAIL=support@example.com
```

### Database Schema

The application expects these main Supabase tables:
- `profiles`: User profile information and settings
- `activities`: Carbon footprint activities and emissions
- `quests`: Environmental challenges and objectives
- `user_quests`: User progress on quests
- `badges`: Achievement definitions
- `user_badges`: Awarded user achievements
- `emission_factors`: Coefficients for carbon calculations

## 🤝 Contributing

### Code Standards

1. **TypeScript First**: All code must be properly typed
2. **Component Documentation**: Use JSDoc comments for all components
3. **Accessibility**: Ensure all interactive elements are accessible
4. **Performance**: Use lazy loading and code splitting where appropriate
5. **Error Handling**: Provide user-friendly error messages and loading states

### Commit Guidelines

- Use conventional commit format: `type(scope): description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Keep commits atomic and well-described

### Pull Request Process

1. Ensure all linting passes: `npm run lint`
2. Verify the application builds: `npm run build`
3. Update documentation for any API changes
4. Test functionality across different screen sizes
5. Add JSDoc comments to new components/functions

## 🐛 Troubleshooting

### Common Issues

**Supabase Connection Errors**
- Verify `.env` file contains correct Supabase credentials
- Check network connectivity to Supabase endpoints
- Ensure Supabase project is active and accessible

**Build Errors**
- Clear `.nuxt` directory: `rm -rf .nuxt`
- Reinstall dependencies: `rm -rf node_modules package-lock.json && npm install`
- Check for TypeScript errors: `npx tsc --noEmit`

**Linting Errors**
- Run auto-fix: `npm run lint:fix`
- Check for unused imports and variables
- Ensure proper TypeScript types are defined

## 📚 Resources

- [Nuxt 3 Documentation](https://nuxt.com/docs)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)

## 🎯 Roadmap

### Immediate Improvements
- [ ] Add comprehensive test coverage
- [ ] Implement offline support with service workers
- [ ] Add real-time collaboration features
- [ ] Enhance mobile experience

### Future Features
- [ ] Advanced analytics and reporting
- [ ] Social features and community challenges
- [ ] API integrations for automatic data import
- [ ] Gamification and achievement systems
- [ ] Export functionality for data portability