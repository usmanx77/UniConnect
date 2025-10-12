# UniConnect - Enterprise Social Networking Platform

A modern, scalable university social networking platform built with React, TypeScript, and enterprise-grade architecture patterns.

## 🏗️ Architecture Overview

### Core Technologies
- **Frontend Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn/ui
- **State Management**: React Context API with custom hooks
- **Form Validation**: Custom validation utilities
- **HTTP Client**: Native fetch with service layer abstraction

## 📁 Project Structure

```
/
├── components/          # React components
│   ├── layouts/        # Layout components (MainLayout, Sidebar)
│   ├── ui/            # Shadcn UI components
│   ├── figma/         # Figma-specific components
│   └── *Page.tsx      # Page components
├── contexts/          # React Context providers
│   ├── AuthContext.tsx    # Authentication state
│   └── AppContext.tsx     # Application state
├── hooks/             # Custom React hooks
│   ├── useToast.ts        # Toast notifications
│   └── useDebounce.ts     # Debounce utility
├── lib/               # Core utilities and services
│   ├── services/          # API service layer
│   ├── utils/             # Helper utilities
│   └── constants.ts       # App-wide constants
├── types/             # TypeScript type definitions
└── styles/            # Global styles
```

## 🎯 Key Features

### 1. **Type-Safe Architecture**
- Comprehensive TypeScript types in `/types/index.ts`
- Strict type checking across all components
- Type-safe context providers and hooks

### 2. **Service Layer Pattern**
- **AuthService**: Handles authentication, login, logout, onboarding
- **PostService**: Manages post creation, retrieval, interactions
- **DataService**: (User-created) Additional data operations
- Centralized API configuration
- Consistent error handling

### 3. **Context-Based State Management**
```typescript
// AuthContext - User authentication state
const { user, login, logout, isAuthenticated, isOnboarded } = useAuth();

// AppContext - Application state
const { currentPage, navigate, darkMode, toggleDarkMode } = useApp();
```

### 4. **Error Handling**
- Global ErrorBoundary component
- Service-level error handling
- User-friendly error messages
- Development vs production error display

### 5. **Form Validation**
- Centralized validation rules in `/lib/utils/validation.ts`
- Email validation (university domains only)
- Password strength requirements
- Post content length limits
- Image file validation

### 6. **Accessibility**
- ARIA labels and roles
- Semantic HTML
- Keyboard navigation support
- Screen reader friendly
- Focus management

## 🚀 Getting Started

### Development Setup

1. **Install dependencies** (automatic in most React environments)

2. **Environment Variables**
   - No environment variables required for development
   - Uses mock services for demonstration

3. **Run the application**
   - The app will automatically start in development mode
   - Hot module replacement enabled

### Production Build

```bash
npm run build
```

## 📋 Core Concepts

### Authentication Flow

```
1. User lands on LoginPage
2. Enter verified university email credentials
3. AuthContext validates and stores user data
4. User redirected to OnboardingPage (if first time)
5. Complete onboarding → Main application
```

### Navigation

- **Desktop**: Sidebar navigation (always visible)
- **Mobile**: Bottom navigation bar
- Context-based routing via `useApp().navigate()`

### State Management Pattern

```typescript
// 1. Define types
interface User {
  id: string;
  name: string;
  // ...
}

// 2. Create service
class AuthService {
  async login(credentials) {
    // API call
  }
}

// 3. Create context
const AuthContext = createContext<AuthContextValue>();

// 4. Use in components
const { user, login } = useAuth();
```

## 🔐 Security Best Practices

1. **Input Sanitization**: All user inputs are sanitized
2. **Validation**: Client-side validation before submission
3. **Type Safety**: TypeScript prevents type-related vulnerabilities
4. **XSS Protection**: Proper escaping and sanitization
5. **University Email Restriction**: Only `.edu` domains allowed

## 🎨 UI/UX Guidelines

### Design System

- **Colors**: University-inspired blue/purple palette
- **Spacing**: Consistent 4px grid system
- **Typography**: Defined in `globals.css`
- **Shadows**: Soft shadows for depth
- **Borders**: Rounded corners (12-16px radius)

### Responsive Breakpoints

- **Mobile**: < 768px (bottom navigation)
- **Desktop**: ≥ 768px (sidebar navigation)

### Dark Mode

- Automatic theme switching
- Persisted in localStorage
- CSS variables for colors
- Smooth transitions

## 📦 Component Guidelines

### Page Components
- Located in `/components/*Page.tsx`
- Use contexts for state
- Implement loading and error states
- Follow accessibility guidelines

### UI Components
- Shadcn components in `/components/ui/`
- Never modify Shadcn components directly
- Extend via composition

### Layout Components
- `MainLayout`: Main application wrapper
- `Sidebar`: Desktop navigation
- `TopNav`: Global header
- `BottomNav`: Mobile navigation

## 🧪 Testing Strategy

### Unit Testing
```typescript
// Test utilities
import { validators } from './lib/utils/validation';

// Test services
import { authService } from './lib/services/authService';
```

### Integration Testing
- Test context providers
- Test authentication flow
- Test navigation

## 📈 Performance Optimization

1. **Code Splitting**: Route-based code splitting
2. **Lazy Loading**: Images and components
3. **Memoization**: React.memo for expensive components
4. **Debouncing**: Search and input handlers
5. **Virtual Scrolling**: For long lists (implement as needed)

## 🔧 Customization

### Adding New Features

1. **Define Types** in `/types/index.ts`
2. **Create Service** in `/lib/services/`
3. **Add Constants** in `/lib/constants.ts`
4. **Implement Component** in `/components/`
5. **Update Context** if needed

### Example: Adding a Notification System

```typescript
// 1. Define types
interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

// 2. Create service
class NotificationService {
  async getNotifications(): Promise<Notification[]> {
    // Implementation
  }
}

// 3. Use in component
const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  // Implementation
};
```

## 📚 Constants & Configuration

### Key Constants (`/lib/constants.ts`)
- `APP_NAME`: Application name
- `STORAGE_KEYS`: LocalStorage keys
- `ROUTES`: Navigation configuration
- `VALIDATION`: Validation rules
- `ERROR_MESSAGES`: Error message templates
- `SUCCESS_MESSAGES`: Success message templates

## 🐛 Debugging

### Development Tools
- React DevTools for component inspection
- TypeScript errors in IDE
- Console logging in development mode
- Error boundary catches runtime errors

### Common Issues

**Issue**: "process is not defined"
- **Solution**: Use `isDevelopment` constant instead of `process.env`

**Issue**: Context not available
- **Solution**: Ensure component is wrapped in provider

**Issue**: Type errors
- **Solution**: Check `/types/index.ts` for type definitions

## 🚢 Deployment

### Pre-deployment Checklist
- [ ] Run type checking
- [ ] Test all user flows
- [ ] Verify environment variables
- [ ] Test responsive design
- [ ] Verify accessibility
- [ ] Test dark mode
- [ ] Check error handling

### Recommended Hosting
- Vercel (recommended for Next.js migration)
- Netlify
- AWS Amplify
- Firebase Hosting

## 🔄 Migration Path to Next.js

This architecture is designed for easy migration to Next.js:

1. Convert pages to App Router structure
2. Add API routes in `/app/api/`
3. Replace mock services with real API calls
4. Add Server Components where beneficial
5. Implement SSR/SSG for better SEO

## 📄 License

[Add your license here]

## 👥 Contributing

[Add contribution guidelines]

## 🙏 Acknowledgments

- Shadcn/ui for UI components
- Tailwind CSS for styling
- React team for the framework
