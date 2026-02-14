import { supabase } from '../supabase'
import { encryptText, decryptText, legacyDecryptText } from './encryption'

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
  'xai': { name: 'xAI (Grok)', category: 'AI/LLM', icon: '⚡' },
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
  
  // Financial & Market Data
  'fred': { name: 'FRED (Federal Reserve)', category: 'Financial', icon: '🏛️' },
  'alpha-vantage': { name: 'Alpha Vantage', category: 'Financial', icon: '📈' },
  'polygon': { name: 'Polygon.io', category: 'Financial', icon: '📊' },
  'finnhub': { name: 'Finnhub', category: 'Financial', icon: '🐟' },
  'iex-cloud': { name: 'IEX Cloud', category: 'Financial', icon: '💹' },
  'quandl': { name: 'Quandl (Nasdaq)', category: 'Financial', icon: '📉' },
  'coinmarketcap': { name: 'CoinMarketCap', category: 'Financial', icon: '🪙' },
  'coingecko': { name: 'CoinGecko Pro', category: 'Financial', icon: '🦎' },
  'tradingview': { name: 'TradingView', category: 'Financial', icon: '📺' },
  'morningstar': { name: 'Morningstar', category: 'Financial', icon: '⭐' },
  'twelve-data': { name: 'Twelve Data', category: 'Financial', icon: '🔢' },
  'marketstack': { name: 'Marketstack', category: 'Financial', icon: '📋' },
  'tiingo': { name: 'Tiingo', category: 'Financial', icon: '🎯' },
  'intrinio': { name: 'Intrinio', category: 'Financial', icon: '🏦' },
  'eodhd': { name: 'EODHD', category: 'Financial', icon: '📆' },
  'polymarket': { name: 'Polymarket', category: 'Financial', icon: '🎰' },
  'yahoo-finance': { name: 'Yahoo Finance (RapidAPI)', category: 'Financial', icon: '💰' },

  // SIGINT & Tracking
  'opensky': { name: 'OpenSky Network', category: 'SIGINT', icon: '✈️' },
  'adsb-exchange': { name: 'ADS-B Exchange', category: 'SIGINT', icon: '📡' },
  'flightradar24': { name: 'Flightradar24', category: 'SIGINT', icon: '🛩️' },
  'marinetraffic': { name: 'MarineTraffic (AIS)', category: 'SIGINT', icon: '🚢' },
  'vesselfinder': { name: 'VesselFinder', category: 'SIGINT', icon: '⚓' },
  'ais-hub': { name: 'AIS Hub', category: 'SIGINT', icon: '🌊' },

  // OSINT & Intelligence
  'newsapi': { name: 'NewsAPI', category: 'OSINT', icon: '📰' },
  'gdelt': { name: 'GDELT Project', category: 'OSINT', icon: '🌐' },
  'acled': { name: 'ACLED (Conflict Data)', category: 'OSINT', icon: '⚔️' },
  'nasa-firms': { name: 'NASA FIRMS (Fire/Hotspot)', category: 'OSINT', icon: '🔥' },
  'nasa-earthdata': { name: 'NASA Earthdata', category: 'OSINT', icon: '🛰️' },
  'sentinel-hub': { name: 'Sentinel Hub', category: 'OSINT', icon: '🗺️' },

  // Cybersecurity
  'shodan': { name: 'Shodan', category: 'Cybersecurity', icon: '🔓' },
  'virustotal': { name: 'VirusTotal', category: 'Cybersecurity', icon: '🦠' },
  'abuseipdb': { name: 'AbuseIPDB', category: 'Cybersecurity', icon: '🚫' },
  'nvd': { name: 'NVD (NIST CVE)', category: 'Cybersecurity', icon: '🛡️' },
  'greynoise': { name: 'GreyNoise', category: 'Cybersecurity', icon: '📻' },
  'censys': { name: 'Censys', category: 'Cybersecurity', icon: '🔎' },
  'urlscan': { name: 'urlscan.io', category: 'Cybersecurity', icon: '🌐' },

  // Other
  'custom': { name: 'Custom API', category: 'Other', icon: '🔧' },
}

// Encrypt API key using unified encryption (user ID + purpose-based key derivation)
export async function encryptApiKey(apiKey: string, userId: string): Promise<string> {
  return encryptText(apiKey, userId, 'apikeys')
}

// Decrypt API key — tries new system first, falls back to legacy email-based encryption
export async function decryptApiKey(encryptedKey: string, userIdOrEmail: string, userId?: string): Promise<string> {
  // If userId is provided separately, try new system with userId first
  if (userId) {
    try {
      return await decryptText(encryptedKey, userId, 'apikeys')
    } catch {
      // Fall back to legacy email-based decryption
      const legacy = await legacyDecryptText(encryptedKey, userIdOrEmail, userIdOrEmail)
      if (legacy !== null) return legacy
      throw new Error('Failed to decrypt API key')
    }
  }

  // Legacy path: userIdOrEmail is the email (old call sites)
  // Try as userId first (new system), then as email (old system)
  try {
    return await decryptText(encryptedKey, userIdOrEmail, 'apikeys')
  } catch {
    const legacy = await legacyDecryptText(encryptedKey, userIdOrEmail, userIdOrEmail)
    if (legacy !== null) return legacy
    throw new Error('Failed to decrypt API key')
  }
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
  _userEmail: string,
  input: ApiKeyInput
): Promise<ApiKey> {
  // Encrypt using userId (userEmail param kept for API compatibility)
  const encryptedKey = await encryptApiKey(input.api_key, userId)
  
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
  userIdOrEmail: string,
  updates: Partial<ApiKeyInput>
): Promise<ApiKey> {
  const updateData: Record<string, string | boolean | null> = {}
  
  if (updates.key_name) updateData.key_name = updates.key_name
  if (updates.description !== undefined) updateData.description = updates.description
  if (updates.api_key) {
    updateData.encrypted_key = await encryptApiKey(updates.api_key, userIdOrEmail)
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
