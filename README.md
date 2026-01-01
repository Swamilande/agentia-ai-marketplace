# Agentia - AI Agent Marketplace

A modern, full-featured AI agent marketplace built with React, TypeScript, and Tailwind CSS. Users can discover, purchase, and manage AI agents for various business use cases.

## Features

### Core Functionality
- **AI Agent Marketplace** - Browse, search, and filter AI agents by category, price, and rating
- **Agent Details** - View comprehensive agent information with live demo capabilities
- **Purchase Flow** - Secure checkout process with payment integration
- **User Dashboard** - Personal workspace for managing purchased and created agents
- **Authentication** - Complete login/signup flow with session persistence

### User Experience
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Smooth Animations** - Page transitions and micro-interactions using Framer Motion
- **Dark Mode Ready** - Full theming support via CSS variables
- **Empty States** - Friendly onboarding for new users with actionable CTAs

## Technology Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 18 |
| **Language** | TypeScript |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS |
| **UI Components** | shadcn/ui (Radix UI primitives) |
| **State Management** | Zustand |
| **Routing** | React Router DOM v6 |
| **Animations** | Framer Motion |
| **HTTP Client** | Axios |
| **Form Handling** | React Hook Form + Zod |
| **Icons** | Lucide React |

## Project Structure

```
src/
├── components/
│   ├── dashboard/       # Dashboard-specific components
│   │   └── EmptyState.tsx
│   ├── home/            # Homepage sections
│   │   ├── AboutSection.tsx
│   │   ├── CTASection.tsx
│   │   ├── FeaturedAgents.tsx
│   │   ├── HeroSection.tsx
│   │   └── HowItWorks.tsx
│   ├── layout/          # Layout components
│   │   ├── AnimatedRoutes.tsx
│   │   ├── Footer.tsx
│   │   ├── Navbar.tsx
│   │   ├── PageTransition.tsx
│   │   └── ProtectedRoute.tsx
│   ├── marketplace/     # Marketplace components
│   │   └── AgentCard.tsx
│   └── ui/              # Reusable UI primitives (shadcn)
│       ├── button.tsx
│       ├── badge.tsx
│       ├── card.tsx
│       └── ... (50+ components)
├── data/
│   ├── mockAgents.ts        # Agent catalog mock data
│   └── mockDashboardData.ts # Dashboard mock data
├── hooks/
│   ├── use-mobile.tsx   # Mobile detection hook
│   └── use-toast.ts     # Toast notifications
├── pages/
│   ├── auth/
│   │   ├── Login.tsx    # Login page
│   │   └── Signup.tsx   # Registration page
│   ├── About.tsx        # About page
│   ├── AgentDetail.tsx  # Individual agent page
│   ├── Contact.tsx      # Contact page
│   ├── Dashboard.tsx    # User dashboard
│   ├── Index.tsx        # Homepage
│   ├── Marketplace.tsx  # Agent marketplace
│   ├── NotFound.tsx     # 404 page
│   └── Purchase.tsx     # Checkout page
├── stores/
│   ├── authStore.ts     # Authentication state
│   └── purchaseStore.ts # Purchase management
├── lib/
│   └── utils.ts         # Utility functions
├── App.tsx              # Root component
├── index.css            # Global styles & design tokens
└── main.tsx             # Application entry point
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd agentia-marketplace

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## Authentication Flow

The app uses Zustand with localStorage persistence for authentication:

```typescript
// Login flow
1. User submits credentials on /auth/login
2. authStore.login() validates and creates session
3. Tokens stored in localStorage (key: 'agentia-auth')
4. User redirected to /dashboard
5. Navbar updates to show Dashboard button

// Session persistence
- Tokens persist across browser refreshes
- Automatic logout on token expiration
- Protected routes redirect to login if unauthenticated
```

### Token Storage

```typescript
// Stored in localStorage under 'agentia-auth'
{
  user: { id, email, name, avatarUrl },
  accessToken: string,
  refreshToken: string,
  isAuthenticated: boolean
}
```

## Purchase Flow

```typescript
// Purchase flow
1. User clicks "Purchase Now" on agent detail page
2. purchaseStore.setPendingPurchase() stores intent
3. User redirected to /purchase/:agentId
4. Payment form submitted
5. purchaseStore.completePurchase() records transaction
6. User redirected back to agent page
7. Button changes to "Use Agent"
8. Purchase appears in Dashboard

// Purchase storage (localStorage: 'agentia-purchases')
{
  purchases: [{
    id: string,
    agentId: string,
    userId: string,
    status: 'pending' | 'completed' | 'failed' | 'refunded',
    purchasedAt: string,
    amount: number,
    agentServerUrl: string
  }]
}
```

## Backend Integration Points

The frontend is ready for backend integration. Replace mock implementations at these locations:

### Authentication (`src/stores/authStore.ts`)

```typescript
// Replace mock login (line 36-55)
login: async (email, password) => {
  // TODO: Call your authentication API
  const response = await api.post('/auth/login', { email, password });
  set({
    user: response.data.user,
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
    isAuthenticated: true,
  });
}
```

### Purchases (`src/stores/purchaseStore.ts`)

```typescript
// Replace mock purchase completion (line 40-54)
completePurchase: async (agentId, userId, amount) => {
  // TODO: Call your payment API
  const response = await api.post('/purchases', { agentId, userId, amount });
  set(state => ({
    purchases: [...state.purchases, response.data.purchase],
    pendingPurchase: null,
  }));
}
```

### Dashboard Data (`src/pages/Dashboard.tsx`)

```typescript
// Replace mock data fetching (lines 52-100)
// TODO: Fetch from API
const { data: dashboardData } = useQuery({
  queryKey: ['dashboard', user?.id],
  queryFn: () => api.get(`/users/${user?.id}/dashboard`)
});
```

### Agent Catalog (`src/data/mockAgents.ts`)

```typescript
// Replace with API call
// TODO: Fetch agents from backend
const { data: agents } = useQuery({
  queryKey: ['agents'],
  queryFn: () => api.get('/agents')
});
```

## Design System

The app uses a comprehensive design system defined in `src/index.css`:

### CSS Variables

```css
:root {
  --background: 222 47% 5%;
  --foreground: 210 40% 98%;
  --primary: 142 76% 36%;
  --secondary: 210 40% 96%;
  --muted: 215 16% 13%;
  --accent: 142 76% 36%;
  /* ... see index.css for full list */
}
```

### Tailwind Extensions

Custom utilities defined in `tailwind.config.ts`:
- Glass morphism effects (`glass-card`)
- Gradient backgrounds
- Custom animations
- Extended color palette

## Routes

| Route | Component | Auth Required | Description |
|-------|-----------|---------------|-------------|
| `/` | Index | No | Homepage with hero and featured agents |
| `/marketplace` | Marketplace | No | Browse all agents |
| `/agent/:id` | AgentDetail | No | Individual agent details |
| `/purchase/:id` | Purchase | Yes | Checkout page |
| `/dashboard` | Dashboard | Yes | User workspace |
| `/auth/login` | Login | No | Sign in page |
| `/auth/signup` | Signup | No | Registration page |
| `/about` | About | No | About page |
| `/contact` | Contact | No | Contact form |

## Mock Data Structure

### Agent (`src/data/mockAgents.ts`)

```typescript
interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  hasLiveDemo: boolean;
  tags: string[];
}
```

### Dashboard Data (`src/data/mockDashboardData.ts`)

```typescript
interface DashboardData {
  stats: {
    totalAgents: number;
    apiCalls: string;
    avgResponse: string;
    successRate: string;
  };
  createdAgents: DashboardAgent[];
  purchasedAgents: DashboardAgent[];
  transactions: Transaction[];
  activityHistory: Activity[];
}
```

## Environment Variables

Currently, the app uses mock data and doesn't require environment variables. When integrating with a backend, add:

```env
VITE_API_URL=https://your-api-url.com
VITE_STRIPE_PUBLIC_KEY=pk_test_xxx
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
