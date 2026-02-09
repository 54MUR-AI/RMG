# How-to: OpenAI API Integration & Best Practices

**Category:** AI & ML  
**Difficulty:** Intermediate  
**Tags:** #openai #gpt #ai #api #llm

---

## Overview

OpenAI's API provides access to powerful language models like GPT-4, GPT-3.5, and embeddings. This guide covers integration patterns, best practices, and cost optimization strategies used across RMG projects.

## What You'll Learn

- Setting up OpenAI API client
- Chat completions and streaming
- Function calling
- Embeddings for semantic search
- Token management and cost optimization
- Error handling and rate limiting

---

## Prerequisites

- OpenAI API account and key
- Node.js or Python environment
- Basic understanding of REST APIs
- Familiarity with async/await

---

## Installation

### JavaScript/TypeScript

```bash
npm install openai
```

### Python

```bash
pip install openai
```

---

## Basic Setup

### JavaScript

```typescript
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Test connection
async function testConnection() {
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: 'Hello!' }],
  })
  
  console.log(completion.choices[0].message.content)
}
```

### Python

```python
from openai import OpenAI

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# Test connection
response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "Hello!"}]
)

print(response.choices[0].message.content)
```

---

## Chat Completions

### Basic Chat

```typescript
async function chat(userMessage: string) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that provides concise answers.'
      },
      {
        role: 'user',
        content: userMessage
      }
    ],
    temperature: 0.7,
    max_tokens: 500,
  })

  return completion.choices[0].message.content
}
```

### Conversation History

```typescript
interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

class ChatSession {
  private messages: Message[] = []

  constructor(systemPrompt: string) {
    this.messages.push({
      role: 'system',
      content: systemPrompt
    })
  }

  async sendMessage(userMessage: string): Promise<string> {
    // Add user message
    this.messages.push({
      role: 'user',
      content: userMessage
    })

    // Get completion
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: this.messages,
    })

    const assistantMessage = completion.choices[0].message.content

    // Add assistant response to history
    this.messages.push({
      role: 'assistant',
      content: assistantMessage
    })

    return assistantMessage
  }

  // Trim old messages to manage token count
  trimHistory(maxMessages: number = 10) {
    if (this.messages.length > maxMessages) {
      // Keep system message and recent messages
      const systemMessage = this.messages[0]
      const recentMessages = this.messages.slice(-maxMessages + 1)
      this.messages = [systemMessage, ...recentMessages]
    }
  }
}
```

---

## Streaming Responses

### Stream Chat Completions

```typescript
async function streamChat(userMessage: string) {
  const stream = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{ role: 'user', content: userMessage }],
    stream: true,
  })

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || ''
    process.stdout.write(content)
  }
}
```

### React Streaming Component

```tsx
function StreamingChat() {
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(message: string) {
    setLoading(true)
    setResponse('')

    const stream = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: message }],
      stream: true,
    })

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || ''
      setResponse(prev => prev + content)
    }

    setLoading(false)
  }

  return (
    <div>
      <div className="response">{response}</div>
      {loading && <div>Streaming...</div>}
    </div>
  )
}
```

---

## Function Calling

### Define Functions

```typescript
const functions = [
  {
    name: 'get_weather',
    description: 'Get the current weather for a location',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'The city and state, e.g. San Francisco, CA'
        },
        unit: {
          type: 'string',
          enum: ['celsius', 'fahrenheit'],
          description: 'The temperature unit'
        }
      },
      required: ['location']
    }
  }
]
```

### Use Function Calling

```typescript
async function chatWithFunctions(userMessage: string) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{ role: 'user', content: userMessage }],
    functions: functions,
    function_call: 'auto',
  })

  const message = completion.choices[0].message

  // Check if function was called
  if (message.function_call) {
    const functionName = message.function_call.name
    const functionArgs = JSON.parse(message.function_call.arguments)

    // Execute the function
    let functionResult
    if (functionName === 'get_weather') {
      functionResult = await getWeather(functionArgs.location, functionArgs.unit)
    }

    // Send function result back to model
    const secondCompletion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'user', content: userMessage },
        message,
        {
          role: 'function',
          name: functionName,
          content: JSON.stringify(functionResult)
        }
      ],
    })

    return secondCompletion.choices[0].message.content
  }

  return message.content
}
```

---

## Embeddings

### Generate Embeddings

```typescript
async function getEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })

  return response.data[0].embedding
}
```

### Semantic Search

```typescript
// Calculate cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0)
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
  return dotProduct / (magnitudeA * magnitudeB)
}

// Search documents
async function semanticSearch(query: string, documents: string[]) {
  // Get query embedding
  const queryEmbedding = await getEmbedding(query)

  // Get document embeddings
  const docEmbeddings = await Promise.all(
    documents.map(doc => getEmbedding(doc))
  )

  // Calculate similarities
  const similarities = docEmbeddings.map((docEmb, i) => ({
    document: documents[i],
    similarity: cosineSimilarity(queryEmbedding, docEmb)
  }))

  // Sort by similarity
  return similarities.sort((a, b) => b.similarity - a.similarity)
}
```

---

## Token Management

### Count Tokens

```typescript
import { encoding_for_model } from 'tiktoken'

function countTokens(text: string, model: string = 'gpt-4'): number {
  const encoding = encoding_for_model(model)
  const tokens = encoding.encode(text)
  encoding.free()
  return tokens.length
}

// Estimate cost
function estimateCost(inputTokens: number, outputTokens: number, model: string): number {
  const pricing = {
    'gpt-4-turbo-preview': { input: 0.01, output: 0.03 }, // per 1K tokens
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  }

  const rates = pricing[model] || pricing['gpt-3.5-turbo']
  return (inputTokens / 1000) * rates.input + (outputTokens / 1000) * rates.output
}
```

### Truncate Context

```typescript
function truncateToTokenLimit(text: string, maxTokens: number, model: string = 'gpt-4'): string {
  const encoding = encoding_for_model(model)
  const tokens = encoding.encode(text)
  
  if (tokens.length <= maxTokens) {
    encoding.free()
    return text
  }

  const truncated = tokens.slice(0, maxTokens)
  const result = encoding.decode(truncated)
  encoding.free()
  
  return result
}
```

---

## Error Handling

### Retry Logic

```typescript
async function callWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error

      // Check if error is retryable
      if (error.status === 429 || error.status >= 500) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
        continue
      }

      throw error
    }
  }
}

// Usage
const response = await callWithRetry(() =>
  openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{ role: 'user', content: 'Hello' }],
  })
)
```

### Rate Limiting

```typescript
class RateLimiter {
  private queue: Array<() => Promise<any>> = []
  private processing = false
  private requestsPerMinute: number

  constructor(requestsPerMinute: number = 60) {
    this.requestsPerMinute = requestsPerMinute
  }

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })

      if (!this.processing) {
        this.process()
      }
    })
  }

  private async process() {
    this.processing = true

    while (this.queue.length > 0) {
      const fn = this.queue.shift()
      if (fn) {
        await fn()
        await new Promise(resolve => 
          setTimeout(resolve, 60000 / this.requestsPerMinute)
        )
      }
    }

    this.processing = false
  }
}

// Usage
const limiter = new RateLimiter(60) // 60 requests per minute

const response = await limiter.add(() =>
  openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{ role: 'user', content: 'Hello' }],
  })
)
```

---

## Cost Optimization

### 1. Use Appropriate Models

```typescript
// Use GPT-3.5 for simple tasks
const simpleTask = await openai.chat.completions.create({
  model: 'gpt-3.5-turbo', // 20x cheaper than GPT-4
  messages: [{ role: 'user', content: 'Summarize this in one sentence: ...' }],
})

// Use GPT-4 for complex reasoning
const complexTask = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  messages: [{ role: 'user', content: 'Analyze this complex code and suggest improvements...' }],
})
```

### 2. Limit Max Tokens

```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  messages: [{ role: 'user', content: 'Brief answer please' }],
  max_tokens: 150, // Limit response length
})
```

### 3. Cache Responses

```typescript
const cache = new Map<string, string>()

async function cachedCompletion(prompt: string): Promise<string> {
  // Check cache first
  if (cache.has(prompt)) {
    return cache.get(prompt)!
  }

  // Call API
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
  })

  const response = completion.choices[0].message.content
  cache.set(prompt, response)

  return response
}
```

### 4. Batch Processing

```typescript
async function batchProcess(items: string[]) {
  // Process multiple items in one request
  const prompt = `Process these items:\n${items.map((item, i) => `${i + 1}. ${item}`).join('\n')}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
  })

  return completion.choices[0].message.content
}
```

---

## RMG Project Patterns

### SCRP: Content Summarization

```typescript
async function summarizeContent(content: string, provider: string = 'openai') {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are a content summarizer. Provide concise, accurate summaries with key points.'
      },
      {
        role: 'user',
        content: `Summarize this content:\n\n${content}`
      }
    ],
    temperature: 0.3, // Lower for more consistent summaries
    max_tokens: 500,
  })

  return {
    summary: completion.choices[0].message.content,
    model: completion.model,
    tokens: completion.usage?.total_tokens,
  }
}
```

### Code Analysis

```typescript
async function analyzeCode(code: string, language: string) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are an expert code reviewer. Analyze code for bugs, performance issues, and best practices.'
      },
      {
        role: 'user',
        content: `Analyze this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``
      }
    ],
    temperature: 0.2,
  })

  return completion.choices[0].message.content
}
```

---

## Best Practices

1. **Always set max_tokens** - Prevent runaway costs
2. **Use system messages** - Guide model behavior consistently
3. **Lower temperature for factual tasks** - 0.0-0.3 for summaries, 0.7-1.0 for creative
4. **Implement retry logic** - Handle rate limits and transient errors
5. **Monitor usage** - Track tokens and costs
6. **Validate responses** - Check for hallucinations and errors
7. **Use streaming for UX** - Show progress to users
8. **Cache when possible** - Reduce redundant API calls
9. **Choose right model** - Balance cost vs capability
10. **Secure API keys** - Never expose in client-side code

---

## Security

### Never Expose API Keys

```typescript
// ❌ BAD - Client-side
const openai = new OpenAI({
  apiKey: 'sk-...' // NEVER do this!
})

// ✅ GOOD - Server-side only
// Backend API
app.post('/api/chat', async (req, res) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: req.body.messages,
  })
  
  res.json(completion)
})
```

### Input Validation

```typescript
function validateInput(input: string): boolean {
  // Check length
  if (input.length > 10000) {
    throw new Error('Input too long')
  }

  // Check for prompt injection attempts
  const dangerousPatterns = [
    /ignore previous instructions/i,
    /disregard all prior/i,
  ]

  for (const pattern of dangerousPatterns) {
    if (pattern.test(input)) {
      throw new Error('Invalid input detected')
    }
  }

  return true
}
```

---

## Troubleshooting

### Issue: Rate limit errors (429)

**Solution:** Implement exponential backoff, reduce request frequency, or upgrade tier.

### Issue: Context length exceeded

**Solution:** Truncate input, summarize previous messages, or use a model with larger context.

### Issue: Inconsistent responses

**Solution:** Lower temperature, improve system prompt, use few-shot examples.

### Issue: High costs

**Solution:** Use GPT-3.5 where possible, set max_tokens, implement caching.

---

## Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [OpenAI Cookbook](https://github.com/openai/openai-cookbook)
- [Best Practices Guide](https://platform.openai.com/docs/guides/production-best-practices)
- [Pricing Calculator](https://openai.com/pricing)

---

**Questions?** Drop a reply below or check out our other AI/ML guides!
