# API Documentation

Welcome to the NextChat API documentation. This comprehensive guide covers all API endpoints, data structures, and integration patterns for NextChat.

## Overview

The NextChat API provides programmatic access to all core functionality including:

- **Chat Management**: Create, manage, and interact with chat sessions
- **Model Configuration**: Configure and manage AI models and providers
- **Plugin System**: Integrate with plugins and tools
- **Project Management**: Access the document-driven project system
- **User Management**: Handle authentication and user preferences

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

Most API endpoints require authentication. Include your API key in the request headers:

```http
Authorization: Bearer your_api_key_here
```

## API Endpoints

### Chat API

#### Create Chat Session

```http
POST /api/chat
Content-Type: application/json

{
  "model": "gpt-4",
  "messages": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "options": {
    "temperature": 0.7,
    "max_tokens": 1000
  }
}
```

**Response:**
```json
{
  "id": "chat_123",
  "model": "gpt-4",
  "messages": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    },
    {
      "role": "assistant",
      "content": "Hello! I'm doing well, thank you for asking."
    }
  ],
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

#### Send Message

```http
POST /api/chat/{chat_id}/messages
Content-Type: application/json

{
  "role": "user",
  "content": "Tell me about React hooks",
  "options": {
    "temperature": 0.7
  }
}
```

#### Get Chat History

```http
GET /api/chat/{chat_id}
```

#### List Chats

```http
GET /api/chat?limit=20&offset=0
```

### Model API

#### List Available Models

```http
GET /api/models
```

**Response:**
```json
{
  "models": [
    {
      "id": "gpt-4",
      "name": "GPT-4",
      "provider": "openai",
      "description": "Most capable GPT-4 model",
      "max_tokens": 8192,
      "supports_functions": true
    },
    {
      "id": "claude-3-opus",
      "name": "Claude 3 Opus",
      "provider": "anthropic",
      "description": "Most powerful Claude model",
      "max_tokens": 200000,
      "supports_functions": true
    }
  ]
}
```

#### Get Model Configuration

```http
GET /api/models/{model_id}
```

#### Update Model Configuration

```http
PUT /api/models/{model_id}
Content-Type: application/json

{
  "temperature": 0.8,
  "max_tokens": 2000,
  "system_prompt": "You are a helpful assistant."
}
```

### Plugin API

#### List Available Plugins

```http
GET /api/plugins
```

**Response:**
```json
{
  "plugins": [
    {
      "id": "file-manager",
      "name": "File Manager",
      "description": "Manage files and directories",
      "version": "1.0.0",
      "enabled": true,
      "tools": [
        {
          "name": "read_file",
          "description": "Read contents of a file"
        },
        {
          "name": "write_file",
          "description": "Write content to a file"
        }
      ]
    }
  ]
}
```

#### Install Plugin

```http
POST /api/plugins/{plugin_id}/install
```

#### Configure Plugin

```http
PUT /api/plugins/{plugin_id}/config
Content-Type: application/json

{
  "settings": {
    "max_file_size": "10MB",
    "allowed_extensions": [".txt", ".md", ".json"]
  }
}
```

#### Execute Tool

```http
POST /api/plugins/{plugin_id}/tools/{tool_name}
Content-Type: application/json

{
  "parameters": {
    "file_path": "/path/to/file.txt"
  }
}
```

### Project Management API

#### List Projects

```http
GET /api/projects?status=active&version=v1
```

**Response:**
```json
{
  "projects": [
    {
      "id": "feature-user-auth",
      "title": "User Authentication Feature",
      "version": "1.0.0",
      "stage": "implementation",
      "priority": "high",
      "status": "active",
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20
}
```

#### Get Project Details

```http
GET /api/projects/{project_id}
```

#### Create Project

```http
POST /api/projects
Content-Type: application/json

{
  "title": "New Feature",
  "description": "Description of the new feature",
  "priority": "medium",
  "tags": ["feature", "frontend"],
  "metadata": {
    "category": "ui",
    "team": "frontend"
  }
}
```

#### Update Project

```http
PUT /api/projects/{project_id}
Content-Type: application/json

{
  "status": "completed",
  "progress": 100
}
```

### User API

#### Get User Profile

```http
GET /api/user/profile
```

#### Update User Preferences

```http
PUT /api/user/preferences
Content-Type: application/json

{
  "default_model": "gpt-4",
  "theme": "dark",
  "language": "en",
  "notifications": {
    "email": true,
    "push": false
  }
}
```

#### Get User Settings

```http
GET /api/user/settings
```

## Data Types

### Chat Message

```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    model?: string;
    tokens?: number;
    cost?: number;
  };
}
```

### Chat Session

```typescript
interface ChatSession {
  id: string;
  title: string;
  model: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
  metadata?: {
    tags?: string[];
    project_id?: string;
  };
}
```

### Project

```typescript
interface Project {
  id: string;
  title: string;
  description: string;
  version: string;
  stage: 'idea' | 'plan' | 'design' | 'implementation' | 'testing' | 'review' | 'deployment' | 'completion';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  tags: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}
```

### Plugin

```typescript
interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  enabled: boolean;
  tools: Tool[];
  configuration: Record<string, any>;
}
```

### Tool

```typescript
interface Tool {
  name: string;
  description: string;
  parameters: ToolParameter[];
  returns: ToolReturn;
}

interface ToolParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  default?: any;
}
```

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "model",
        "message": "Model is required"
      }
    ]
  }
}
```

### Error Codes

- `VALIDATION_ERROR`: Request validation failed
- `AUTHENTICATION_ERROR`: Authentication required or failed
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Rate Limiting

API requests are rate limited to prevent abuse:

- **Chat API**: 100 requests per minute per user
- **Model API**: 50 requests per minute per user
- **Plugin API**: 200 requests per minute per user
- **Project API**: 100 requests per minute per user

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## SDKs and Libraries

### JavaScript/TypeScript

```bash
npm install @nextchat/api-client
```

```typescript
import { NextChatClient } from '@nextchat/api-client';

const client = new NextChatClient({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.nextchat.com'
});

// Create a chat
const chat = await client.chat.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }]
});

// Send a message
const response = await client.chat.sendMessage(chat.id, {
  role: 'user',
  content: 'How are you?'
});
```

### Python

```bash
pip install nextchat-api
```

```python
from nextchat import NextChatClient

client = NextChatClient(api_key='your_api_key')

# Create a chat
chat = client.chat.create(
    model='gpt-4',
    messages=[{'role': 'user', 'content': 'Hello!'}]
)

# Send a message
response = client.chat.send_message(
    chat_id=chat.id,
    message={'role': 'user', 'content': 'How are you?'}
)
```

## Webhooks

NextChat supports webhooks for real-time notifications:

### Configure Webhook

```http
POST /api/webhooks
Content-Type: application/json

{
  "url": "https://your-app.com/webhooks/nextchat",
  "events": ["chat.created", "chat.updated", "project.completed"],
  "secret": "your_webhook_secret"
}
```

### Webhook Payload

```json
{
  "event": "chat.created",
  "data": {
    "id": "chat_123",
    "title": "New Chat",
    "created_at": "2025-01-15T10:30:00Z"
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

## Examples

### Complete Chat Flow

```typescript
// 1. Create a new chat
const chat = await client.chat.create({
  model: 'gpt-4',
  messages: []
});

// 2. Send initial message
const response1 = await client.chat.sendMessage(chat.id, {
  role: 'user',
  content: 'Explain React hooks'
});

// 3. Continue conversation
const response2 = await client.chat.sendMessage(chat.id, {
  role: 'user',
  content: 'Give me an example of useState'
});

// 4. Get full chat history
const fullChat = await client.chat.get(chat.id);
```

### Project Management

```typescript
// 1. Create a new project
const project = await client.projects.create({
  title: 'New Feature',
  description: 'Implement user authentication',
  priority: 'high',
  tags: ['feature', 'auth']
});

// 2. Update project progress
await client.projects.update(project.id, {
  status: 'implementation',
  progress: 50
});

// 3. Complete project
await client.projects.update(project.id, {
  status: 'completed',
  progress: 100
});
```

## Support

- **API Documentation**: This comprehensive guide
- **SDK Documentation**: Language-specific guides
- **Examples**: Code examples and tutorials
- **Support**: Technical support and help

---

*This API documentation is part of the NextChat Foundation Documentation System.*
