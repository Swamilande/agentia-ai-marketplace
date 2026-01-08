import { getAgentRole, AgentRole } from '@/data/agentRoles';
import { processFiles, processImages } from '@/services/fileProcessor';
import { executeWithGemini, checkGeminiApiKey } from '@/services/llm/gemini';
import { executeWithOpenAI, checkOpenAIApiKey } from '@/services/llm/openai';
import { handleAgentError, getMissingApiKeyMessage } from '@/services/errorHandler';
import { AgentOutput } from '@/services/outputExtractor';

export type LLMProvider = 'gemini' | 'openai';

export interface AgentExecutionInput {
  agentId: string;
  userPrompt: string;
  files?: File[];
  images?: File[];
  provider?: LLMProvider;
}

export interface AgentExecutionOutput {
  message: string;
  outputs: AgentOutput[];
  executionTime: number;
  tokensUsed?: number;
  provider: LLMProvider;
}

/**
 * Get the default LLM provider from environment or settings
 */
export function getDefaultProvider(): LLMProvider {
  const envDefault = import.meta.env.VITE_DEFAULT_LLM;
  if (envDefault === 'openai' || envDefault === 'gemini') {
    return envDefault;
  }
  
  // Auto-detect based on available API keys
  if (checkGeminiApiKey()) return 'gemini';
  if (checkOpenAIApiKey()) return 'openai';
  
  return 'gemini'; // Default fallback
}

/**
 * Check which providers are available
 */
export function getAvailableProviders(): { gemini: boolean; openai: boolean } {
  return {
    gemini: checkGeminiApiKey(),
    openai: checkOpenAIApiKey()
  };
}

/**
 * Main agent execution function
 * Routes to appropriate LLM provider and handles file processing
 */
export async function executeAgent(
  input: AgentExecutionInput
): Promise<AgentExecutionOutput> {
  const startTime = Date.now();
  
  // 1. Get agent role configuration
  const role = getAgentRole(input.agentId);
  if (!role) {
    throw new Error(`Agent "${input.agentId}" not found. Available agents: data-analyst, content-creator, code-reviewer, customer-support-ai, sales-prospector, hr-assistant`);
  }

  // 2. Determine provider
  const provider = input.provider || getDefaultProvider();
  
  // 3. Check API key availability
  const hasApiKey = provider === 'gemini' ? checkGeminiApiKey() : checkOpenAIApiKey();
  
  if (!hasApiKey) {
    // Try fallback to other provider
    const fallbackProvider = provider === 'gemini' ? 'openai' : 'gemini';
    const hasFallbackKey = fallbackProvider === 'gemini' ? checkGeminiApiKey() : checkOpenAIApiKey();
    
    if (hasFallbackKey) {
      console.log(`Primary provider ${provider} not available, falling back to ${fallbackProvider}`);
      return executeAgent({ ...input, provider: fallbackProvider });
    }
    
    throw new Error(getMissingApiKeyMessage(provider));
  }

  // 4. Process uploaded files
  let fileContents = '';
  try {
    fileContents = await processFiles(input.files);
  } catch (error) {
    throw new Error(`File processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // 5. Process uploaded images
  let imageData: string[] = [];
  try {
    // Combine explicitly passed images and image files from the files array
    const imageFiles = (input.files || []).filter(f => f.type.startsWith('image/'));
    const allImages = [...(input.images || []), ...imageFiles];
    imageData = await processImages(allImages);
  } catch (error) {
    console.warn('Image processing warning:', error);
    // Continue without images if processing fails
  }

  // 6. Execute with selected provider
  try {
    if (provider === 'gemini') {
      const result = await executeWithGemini(
        input.userPrompt,
        role,
        fileContents || undefined,
        imageData.length > 0 ? imageData : undefined
      );
      
      return {
        message: result.message,
        outputs: result.outputs,
        executionTime: result.executionTime,
        tokensUsed: result.tokensUsed,
        provider: 'gemini'
      };
    } else {
      const result = await executeWithOpenAI(
        input.userPrompt,
        role,
        fileContents || undefined,
        imageData.length > 0 ? imageData : undefined
      );
      
      return {
        message: result.message,
        outputs: result.outputs,
        executionTime: result.executionTime,
        tokensUsed: result.tokensUsed,
        provider: 'openai'
      };
    }
  } catch (error) {
    // Try fallback provider on failure
    const fallbackProvider = provider === 'gemini' ? 'openai' : 'gemini';
    const hasFallbackKey = fallbackProvider === 'gemini' ? checkGeminiApiKey() : checkOpenAIApiKey();
    
    if (hasFallbackKey && !input.provider) {
      console.log(`Provider ${provider} failed, attempting fallback to ${fallbackProvider}`);
      try {
        return await executeAgent({ ...input, provider: fallbackProvider });
      } catch (fallbackError) {
        // Both providers failed
        throw new Error(`Both providers failed. Primary (${provider}): ${error instanceof Error ? error.message : 'Unknown'}. Fallback (${fallbackProvider}): ${fallbackError instanceof Error ? fallbackError.message : 'Unknown'}`);
      }
    }
    
    throw error;
  }
}

/**
 * Validate input before execution
 */
export function validateExecutionInput(input: AgentExecutionInput): string[] {
  const errors: string[] = [];
  
  if (!input.agentId) {
    errors.push('Agent ID is required');
  } else if (!getAgentRole(input.agentId)) {
    errors.push(`Unknown agent: ${input.agentId}`);
  }
  
  if (!input.userPrompt || input.userPrompt.trim().length === 0) {
    errors.push('User prompt is required');
  }
  
  if (input.userPrompt && input.userPrompt.length > 50000) {
    errors.push('Prompt is too long (max 50,000 characters)');
  }
  
  // Check file types for the specific agent
  if (input.files && input.files.length > 0) {
    const role = getAgentRole(input.agentId);
    if (role) {
      for (const file of input.files) {
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        if (!role.fileTypes.includes(ext) && !file.type.startsWith('image/')) {
          errors.push(`File type .${ext} is not supported by this agent. Supported: ${role.fileTypes.join(', ')}`);
        }
      }
    }
  }
  
  return errors;
}

/**
 * Get execution status message
 */
export function getExecutionStatus(provider: LLMProvider, stage: string): string {
  const providerName = provider === 'gemini' ? 'Gemini' : 'OpenAI';
  
  switch (stage) {
    case 'processing_files':
      return '📁 Processing uploaded files...';
    case 'processing_images':
      return '🖼️ Processing images...';
    case 'calling_api':
      return `🤖 Sending to ${providerName}...`;
    case 'extracting_outputs':
      return '📄 Extracting deliverables...';
    case 'complete':
      return `✅ Complete (via ${providerName})`;
    case 'error':
      return '❌ Execution failed';
    default:
      return '⏳ Processing...';
  }
}
