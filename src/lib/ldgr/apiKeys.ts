import { supabase } from '../supabase'

export interface ApiKey {
  id: string
  user_id: string
  service_name: string
  key_name: string
  encrypted_key: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  last_used_at: string | null
}

export interface ApiKeyInput {
  service_name: string
  key_name: string
  api_key: string
  description?: string
}

// Comprehensive list of supported API services
export const API_SERVICES = {
  // AI/LLM Services
  'openai': { name: 'OpenAI', category: 'AI/LLM', icon: '🤖' },
  'anthropic': { name: 'Anthropic (Claude)', category: 'AI/LLM', icon: '🧠' },
  'google-ai': { name: 'Google AI (Gemini)', category: 'AI/LLM', icon: '🔮' },
  'cohere': { name: 'Cohere', category: 'AI/LLM', icon: '💬' },
  'huggingface': { name: 'Hugging Face', category: 'AI/LLM', icon: '🤗' },
  'replicate': { name: 'Replicate', category: 'AI/LLM', icon: '🔄' },
  'together-ai': { name: 'Together AI', category: 'AI/LLM', icon: '🤝' },
  'perplexity': { name: 'Perplexity AI', category: 'AI/LLM', icon: '🔍' },
  'mistral': { name: 'Mistral AI', category: 'AI/LLM', icon: '🌬️' },
  
  // Web Scraping & Data
  'scraperapi': { name: 'ScraperAPI', category: 'Scraping', icon: '🕷️' },
  'brightdata': { name: 'Bright Data', category: 'Scraping', icon: '💡' },
  'apify': { name: 'Apify', category: 'Scraping', icon: '🐝' },
  'scrapingbee': { name: 'ScrapingBee', category: 'Scraping', icon: '🐝' },
  'oxylabs': { name: 'Oxylabs', category: 'Scraping', icon: '🔬' },
  'zyte': { name: 'Zyte (Scrapy Cloud)', category: 'Scraping', icon: '🕸️' },
  
  // Cloud & Infrastructure
  'aws': { name: 'AWS', category: 'Cloud', icon: '☁️' },
  'gcp': { name: 'Google Cloud', category: 'Cloud', icon: '☁️' },
  'azure': { name: 'Microsoft Azure', category: 'Cloud', icon: '☁️' },
  'digitalocean': { name: 'DigitalOcean', category: 'Cloud', icon: '🌊' },
  'vercel': { name: 'Vercel', category: 'Cloud', icon: '▲' },
  'netlify': { name: 'Netlify', category: 'Cloud', icon: '🦋' },
  'cloudflare': { name: 'Cloudflare', category: 'Cloud', icon: '🛡️' },
  
  // Database & Storage
  'supabase': { name: 'Supabase', category: 'Database', icon: '⚡' },
  'mongodb': { name: 'MongoDB Atlas', category: 'Database', icon: '🍃' },
  'planetscale': { name: 'PlanetScale', category: 'Database', icon: '🪐' },
  'redis': { name: 'Redis Cloud', category: 'Database', icon: '🔴' },
  'pinecone': { name: 'Pinecone', category: 'Database', icon: '🌲' },
  
  // APIs & Services
  'stripe': { name: 'Stripe', category: 'Payment', icon: '💳' },
  'twilio': { name: 'Twilio', category: 'Communication', icon: '📱' },
  'sendgrid': { name: 'SendGrid', category: 'Email', icon: '📧' },
  'github': { name: 'GitHub', category: 'Development', icon: '🐙' },
  'gitlab': { name: 'GitLab', category: 'Development', icon: '🦊' },
  'discord': { name: 'Discord Bot', category: 'Social', icon: '💬' },
  'slack': { name: 'Slack', category: 'Communication', icon: '💼' },
  
  // Analytics & Monitoring
  'google-analytics': { name: 'Google Analytics', category: 'Analytics', icon: '📊' },
  'mixpanel': { name: 'Mixpanel', category: 'Analytics', icon: '📈' },
  'sentry': { name: 'Sentry', category: 'Monitoring', icon: '🔔' },
  'datadog': { name: 'Datadog', category: 'Monitoring', icon: '🐕' },
  
  // Search & Discovery
  'algolia': { name: 'Algolia', category: 'Search', icon: '🔍' },
  'elasticsearch': { name: 'Elasticsearch', category: 'Search', icon: '🔎' },
  
  // Other
  'custom': { name: 'Custom API', category: 'Other', icon: '🔧' },
}

// Password-derived key encryption using Web Crypto API
async function deriveEncryptionKey(password: string, salt: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

// Encrypt API key using user's email as password (they're already authenticated)
export async function encryptApiKey(apiKey: string, userEmail: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(apiKey)
  
  // Use user email as salt (unique per user)
  const salt = userEmail
  const key = await deriveEncryptionKey(userEmail, salt)
  
  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(12))
  
  // Encrypt
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  )
  
  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(encrypted), iv.length)
  
  // Convert to base64
  return btoa(String.fromCharCode(...combined))
}

// Decrypt API key
export async function decryptApiKey(encryptedKey: string, userEmail: string): Promise<string> {
  // Decode from base64
  const combined = Uint8Array.from(atob(encryptedKey), c => c.charCodeAt(0))
  
  // Extract IV and encrypted data
  const iv = combined.slice(0, 12)
  const encrypted = combined.slice(12)
  
  // Derive key
  const salt = userEmail
  const key = await deriveEncryptionKey(userEmail, salt)
  
  // Decrypt
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encrypted
  )
  
  // Convert to string
  const decoder = new TextDecoder()
  return decoder.decode(decrypted)
}

// Get all API keys for a user
export async function getUserApiKeys(userId: string): Promise<ApiKey[]> {
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

// Get API keys by service
export async function getApiKeysByService(userId: string, serviceName: string): Promise<ApiKey[]> {
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('user_id', userId)
    .eq('service_name', serviceName)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

// Add new API key
export async function addApiKey(
  userId: string,
  userEmail: string,
  input: ApiKeyInput
): Promise<ApiKey> {
  // Encrypt the API key
  const encryptedKey = await encryptApiKey(input.api_key, userEmail)
  
  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      user_id: userId,
      service_name: input.service_name,
      key_name: input.key_name,
      encrypted_key: encryptedKey,
      description: input.description || null,
      is_active: true
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Update API key
export async function updateApiKey(
  keyId: string,
  userEmail: string,
  updates: Partial<ApiKeyInput>
): Promise<ApiKey> {
  const updateData: any = {}
  
  if (updates.key_name) updateData.key_name = updates.key_name
  if (updates.description !== undefined) updateData.description = updates.description
  if (updates.api_key) {
    updateData.encrypted_key = await encryptApiKey(updates.api_key, userEmail)
  }
  
  const { data, error } = await supabase
    .from('api_keys')
    .update(updateData)
    .eq('id', keyId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Toggle API key active status
export async function toggleApiKeyStatus(keyId: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('api_keys')
    .update({ is_active: isActive })
    .eq('id', keyId)
  
  if (error) throw error
}

// Delete API key
export async function deleteApiKey(keyId: string): Promise<void> {
  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', keyId)
  
  if (error) throw error
}

// Update last used timestamp
export async function updateApiKeyLastUsed(keyId: string): Promise<void> {
  const { error } = await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', keyId)
  
  if (error) throw error
}

// Get decrypted API key for use in applications
export async function getDecryptedApiKey(
  userId: string,
  userEmail: string,
  serviceName: string,
  keyName?: string
): Promise<string | null> {
  let query = supabase
    .from('api_keys')
    .select('*')
    .eq('user_id', userId)
    .eq('service_name', serviceName)
    .eq('is_active', true)
  
  if (keyName) {
    query = query.eq('key_name', keyName)
  }
  
  const { data, error } = await query.single()
  
  if (error || !data) return null
  
  // Update last used
  await updateApiKeyLastUsed(data.id)
  
  // Decrypt and return
  return await decryptApiKey(data.encrypted_key, userEmail)
}
