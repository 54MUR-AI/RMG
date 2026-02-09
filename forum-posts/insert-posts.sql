-- Insert forum categories if they don't exist
INSERT INTO forum_categories (name, description, icon)
VALUES 
  ('Backend', 'Backend development, APIs, databases, and server-side technologies', '🔧'),
  ('Frontend', 'Frontend development, UI/UX, and client-side technologies', '🎨'),
  ('AI & ML', 'Artificial Intelligence, Machine Learning, and LLM integration', '🤖')
ON CONFLICT (name) DO NOTHING;

-- Get category IDs (you'll need to replace these with actual UUIDs after categories are created)
-- Run: SELECT id, name FROM forum_categories;
-- Then replace the category_id values below

-- Insert Supabase Backend Guide
INSERT INTO forum_threads (
  title,
  content,
  author_name,
  author_avatar_color,
  is_anonymous,
  category_id,
  is_pinned
)
VALUES (
  'How-to: Supabase Backend Setup & Best Practices',
  '**Category:** Backend  
**Difficulty:** Intermediate  
**Tags:** #supabase #database #authentication #backend

---

## Overview

Supabase is our primary backend-as-a-service platform, providing PostgreSQL database, authentication, real-time subscriptions, and storage. This guide covers setup, best practices, and common patterns used across RMG projects.

## What You''ll Learn

- Setting up Supabase client in your project
- Implementing Row Level Security (RLS)
- Authentication flows
- Database queries and relationships
- Real-time subscriptions
- File storage with encryption

---

## Prerequisites

- Node.js installed
- Basic understanding of SQL
- Supabase account (free tier available)

---

## Installation

```bash
npm install @supabase/supabase-js
```

---

## Basic Setup

### 1. Create Supabase Client

```typescript
// src/lib/supabase.ts
import { createClient } from ''@supabase/supabase-js''

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(''Missing Supabase environment variables'')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 2. Environment Variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Security Note:** Never commit `.env` files to git. Add to `.gitignore`.

---

## Authentication

### Email/Password Authentication

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: ''user@example.com'',
  password: ''secure-password'',
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: ''user@example.com'',
  password: ''secure-password'',
})

// Sign out
await supabase.auth.signOut()

// Get current user
const { data: { user } } = await supabase.auth.getUser()
```

---

## Database Operations

### Basic CRUD Operations

```typescript
// SELECT
const { data, error } = await supabase
  .from(''users'')
  .select(''*'')
  .eq(''id'', userId)

// INSERT
const { data, error } = await supabase
  .from(''users'')
  .insert({ name: ''John Doe'', email: ''john@example.com'' })
  .select()
  .single()

// UPDATE
const { data, error } = await supabase
  .from(''users'')
  .update({ name: ''Jane Doe'' })
  .eq(''id'', userId)

// DELETE
const { data, error } = await supabase
  .from(''users'')
  .delete()
  .eq(''id'', userId)
```

---

## Row Level Security (RLS)

RLS is **critical** for security. Enable it on all tables.

### Example RLS Policies

```sql
-- Users can only read their own data
CREATE POLICY "Users can view own data"
ON users FOR SELECT
USING (auth.uid() = id);

-- Users can only update their own data
CREATE POLICY "Users can update own data"
ON users FOR UPDATE
USING (auth.uid() = id);
```

---

## Best Practices

1. **Error Handling** - Always check for errors
2. **Type Safety** - Define types for your tables
3. **Connection Pooling** - Supabase handles this automatically
4. **Batch Operations** - Insert multiple rows at once
5. **Use Transactions** - Via RPC for complex operations

---

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Questions?** Drop a reply below or check out our other backend guides!',
  'RMG Team',
  '#DC2626',
  false,
  (SELECT id FROM forum_categories WHERE name = 'Backend'),
  true
);

-- Insert FastAPI Backend Guide
INSERT INTO forum_threads (
  title,
  content,
  author_name,
  author_avatar_color,
  is_anonymous,
  category_id,
  is_pinned
)
VALUES (
  'How-to: FastAPI Backend Development',
  '**Category:** Backend  
**Difficulty:** Intermediate  
**Tags:** #fastapi #python #api #backend #rest

---

## Overview

FastAPI is a modern, high-performance Python web framework for building APIs. It''s used in RMG projects like SCRP for its speed, automatic documentation, and type safety.

## What You''ll Learn

- FastAPI project setup and structure
- Route definitions and path operations
- Request/response models with Pydantic
- Dependency injection
- Authentication and middleware
- Database integration
- Error handling and validation

---

## Installation

```bash
pip install fastapi uvicorn[standard] python-multipart
```

---

## Basic Setup

```python
from fastapi import FastAPI

app = FastAPI(
    title="My API",
    description="API description",
    version="1.0.0"
)

@app.get("/")
async def root():
    return {"message": "Hello World"}

# Run with: uvicorn main:app --reload
```

---

## Route Operations

### Basic CRUD

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    id: int
    name: str
    price: float

@app.post("/items/", status_code=201)
async def create_item(item: Item):
    return item

@app.get("/items/{item_id}")
async def get_item(item_id: int):
    return {"item_id": item_id}
```

---

## Best Practices

1. **Use Pydantic models** - Type safety and validation
2. **Implement proper error handling** - Return meaningful errors
3. **Use dependency injection** - Keep code modular
4. **Add API documentation** - FastAPI auto-generates it
5. **Write tests** - Use TestClient

---

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Pydantic Documentation](https://docs.pydantic.dev)

---

**Questions?** Drop a reply below!',
  'RMG Team',
  '#DC2626',
  false,
  (SELECT id FROM forum_categories WHERE name = 'Backend'),
  true
);

-- Insert React + Vite Frontend Guide
INSERT INTO forum_threads (
  title,
  content,
  author_name,
  author_avatar_color,
  is_anonymous,
  category_id,
  is_pinned
)
VALUES (
  'How-to: React + Vite Frontend Development',
  '**Category:** Frontend  
**Difficulty:** Beginner to Intermediate  
**Tags:** #react #vite #frontend #javascript

---

## Overview

React with Vite is our go-to frontend stack for building fast, modern web applications. Vite provides lightning-fast HMR and optimized builds.

## What You''ll Learn

- Setting up a React + Vite project
- Component patterns and best practices
- State management with hooks
- Routing with React Router
- Environment variables
- Building and deploying

---

## Project Setup

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
npm run dev
```

---

## Component Patterns

### Functional Components

```tsx
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: ''primary'' | ''secondary''
}

export default function Button({ label, onClick, variant = ''primary'' }: ButtonProps) {
  return (
    <button onClick={onClick} className={`btn btn-${variant}`}>
      {label}
    </button>
  )
}
```

---

## State Management

### useState Hook

```tsx
import { useState } from ''react''

function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  )
}
```

---

## Best Practices

1. **Keep components small and focused**
2. **Use TypeScript** - Catch errors early
3. **Avoid prop drilling** - Use Context API
4. **Handle loading and error states**
5. **Test your components**

---

## Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)

---

**Questions?** Drop a reply below!',
  'RMG Team',
  '#DC2626',
  false,
  (SELECT id FROM forum_categories WHERE name = 'Frontend'),
  true
);

-- Insert Tailwind CSS Guide
INSERT INTO forum_threads (
  title,
  content,
  author_name,
  author_avatar_color,
  is_anonymous,
  category_id,
  is_pinned
)
VALUES (
  'How-to: Tailwind CSS for Modern UI Design',
  '**Category:** Frontend  
**Difficulty:** Beginner  
**Tags:** #tailwind #css #styling #design

---

## Overview

Tailwind CSS is a utility-first CSS framework that lets you build custom designs without leaving your HTML. It''s our primary styling solution across RMG projects.

## What You''ll Learn

- Setting up Tailwind CSS
- Core utility classes
- Responsive design patterns
- Custom configurations
- Dark mode implementation
- Component patterns

---

## Installation

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## Core Utilities

### Layout

```html
<!-- Flexbox -->
<div class="flex items-center justify-between gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Grid -->
<div class="grid grid-cols-3 gap-4">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>
```

---

## Responsive Design

```html
<div class="w-full md:w-1/2 lg:w-1/3">
  <!-- Full width on mobile, half on tablet, third on desktop -->
</div>
```

### Breakpoints

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

---

## Best Practices

1. **Use @apply sparingly** - Prefer utility classes
2. **Create component classes** - For repeated patterns
3. **Leverage JIT mode** - Compiles only used classes
4. **Use arbitrary values** - `w-[137px]` for one-off sizes

---

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com)

---

**Questions?** Drop a reply below!',
  'RMG Team',
  '#DC2626',
  false,
  (SELECT id FROM forum_categories WHERE name = 'Frontend'),
  true
);

-- Insert OpenAI API Guide
INSERT INTO forum_threads (
  title,
  content,
  author_name,
  author_avatar_color,
  is_anonymous,
  category_id,
  is_pinned
)
VALUES (
  'How-to: OpenAI API Integration & Best Practices',
  '**Category:** AI & ML  
**Difficulty:** Intermediate  
**Tags:** #openai #gpt #ai #api #llm

---

## Overview

OpenAI''s API provides access to powerful language models like GPT-4, GPT-3.5, and embeddings. This guide covers integration patterns, best practices, and cost optimization.

## What You''ll Learn

- Setting up OpenAI API client
- Chat completions and streaming
- Function calling
- Embeddings for semantic search
- Token management and cost optimization
- Error handling and rate limiting

---

## Installation

```bash
npm install openai
```

---

## Basic Setup

```typescript
import OpenAI from ''openai''

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const completion = await openai.chat.completions.create({
  model: ''gpt-3.5-turbo'',
  messages: [{ role: ''user'', content: ''Hello!'' }],
})
```

---

## Chat Completions

```typescript
async function chat(userMessage: string) {
  const completion = await openai.chat.completions.create({
    model: ''gpt-4-turbo-preview'',
    messages: [
      {
        role: ''system'',
        content: ''You are a helpful assistant.''
      },
      {
        role: ''user'',
        content: userMessage
      }
    ],
    temperature: 0.7,
    max_tokens: 500,
  })

  return completion.choices[0].message.content
}
```

---

## Cost Optimization

1. **Use appropriate models** - GPT-3.5 for simple tasks
2. **Limit max_tokens** - Prevent runaway costs
3. **Cache responses** - Reduce redundant calls
4. **Batch processing** - Process multiple items at once

---

## Best Practices

1. **Always set max_tokens**
2. **Use system messages** - Guide model behavior
3. **Lower temperature for factual tasks**
4. **Implement retry logic**
5. **Monitor usage**
6. **Validate responses**
7. **Secure API keys** - Never expose client-side

---

## Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [OpenAI Cookbook](https://github.com/openai/openai-cookbook)

---

**Questions?** Drop a reply below!',
  'RMG Team',
  '#DC2626',
  false,
  (SELECT id FROM forum_categories WHERE name = 'AI & ML'),
  true
);

-- Verify insertions
SELECT 
  t.title,
  c.name as category,
  t.is_pinned,
  t.created_at
FROM forum_threads t
LEFT JOIN forum_categories c ON t.category_id = c.id
WHERE t.author_name = 'RMG Team'
ORDER BY t.created_at DESC;
