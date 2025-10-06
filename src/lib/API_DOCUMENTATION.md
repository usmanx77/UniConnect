# API Service Documentation

## Overview

The application uses a service layer pattern to abstract API calls and business logic from UI components. All services are located in `/lib/services/`.

## Service Architecture

```typescript
Service Layer (Mock/Real API)
    ↓
Context Providers (State Management)
    ↓
Custom Hooks (useAuth, useApp)
    ↓
React Components (UI)
```

## Services

### 1. AuthService (`/lib/services/authService.ts`)

Handles all authentication-related operations.

#### Methods

##### `login(credentials: LoginCredentials)`
Authenticates a user with email and password.

**Parameters:**
```typescript
interface LoginCredentials {
  email: string;
  password: string;
}
```

**Returns:**
```typescript
Promise<{
  user: User;
  token: string;
}>
```

**Example:**
```typescript
import { authService } from './lib/services/authService';

const { user, token } = await authService.login({
  email: 'student@university.edu',
  password: 'securePassword123'
});
```

**Error Handling:**
- Throws error if email is not `.edu` domain
- Throws error if authentication fails

---

##### `logout()`
Logs out the current user.

**Returns:** `Promise<void>`

**Example:**
```typescript
await authService.logout();
```

---

##### `completeOnboarding(data: OnboardingData)`
Completes user onboarding with department and batch information.

**Parameters:**
```typescript
interface OnboardingData {
  department: string;
  batch: string;
  interests: string[];
}
```

**Returns:** `Promise<User>`

**Example:**
```typescript
const updatedUser = await authService.completeOnboarding({
  department: 'Computer Science',
  batch: 'Fall 2023',
  interests: ['AI', 'Web Development']
});
```

---

##### `updateProfile(updates: Partial<User>)`
Updates user profile information.

**Parameters:** `Partial<User>` - Any user fields to update

**Returns:** `Promise<User>`

**Example:**
```typescript
const updatedUser = await authService.updateProfile({
  bio: 'Passionate about AI and machine learning',
  avatar: 'https://...'
});
```

---

##### `verifyToken(token: string)`
Verifies if a JWT token is valid.

**Parameters:** `token: string`

**Returns:** `Promise<boolean>`

---

##### `requestPasswordReset(email: string)`
Sends a password reset email.

**Parameters:** `email: string`

**Returns:** `Promise<void>`

---

### 2. PostService (`/lib/services/postService.ts`)

Manages post-related operations.

#### Methods

##### `createPost(input: CreatePostInput)`
Creates a new post.

**Parameters:**
```typescript
interface CreatePostInput {
  content: string;
  image?: string;
  pollOptions?: string[];
}
```

**Returns:** `Promise<Post>`

**Example:**
```typescript
import { postService } from './lib/services/postService';

const newPost = await postService.createPost({
  content: 'Just finished my project!',
  image: 'https://...'
});
```

---

##### `getPosts(page?: number, limit?: number)`
Retrieves a paginated list of posts.

**Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Posts per page (default: 10)

**Returns:** `Promise<Post[]>`

**Example:**
```typescript
const posts = await postService.getPosts(1, 20);
```

---

##### `likePost(postId: string)`
Likes a post.

**Parameters:** `postId: string`

**Returns:** `Promise<void>`

---

##### `unlikePost(postId: string)`
Unlikes a post.

**Parameters:** `postId: string`

**Returns:** `Promise<void>`

---

##### `deletePost(postId: string)`
Deletes a post.

**Parameters:** `postId: string`

**Returns:** `Promise<void>`

---

### 3. DataService (User-Created)

You can add additional services following the same pattern.

**Example Template:**

```typescript
// /lib/services/connectionService.ts
import type { Connection, ConnectionRequest } from "../../types";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class ConnectionService {
  async getConnections(): Promise<Connection[]> {
    await delay(500);
    // Implementation
    return [];
  }

  async sendConnectionRequest(userId: string): Promise<void> {
    await delay(300);
    // Implementation
  }

  async acceptConnectionRequest(requestId: string): Promise<void> {
    await delay(300);
    // Implementation
  }

  async rejectConnectionRequest(requestId: string): Promise<void> {
    await delay(300);
    // Implementation
  }
}

export const connectionService = new ConnectionService();
```

## Error Handling

All services should throw errors that can be caught by components:

```typescript
try {
  await authService.login(credentials);
} catch (error) {
  if (error instanceof AppError) {
    // Handle custom app error
  } else {
    // Handle generic error
  }
}
```

### Custom Error Class

```typescript
import { AppError } from './lib/utils/errorHandler';

throw new AppError(
  'Authentication failed',
  'AUTH_FAILED',
  401
);
```

## Integration with Contexts

Services are integrated with Context providers:

```typescript
// In AuthContext
const login = async (credentials: LoginCredentials) => {
  setState(prev => ({ ...prev, isLoading: true, error: null }));
  
  try {
    const { user, token } = await authService.login(credentials);
    
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    
    setState({
      isAuthenticated: true,
      isOnboarded: false,
      user,
      isLoading: false,
      error: null,
    });
  } catch (error) {
    setState(prev => ({
      ...prev,
      isLoading: false,
      error: error instanceof Error ? error.message : "Login failed",
    }));
    throw error;
  }
};
```

## Mock vs Real Implementation

### Current Implementation (Mock)

```typescript
async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
  await delay(1000); // Simulate network delay
  
  // Mock validation
  if (!credentials.email.endsWith(".edu")) {
    throw new Error("Please use your university email address");
  }
  
  // Return mock data
  return { user, token };
}
```

### Real Implementation (Example)

```typescript
async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
  const response = await fetch(`${this.baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  
  if (!response.ok) {
    throw new AppError('Authentication failed', 'AUTH_FAILED', response.status);
  }
  
  return await response.json();
}
```

## API Configuration

All API configuration is centralized in `/lib/constants.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: "https://api.uniconnect.edu",
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
} as const;
```

## Best Practices

### 1. **Always Handle Errors**
```typescript
try {
  const result = await service.someMethod();
  // Success
} catch (error) {
  // Handle error
}
```

### 2. **Use TypeScript Types**
```typescript
// ✅ Good
async getUser(id: string): Promise<User> { }

// ❌ Bad
async getUser(id: any): Promise<any> { }
```

### 3. **Implement Loading States**
```typescript
const [isLoading, setIsLoading] = useState(false);

const handleAction = async () => {
  setIsLoading(true);
  try {
    await service.someMethod();
  } finally {
    setIsLoading(false);
  }
};
```

### 4. **Validate Before API Calls**
```typescript
const validation = validators.email(email);
if (!validation.valid) {
  toast.error(validation.message);
  return;
}

await service.login({ email, password });
```

### 5. **Use Toast for User Feedback**
```typescript
const toast = useToast();

try {
  await service.createPost(data);
  toast.success(toast.messages.success.POST_CREATED);
} catch (error) {
  toast.error("Failed to create post");
}
```

## Adding a New Service

1. **Create service file**
```bash
/lib/services/newService.ts
```

2. **Define the service class**
```typescript
class NewService {
  private baseUrl = API_CONFIG.BASE_URL;
  
  async someMethod(): Promise<SomeType> {
    // Implementation
  }
}

export const newService = new NewService();
```

3. **Export from index (optional)**
```typescript
// /lib/services/index.ts
export { authService } from './authService';
export { postService } from './postService';
export { newService } from './newService';
```

4. **Use in components**
```typescript
import { newService } from '../lib/services/newService';

const MyComponent = () => {
  const handleAction = async () => {
    await newService.someMethod();
  };
};
```

## Testing Services

```typescript
// Example test
describe('AuthService', () => {
  it('should login with valid credentials', async () => {
    const result = await authService.login({
      email: 'test@university.edu',
      password: 'password123'
    });
    
    expect(result.user).toBeDefined();
    expect(result.token).toBeDefined();
  });
  
  it('should reject non-edu emails', async () => {
    await expect(
      authService.login({
        email: 'test@gmail.com',
        password: 'password123'
      })
    ).rejects.toThrow('university email');
  });
});
```

## Migration to Real API

When ready to connect to a real backend:

1. Update `API_CONFIG.BASE_URL` in constants
2. Replace mock implementations with real fetch calls
3. Add authentication headers
4. Implement retry logic
5. Add request/response interceptors
6. Implement refresh token logic

```typescript
// Example with auth headers
async makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  
  const response = await fetch(`${this.baseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  if (response.status === 401) {
    // Handle token refresh
  }
  
  return response;
}
```
