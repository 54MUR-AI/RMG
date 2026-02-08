import { supabase } from './supabase'

export interface ForumCategory {
  id: string
  name: string
  description: string | null
  icon: string | null
  created_at: string
}

export interface ForumThread {
  id: string
  title: string
  content: string
  author_id: string | null
  author_name: string
  author_avatar_color: string
  is_anonymous: boolean
  category_id: string | null
  is_pinned: boolean
  is_locked: boolean
  view_count: number
  reply_count: number
  created_at: string
  updated_at: string
  category?: ForumCategory
  vote_count?: number
  user_vote?: number
}

export interface ForumPost {
  id: string
  thread_id: string
  content: string
  author_id: string | null
  author_name: string
  author_avatar_color: string
  is_anonymous: boolean
  created_at: string
  updated_at: string
  vote_count?: number
  user_vote?: number
}

export interface CreateThreadData {
  title: string
  content: string
  category_id?: string
  is_anonymous?: boolean
  author_name: string
  author_avatar_color: string
  author_id?: string
}

export interface CreatePostData {
  thread_id: string
  content: string
  is_anonymous?: boolean
  author_name: string
  author_avatar_color: string
  author_id?: string
}

// Get all categories
export async function getCategories(): Promise<ForumCategory[]> {
  const { data, error } = await supabase
    .from('forum_categories')
    .select('*')
    .order('name')

  if (error) throw error
  return data || []
}

// Get threads with optional category filter
export async function getThreads(categoryId?: string, userId?: string): Promise<ForumThread[]> {
  let query = supabase
    .from('forum_threads')
    .select(`
      *,
      category:forum_categories(*)
    `)
    .order('is_pinned', { ascending: false })
    .order('updated_at', { ascending: false })

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  const { data: threads, error } = await query

  if (error) throw error

  // Get vote counts and user votes for each thread
  if (threads) {
    const threadsWithVotes = await Promise.all(
      threads.map(async (thread) => {
        const voteData = await getThreadVotes(thread.id, userId)
        return {
          ...thread,
          vote_count: voteData.count,
          user_vote: voteData.userVote
        }
      })
    )
    return threadsWithVotes
  }

  return []
}

// Get a single thread by ID
export async function getThread(threadId: string, userId?: string): Promise<ForumThread | null> {
  const { data: thread, error } = await supabase
    .from('forum_threads')
    .select(`
      *,
      category:forum_categories(*)
    `)
    .eq('id', threadId)
    .single()

  if (error) throw error
  if (!thread) return null

  // Increment view count
  await supabase
    .from('forum_threads')
    .update({ view_count: thread.view_count + 1 })
    .eq('id', threadId)

  // Get vote data
  const voteData = await getThreadVotes(threadId, userId)

  return {
    ...thread,
    vote_count: voteData.count,
    user_vote: voteData.userVote
  }
}

// Get posts for a thread
export async function getThreadPosts(threadId: string, userId?: string): Promise<ForumPost[]> {
  const { data: posts, error } = await supabase
    .from('forum_posts')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })

  if (error) throw error

  // Get vote counts and user votes for each post
  if (posts) {
    const postsWithVotes = await Promise.all(
      posts.map(async (post) => {
        const voteData = await getPostVotes(post.id, userId)
        return {
          ...post,
          vote_count: voteData.count,
          user_vote: voteData.userVote
        }
      })
    )
    return postsWithVotes
  }

  return []
}

// Create a new thread
export async function createThread(data: CreateThreadData): Promise<ForumThread> {
  const { data: thread, error } = await supabase
    .from('forum_threads')
    .insert({
      title: data.title,
      content: data.content,
      category_id: data.category_id || null,
      is_anonymous: data.is_anonymous || false,
      author_name: data.author_name,
      author_avatar_color: data.author_avatar_color,
      author_id: data.author_id || null
    })
    .select()
    .single()

  if (error) throw error
  return thread
}

// Create a new post (reply)
export async function createPost(data: CreatePostData): Promise<ForumPost> {
  const { data: post, error } = await supabase
    .from('forum_posts')
    .insert({
      thread_id: data.thread_id,
      content: data.content,
      is_anonymous: data.is_anonymous || false,
      author_name: data.author_name,
      author_avatar_color: data.author_avatar_color,
      author_id: data.author_id || null
    })
    .select()
    .single()

  if (error) throw error
  return post
}

// Vote on a thread
export async function voteThread(threadId: string, userId: string, voteType: number): Promise<void> {
  // Check if user already voted
  const { data: existingVote } = await supabase
    .from('forum_votes')
    .select('*')
    .eq('thread_id', threadId)
    .eq('user_id', userId)
    .single()

  if (existingVote) {
    if (existingVote.vote_type === voteType) {
      // Remove vote if clicking same button
      await supabase
        .from('forum_votes')
        .delete()
        .eq('id', existingVote.id)
    } else {
      // Update vote if changing
      await supabase
        .from('forum_votes')
        .update({ vote_type: voteType })
        .eq('id', existingVote.id)
    }
  } else {
    // Create new vote
    await supabase
      .from('forum_votes')
      .insert({
        thread_id: threadId,
        user_id: userId,
        vote_type: voteType
      })
  }
}

// Vote on a post
export async function votePost(postId: string, userId: string, voteType: number): Promise<void> {
  const { data: existingVote } = await supabase
    .from('forum_votes')
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single()

  if (existingVote) {
    if (existingVote.vote_type === voteType) {
      await supabase
        .from('forum_votes')
        .delete()
        .eq('id', existingVote.id)
    } else {
      await supabase
        .from('forum_votes')
        .update({ vote_type: voteType })
        .eq('id', existingVote.id)
    }
  } else {
    await supabase
      .from('forum_votes')
      .insert({
        post_id: postId,
        user_id: userId,
        vote_type: voteType
      })
  }
}

// Get vote count and user's vote for a thread
async function getThreadVotes(threadId: string, userId?: string): Promise<{ count: number; userVote: number }> {
  const { data: votes } = await supabase
    .from('forum_votes')
    .select('vote_type, user_id')
    .eq('thread_id', threadId)

  const count = votes?.reduce((sum, vote) => sum + vote.vote_type, 0) || 0
  const userVote = userId ? votes?.find(v => v.user_id === userId)?.vote_type || 0 : 0

  return { count, userVote }
}

// Get vote count and user's vote for a post
async function getPostVotes(postId: string, userId?: string): Promise<{ count: number; userVote: number }> {
  const { data: votes } = await supabase
    .from('forum_votes')
    .select('vote_type, user_id')
    .eq('post_id', postId)

  const count = votes?.reduce((sum, vote) => sum + vote.vote_type, 0) || 0
  const userVote = userId ? votes?.find(v => v.user_id === userId)?.vote_type || 0 : 0

  return { count, userVote }
}

// Delete a thread (only by author)
export async function deleteThread(threadId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('forum_threads')
    .delete()
    .eq('id', threadId)
    .eq('author_id', userId)

  if (error) throw error
}

// Delete a post (only by author)
export async function deletePost(postId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('forum_posts')
    .delete()
    .eq('id', postId)
    .eq('author_id', userId)

  if (error) throw error
}
