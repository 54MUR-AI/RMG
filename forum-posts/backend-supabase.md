# How-to: Supabase Backend Setup & Best Practices

**Category:** Backend  
**Difficulty:** Intermediate  
**Tags:** #supabase #database #authentication #backend

---

## Overview

Supabase is our primary backend-as-a-service platform, providing PostgreSQL database, authentication, real-time subscriptions, and storage. This guide covers setup, best practices, and common patterns used across RMG projects.

## What You'll Learn

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
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
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
  email: 'user@example.com',
  password: 'secure-password',
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password',
})

// Sign out
await supabase.auth.signOut()

// Get current user
const { data: { user } } = await supabase.auth.getUser()
```

### OAuth Providers

```typescript
// Google OAuth
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'https://yourapp.com/auth/callback'
  }
})
```

### Auth State Management

```typescript
// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('User signed in:', session.user)
  }
  if (event === 'SIGNED_OUT') {
    console.log('User signed out')
  }
})
```

---

## Database Operations

### Basic CRUD Operations

```typescript
// SELECT
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)

// INSERT
const { data, error } = await supabase
  .from('users')
  .insert({ name: 'John Doe', email: 'john@example.com' })
  .select()
  .single()

// UPDATE
const { data, error } = await supabase
  .from('users')
  .update({ name: 'Jane Doe' })
  .eq('id', userId)

// DELETE
const { data, error } = await supabase
  .from('users')
  .delete()
  .eq('id', userId)
```

### Advanced Queries

```typescript
// Filtering and ordering
const { data } = await supabase
  .from('posts')
  .select('*')
  .eq('published', true)
  .order('created_at', { ascending: false })
  .limit(10)

// Joins (relationships)
const { data } = await supabase
  .from('posts')
  .select(`
    *,
    author:users(name, avatar),
    comments(count)
  `)

// Full-text search
const { data } = await supabase
  .from('posts')
  .select('*')
  .textSearch('title', 'supabase', { type: 'websearch' })
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

-- Public read access
CREATE POLICY "Public read access"
ON posts FOR SELECT
USING (published = true);

-- Authenticated users can create
CREATE POLICY "Authenticated users can create"
ON posts FOR INSERT
WITH CHECK (auth.role() = 'authenticated');
```

### Testing RLS

```typescript
// This will respect RLS policies
const { data } = await supabase
  .from('users')
  .select('*')
  // Only returns rows user has access to
```

---

## Real-time Subscriptions

```typescript
// Subscribe to table changes
const channel = supabase
  .channel('posts-changes')
  .on(
    'postgres_changes',
    {
      event: '*', // INSERT, UPDATE, DELETE, or *
      schema: 'public',
      table: 'posts'
    },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()

// Unsubscribe when done
channel.unsubscribe()
```

---

## File Storage

### Upload Files

```typescript
const file = event.target.files[0]

const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`public/${userId}/${file.name}`, file, {
    cacheControl: '3600',
    upsert: false
  })
```

### Download Files

```typescript
const { data, error } = await supabase.storage
  .from('avatars')
  .download('public/avatar.png')

// Create blob URL
const url = URL.createObjectURL(data)
```

### Get Public URL

```typescript
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl('public/avatar.png')

console.log(data.publicUrl)
```

---

## Best Practices

### 1. Error Handling

```typescript
const { data, error } = await supabase
  .from('users')
  .select('*')

if (error) {
  console.error('Database error:', error.message)
  // Handle error appropriately
  throw error
}

// Use data safely
```

### 2. Type Safety

```typescript
// Define types for your tables
interface User {
  id: string
  email: string
  name: string
  created_at: string
}

const { data } = await supabase
  .from('users')
  .select('*')
  .returns<User[]>()
```

### 3. Connection Pooling

Supabase handles connection pooling automatically. Don't create multiple clients.

### 4. Batch Operations

```typescript
// Insert multiple rows at once
const { data, error } = await supabase
  .from('posts')
  .insert([
    { title: 'Post 1', content: '...' },
    { title: 'Post 2', content: '...' },
    { title: 'Post 3', content: '...' }
  ])
```

### 5. Use Transactions (via RPC)

```sql
-- Create stored procedure
CREATE OR REPLACE FUNCTION transfer_funds(
  from_account UUID,
  to_account UUID,
  amount NUMERIC
)
RETURNS void AS $$
BEGIN
  UPDATE accounts SET balance = balance - amount WHERE id = from_account;
  UPDATE accounts SET balance = balance + amount WHERE id = to_account;
END;
$$ LANGUAGE plpgsql;
```

```typescript
// Call from client
await supabase.rpc('transfer_funds', {
  from_account: 'uuid-1',
  to_account: 'uuid-2',
  amount: 100
})
```

---

## Common Patterns in RMG Projects

### 1. LDGR: Encrypted File Storage

```typescript
// Encrypt before upload
const encryptedBlob = await encryptFile(file, encryptionKey)

const { data } = await supabase.storage
  .from('files')
  .upload(fileName, encryptedBlob, {
    contentType: 'application/octet-stream'
  })

// Store metadata in database
await supabase.from('files').insert({
  user_id: userId,
  name: file.name,
  storage_path: data.path
})
```

### 2. Forum: Voting System

```typescript
// Atomic vote toggle
const { data: existingVote } = await supabase
  .from('votes')
  .select('*')
  .eq('post_id', postId)
  .eq('user_id', userId)
  .single()

if (existingVote) {
  // Remove or update vote
  if (existingVote.vote_type === voteType) {
    await supabase.from('votes').delete().eq('id', existingVote.id)
  } else {
    await supabase.from('votes').update({ vote_type: voteType }).eq('id', existingVote.id)
  }
} else {
  // Create new vote
  await supabase.from('votes').insert({ post_id: postId, user_id: userId, vote_type: voteType })
}
```

### 3. API Keys: Secure Storage

```typescript
// Store encrypted API keys
await supabase.from('api_keys').insert({
  user_id: userId,
  service_name: 'openai',
  encrypted_key: encryptedKey,
  is_active: true
})

// Fetch with RLS protection
const { data } = await supabase
  .from('api_keys')
  .select('*')
  .eq('is_active', true)
// RLS ensures user only sees their own keys
```

---

## Troubleshooting

### Issue: "JWT expired" errors

**Solution:** Refresh the session:

```typescript
const { data, error } = await supabase.auth.refreshSession()
```

### Issue: RLS blocking legitimate queries

**Solution:** Check your policies and use service role key for admin operations (server-side only).

### Issue: Real-time not working

**Solution:** Enable replication on your table:

```sql
ALTER TABLE posts REPLICA IDENTITY FULL;
```

---

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JS Client Reference](https://supabase.com/docs/reference/javascript/introduction)

---

**Questions?** Drop a reply below or check out our other backend guides!
