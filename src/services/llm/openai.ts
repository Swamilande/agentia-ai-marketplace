import OpenAI from 'openai';
import { AgentRole } from '@/data/agentRoles';
import { extractOutputsFromResponse, getCleanMessage, AgentOutput } from '@/services/outputExtractor';

export interface OpenAIExecutionResult {
  message: string;
  outputs: AgentOutput[];
  tokensUsed?: number;
  executionTime: number;
}

let openaiClient: OpenAI | null = null;

function getClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_OPENAI_API_KEY is not configured. Please add your OpenAI API key.');
    }
    openaiClient = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true // Required for client-side usage
    });
  }
  return openaiClient;
}

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string; detail?: 'low' | 'high' | 'auto' } }>;
};

export async function executeWithOpenAI(
  userPrompt: string,
  role: AgentRole,
  fileContents?: string,
  imageData?: string[]
): Promise<OpenAIExecutionResult> {
  const startTime = Date.now();
  
  const client = getClient();

  // Build messages array
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: role.systemPrompt
    }
  ];

  // Build user message content
  if (imageData && imageData.length > 0 && role.imageSupport) {
    // Vision request with images
    const content: Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string; detail?: 'low' | 'high' | 'auto' } }> = [];
    
    // Add text prompt
    let fullPrompt = userPrompt;
    if (fileContents) {
      fullPrompt = `## USER REQUEST:\n${userPrompt}\n\n## UPLOADED DATA:\n${fileContents}`;
    }
    fullPrompt += `\n\n[${imageData.length} image(s) attached for analysis]`;
    
    content.push({ type: 'text', text: fullPrompt });
    
    // Add images
    for (const img of imageData) {
      content.push({
        type: 'image_url',
        image_url: {
          url: img,
          detail: 'high'
        }
      });
    }
    
    messages.push({ role: 'user', content });
  } else {
    // Text-only request
    let fullPrompt = userPrompt;
    if (fileContents) {
      fullPrompt = `## USER REQUEST:\n${userPrompt}\n\n## UPLOADED DATA:\n${fileContents}`;
    }
    
    messages.push({ role: 'user', content: fullPrompt });
  }

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o', // Use GPT-4o for vision and best quality
      messages: messages as OpenAI.ChatCompletionMessageParam[],
      temperature: 0.7,
      max_tokens: 4000
    });

    const responseText = completion.choices[0]?.message?.content || '';
    
    // Extract any downloadable outputs from the response
    const outputs = extractOutputsFromResponse(responseText, `${role.outputFormat === 'markdown' ? 'agent-report.md' : 'agent-output.json'}`);
    
    // Get clean message without output blocks
    const cleanMessage = getCleanMessage(responseText);
    
    const executionTime = Date.now() - startTime;

    return {
      message: cleanMessage || responseText,
      outputs,
      tokensUsed: completion.usage?.total_tokens,
      executionTime
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    if (error instanceof Error) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
    throw error;
  }
}

export function checkOpenAIApiKey(): boolean {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  return !!apiKey && apiKey.length > 10 && apiKey !== 'your_openai_api_key_here';
}

export function getOpenAIError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('api_key') || error.message.includes('Unauthorized')) {
      return 'Invalid or missing OpenAI API key';
    }
    if (error.message.includes('rate_limit')) {
      return 'OpenAI rate limit exceeded';
    }
    if (error.message.includes('content_policy')) {
      return 'Content blocked by OpenAI content policy';
    }
    return error.message;
  }
  return 'Unknown OpenAI error';
}
