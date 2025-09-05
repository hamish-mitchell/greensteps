# 🌱 GreenSteps

A comprehensive carbon footprint tracking application built with Vue 3, Nuxt 4, and Supabase. Help users understand and reduce their environmental impact through interactive tracking, gamification, and community features.

## ✨ Features

### 🎯 Core Functionality
- **Activity Tracking**: Log carbon emissions across transport, food, energy, and waste categories
- **Real-time Analytics**: Interactive charts and visualizations of environmental impact
- **Quest System**: Gamified challenges to encourage sustainable behaviors
- **Social Features**: Leaderboards, friends, and community engagement
- **Achievement System**: Badges and rewards for reaching environmental milestones

### 🔧 Technical Highlights
- **Modern Tech Stack**: Vue 3 + Nuxt 4 + TypeScript + Tailwind CSS
- **Component Library**: Based on shadcn/ui with custom enhancements
- **Auto-Generated Forms**: Dynamic forms from Zod schemas with validation
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Performance Optimized**: Lazy loading, code splitting, and efficient bundles
- **Type-Safe**: Comprehensive TypeScript coverage with proper interfaces

### 🎨 User Experience
- **Intuitive Onboarding**: Multi-step setup with personalized baseline calculations
- **Clean Dashboard**: Overview of progress, stats, and quick actions
- **Accessible Design**: WCAG compliance with keyboard navigation and screen reader support
- **Error Handling**: User-friendly error states with recovery options
- **Loading States**: Smooth loading experiences with skeleton components

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- A Supabase project ([create one here](https://app.supabase.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hamish-mitchell/greensteps
   cd greensteps
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your Supabase credentials:
   ```bash
   SUPABASE_URL=your-supabase-project-url
   SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗️ Project Structure

```
app/
├── components/         # Vue components
│   ├── ui/            # Design system components
│   └── dashboard/     # Dashboard-specific components
├── composables/       # Business logic and state management
├── layouts/          # Application layouts
├── pages/            # Auto-routed pages
├── utils/            # Utility functions
└── assets/           # Static assets and styles

server/               # API routes and server logic
docs/                 # Documentation
types/                # TypeScript definitions
```

## 🛠️ Development

### Code Quality
```bash
npm run lint          # Check linting
npm run lint:fix      # Auto-fix issues
npm run format        # Format code
```

### Building
```bash
npm run build         # Production build
npm run preview       # Preview build
npm run generate      # Static generation
```

See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed development guidelines.

## 🌐 Technology Stack

### Frontend
- **[Nuxt 4](https://nuxt.com/)**: Full-stack Vue framework
- **[Vue 3](https://vuejs.org/)**: Progressive JavaScript framework
- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first styling
- **[shadcn/ui](https://ui.shadcn.com/)**: Component library

### Backend & Services
- **[Supabase](https://supabase.com/)**: Backend-as-a-Service
- **[Chart.js](https://www.chartjs.org/)**: Data visualization
- **[Zod](https://zod.dev/)**: Schema validation

### Development Tools
- **ESLint + Prettier**: Code quality and formatting
- **Husky**: Git hooks for quality assurance
- **Vite**: Fast build tooling

## 📊 Recent Improvements

This repository has been recently enhanced with:

### ✅ Code Quality & Documentation
- **110+ linting errors fixed** with proper TypeScript interfaces
- **Comprehensive JSDoc comments** throughout the codebase
- **Enhanced error handling** with user-friendly error states
- **Improved loading states** with skeleton components

### ✅ UI/UX Enhancements
- **Modern landing page** with feature highlights and call-to-actions
- **Enhanced dashboard** with better messaging and visual feedback
- **New reusable components**: ErrorState, LoadingSpinner, StatsCard
- **Improved accessibility** with proper ARIA labels and keyboard navigation

### ✅ Developer Experience
- **Development documentation** with setup guides and contribution guidelines
- **Mock data utilities** for development without backend dependency
- **Environment configuration** with comprehensive .env.example
- **Component architecture** documentation and usage examples

## 🤝 Contributing

We welcome contributions! Please see our [contributing guidelines](./DEVELOPMENT.md#contributing) for details on:

- Code standards and TypeScript requirements
- Component documentation with JSDoc
- Accessibility and performance guidelines
- Commit message conventions
- Pull request process

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌍 Environmental Impact

GreenSteps is designed to help individuals and communities reduce their carbon footprint through:
- **Data-driven insights** into personal environmental impact
- **Behavioral change** through gamification and social features
- **Education** with tips, resources, and best practices
- **Community engagement** fostering collective environmental action

Together, we can make a difference! 🌱

---

*Built with ❤️ for a sustainable future*
