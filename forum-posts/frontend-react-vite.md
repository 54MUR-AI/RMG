# How-to: React + Vite Frontend Development

**Category:** Frontend  
**Difficulty:** Beginner to Intermediate  
**Tags:** #react #vite #frontend #javascript

---

## Overview

React with Vite is our go-to frontend stack for building fast, modern web applications. Vite provides lightning-fast HMR (Hot Module Replacement) and optimized builds, while React gives us a powerful component-based architecture.

## What You'll Learn

- Setting up a React + Vite project
- Component patterns and best practices
- State management with hooks
- Routing with React Router
- Environment variables
- Building and deploying

---

## Prerequisites

- Node.js 18+ installed
- Basic JavaScript/TypeScript knowledge
- Understanding of HTML/CSS

---

## Project Setup

### Create New Project

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
npm run dev
```

### Project Structure

```
my-app/
├── public/           # Static assets
├── src/
│   ├── assets/      # Images, fonts, etc.
│   ├── components/  # React components
│   ├── lib/         # Utility functions
│   ├── pages/       # Page components
│   ├── App.tsx      # Root component
│   └── main.tsx     # Entry point
├── index.html       # HTML template
├── vite.config.ts   # Vite configuration
└── package.json
```

---

## Component Patterns

### Functional Components

```tsx
// Basic component
export default function Button({ label, onClick }) {
  return (
    <button onClick={onClick} className="btn">
      {label}
    </button>
  )
}

// With TypeScript
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

export default function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onClick} className={`btn btn-${variant}`}>
      {label}
    </button>
  )
}
```

### Component Composition

```tsx
// Container component
export default function Card({ children, title }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <div className="card-content">
        {children}
      </div>
    </div>
  )
}

// Usage
<Card title="User Profile">
  <Avatar src={user.avatar} />
  <UserInfo name={user.name} email={user.email} />
</Card>
```

---

## State Management

### useState Hook

```tsx
import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
    </div>
  )
}
```

### useEffect Hook

```tsx
import { useState, useEffect } from 'react'

function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      setLoading(true)
      const response = await fetch(`/api/users/${userId}`)
      const data = await response.json()
      setUser(data)
      setLoading(false)
    }

    fetchUser()
  }, [userId]) // Re-run when userId changes

  if (loading) return <div>Loading...</div>
  if (!user) return <div>User not found</div>

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  )
}
```

### Custom Hooks

```tsx
// useAuth hook
function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => unsubscribe.data.subscription.unsubscribe()
  }, [])

  return { user, loading }
}

// Usage
function App() {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return <LoginPage />

  return <Dashboard user={user} />
}
```

---

## Routing

### Install React Router

```bash
npm install react-router-dom
```

### Basic Routing

```tsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
```

### Protected Routes

```tsx
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" replace />

  return children
}

// Usage
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### Dynamic Routes

```tsx
<Routes>
  <Route path="/users/:userId" element={<UserProfile />} />
  <Route path="/posts/:postId/edit" element={<EditPost />} />
</Routes>

// Access params in component
import { useParams } from 'react-router-dom'

function UserProfile() {
  const { userId } = useParams()
  // Fetch user with userId
}
```

---

## Environment Variables

### Setup

Create `.env` file:

```env
VITE_API_URL=https://api.example.com
VITE_SUPABASE_URL=https://project.supabase.co
VITE_SUPABASE_ANON_KEY=your-key
```

**Important:** Vite requires `VITE_` prefix for environment variables.

### Usage

```tsx
const apiUrl = import.meta.env.VITE_API_URL
const isDev = import.meta.env.DEV
const isProd = import.meta.env.PROD

// Type-safe env vars (vite-env.d.ts)
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}
```

---

## Styling

### Tailwind CSS (Recommended)

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

```tsx
// Component with Tailwind
function Button({ children, variant = 'primary' }) {
  const baseClasses = 'px-4 py-2 rounded-lg font-semibold transition-colors'
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800'
  }

  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </button>
  )
}
```

### CSS Modules

```css
/* Button.module.css */
.button {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
}

.primary {
  background-color: #3b82f6;
  color: white;
}
```

```tsx
import styles from './Button.module.css'

function Button({ variant = 'primary' }) {
  return (
    <button className={`${styles.button} ${styles[variant]}`}>
      Click me
    </button>
  )
}
```

---

## Performance Optimization

### Code Splitting

```tsx
import { lazy, Suspense } from 'react'

// Lazy load components
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Settings = lazy(() => import('./pages/Settings'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  )
}
```

### Memoization

```tsx
import { useMemo, useCallback } from 'react'

function ExpensiveComponent({ data, onUpdate }) {
  // Memoize expensive calculations
  const processedData = useMemo(() => {
    return data.map(item => expensiveOperation(item))
  }, [data])

  // Memoize callbacks
  const handleClick = useCallback((id) => {
    onUpdate(id)
  }, [onUpdate])

  return (
    <div>
      {processedData.map(item => (
        <Item key={item.id} data={item} onClick={handleClick} />
      ))}
    </div>
  )
}
```

### React.memo

```tsx
import { memo } from 'react'

// Only re-renders if props change
const ExpensiveChild = memo(function ExpensiveChild({ data }) {
  return <div>{/* Complex rendering */}</div>
})
```

---

## Form Handling

### Controlled Components

```tsx
function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await signIn(email, password)
    } catch (error) {
      console.error('Login failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}
```

### Form Libraries

```bash
npm install react-hook-form zod @hookform/resolvers
```

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  })

  const onSubmit = (data) => {
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register('password')} type="password" placeholder="Password" />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">Sign In</button>
    </form>
  )
}
```

---

## Building & Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

### Preview Build

```bash
npm run preview
```

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    }
  }
})
```

---

## Common Patterns in RMG Projects

### 1. Auth Context

```tsx
// contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => unsubscribe.data.subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

### 2. API Hooks

```tsx
// hooks/useApi.ts
function useApi(url) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const response = await fetch(url)
        const json = await response.json()
        setData(json)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [url])

  return { data, loading, error }
}
```

### 3. Modal Pattern

```tsx
function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <button onClick={onClose} className="float-right">×</button>
        {children}
      </div>
    </div>
  )
}
```

---

## Best Practices

1. **Keep components small and focused** - One responsibility per component
2. **Use TypeScript** - Catch errors early with type safety
3. **Avoid prop drilling** - Use Context API or state management libraries
4. **Handle loading and error states** - Always provide feedback to users
5. **Optimize images** - Use WebP format and lazy loading
6. **Test your components** - Use Vitest and React Testing Library
7. **Follow naming conventions** - PascalCase for components, camelCase for functions
8. **Use ESLint and Prettier** - Maintain consistent code style

---

## Troubleshooting

### Issue: "Module not found" errors

**Solution:** Check import paths and ensure dependencies are installed.

### Issue: Slow HMR

**Solution:** Reduce the number of dependencies, use code splitting.

### Issue: Build size too large

**Solution:** Analyze bundle with `rollup-plugin-visualizer`, lazy load routes.

---

## Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [React Router](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)

---

**Questions?** Drop a reply below or check out our other frontend guides!
