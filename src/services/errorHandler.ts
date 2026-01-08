export class AgentError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable: boolean = false,
    public details?: string
  ) {
    super(message);
    this.name = 'AgentError';
  }
}

export interface ErrorContext {
  provider?: 'gemini' | 'openai';
  agentId?: string;
  operation?: string;
}

export function handleAgentError(error: unknown, context?: ErrorContext): string {
  console.error('Agent error:', error, context);

  if (error instanceof AgentError) {
    return error.message;
  }

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();

    // API Key errors
    if (msg.includes('api key') || msg.includes('api_key') || msg.includes('unauthorized') || msg.includes('401')) {
      const provider = context?.provider || 'LLM';
      return `❌ API Key Error: Please add your ${provider.toUpperCase()} API key in Settings. Go to Settings → API Keys to configure.`;
    }

    // Rate limiting
    if (msg.includes('rate limit') || msg.includes('429') || msg.includes('too many requests')) {
      return '⏱️ Rate Limited: Too many requests. Please wait 60 seconds and try again.';
    }

    // Quota exceeded
    if (msg.includes('quota') || msg.includes('billing') || msg.includes('exceeded')) {
      return '💳 Quota Exceeded: Your API quota has been exceeded. Please check your billing settings.';
    }

    // Model not available
    if (msg.includes('model') && (msg.includes('not found') || msg.includes('not available'))) {
      return '🤖 Model Unavailable: The selected AI model is not available. Try switching providers.';
    }

    // File errors
    if (msg.includes('unsupported file') || msg.includes('file type')) {
      return `📁 Unsupported File: ${error.message}`;
    }

    // File processing errors
    if (msg.includes('failed to process') || msg.includes('parsing error')) {
      return `📄 File Error: ${error.message}`;
    }

    // Network errors
    if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch') || msg.includes('connection')) {
      return '🌐 Network Error: Unable to connect. Please check your internet connection and try again.';
    }

    // Timeout errors
    if (msg.includes('timeout') || msg.includes('timed out')) {
      return '⏰ Timeout: The request took too long. Try with a smaller file or simpler request.';
    }

    // Content filtering
    if (msg.includes('safety') || msg.includes('blocked') || msg.includes('content policy')) {
      return '🛡️ Content Blocked: The request was blocked by content safety filters. Please rephrase your request.';
    }

    // Context length
    if (msg.includes('context') || msg.includes('token') || msg.includes('too long')) {
      return '📏 Input Too Long: The input exceeds the model\'s context limit. Try with a smaller file or shorter prompt.';
    }

    // Server errors
    if (msg.includes('500') || msg.includes('server error') || msg.includes('internal error')) {
      return '🔧 Server Error: The AI service encountered an error. Please try again in a moment.';
    }

    // Generic error with message
    return `❌ Error: ${error.message}`;
  }

  return '❌ Unknown Error: An unexpected error occurred. Please try again.';
}

export function isRecoverableError(error: unknown): boolean {
  if (error instanceof AgentError) {
    return error.recoverable;
  }

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    // These errors might resolve on retry
    return msg.includes('rate limit') ||
           msg.includes('timeout') ||
           msg.includes('network') ||
           msg.includes('server error') ||
           msg.includes('500');
  }

  return false;
}

export function getRetryDelay(error: unknown): number {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    
    if (msg.includes('rate limit')) {
      return 60000; // 60 seconds for rate limits
    }
    if (msg.includes('timeout')) {
      return 5000; // 5 seconds for timeouts
    }
    if (msg.includes('server error')) {
      return 10000; // 10 seconds for server errors
    }
  }
  
  return 3000; // Default 3 seconds
}

export function checkApiKeyExists(provider: 'gemini' | 'openai'): boolean {
  if (provider === 'gemini') {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    return !!key && key.length > 10;
  } else {
    const key = import.meta.env.VITE_OPENAI_API_KEY;
    return !!key && key.length > 10;
  }
}

export function getMissingApiKeyMessage(provider: 'gemini' | 'openai'): string {
  const envVar = provider === 'gemini' ? 'VITE_GEMINI_API_KEY' : 'VITE_OPENAI_API_KEY';
  const providerName = provider === 'gemini' ? 'Google Gemini' : 'OpenAI';
  
  return `🔑 ${providerName} API Key Required

To use this agent, please configure your API key:

1. Get an API key from ${provider === 'gemini' ? 'https://makersuite.google.com/app/apikey' : 'https://platform.openai.com/api-keys'}
2. Add it to your environment: ${envVar}=your_key_here
3. Restart the application

Alternatively, switch to the other provider in Settings if you have that key configured.`;
}
