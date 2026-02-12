import { Handler } from '@netlify/functions'
import { ensureSourcesFolder } from '../../src/lib/ldgr/folders'

export const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    }
  }

  try {
    const { user_id } = JSON.parse(event.body || '{}')
    
    if (!user_id) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'user_id required' })
      }
    }

    // Ensure Sources subfolder exists (on-demand creation)
    const sourcesFolder = await ensureSourcesFolder(user_id)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        id: sourcesFolder.id,
        name: sourcesFolder.name,
        parent_id: sourcesFolder.parent_id,
        path: 'Scrapes/Sources',
        user_id: sourcesFolder.user_id
      })
    }
  } catch (error) {
    console.error('Error ensuring Sources folder:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Failed to ensure Sources folder',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}
