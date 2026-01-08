import { GoogleGenerativeAI, GenerativeModel, Part } from '@google/generative-ai';
import { AgentRole } from '@/data/agentRoles';
import { extractOutputsFromResponse, getCleanMessage, AgentOutput } from '@/services/outputExtractor';

export interface GeminiExecutionResult {
  message: string;
  outputs: AgentOutput[];
  tokensUsed?: number;
  executionTime: number;
}

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY is not configured. Please add your Gemini API key.');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export async function executeWithGemini(
  userPrompt: string,
  role: AgentRole,
  fileContents?: string,
  imageData?: string[]
): Promise<GeminiExecutionResult> {
  const startTime = Date.now();
  
  const client = getClient();
  
  // Use gemini-1.5-pro for best results, supports vision and long context
  const model: GenerativeModel = client.getGenerativeModel({ 
    model: 'gemini-1.5-pro',
    systemInstruction: role.systemPrompt
  });

  // Build the content parts
  const parts: Part[] = [];

  // Add images first if present (for vision tasks)
  if (imageData && imageData.length > 0 && role.imageSupport) {
    for (const img of imageData) {
      // Extract base64 data from data URL
      const base64Match = img.match(/^data:([^;]+);base64,(.+)$/);
      if (base64Match) {
        parts.push({
          inlineData: {
            mimeType: base64Match[1],
            data: base64Match[2]
          }
        });
      }
    }
  }

  // Build the text prompt
  let fullPrompt = userPrompt;

  if (fileContents) {
    fullPrompt = `## USER REQUEST:\n${userPrompt}\n\n## UPLOADED DATA:\n${fileContents}`;
  }

  if (imageData && imageData.length > 0 && role.imageSupport) {
    fullPrompt = `${fullPrompt}\n\n[${imageData.length} image(s) attached for analysis]`;
  }

  parts.push({ text: fullPrompt });

  try {
    const result = await model.generateContent(parts);
    const response = result.response;
    const responseText = response.text();
    
    // Extract any downloadable outputs from the response
    const outputs = extractOutputsFromResponse(responseText, `${role.outputFormat === 'markdown' ? 'agent-report.md' : 'agent-output.json'}`);
    
    // Get clean message without output blocks
    const cleanMessage = getCleanMessage(responseText);
    
    const executionTime = Date.now() - startTime;

    return {
      message: cleanMessage || responseText,
      outputs,
      tokensUsed: response.usageMetadata?.totalTokenCount,
      executionTime
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    if (error instanceof Error) {
      // Re-throw with more context
      throw new Error(`Gemini API error: ${error.message}`);
    }
    throw error;
  }
}

export function checkGeminiApiKey(): boolean {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  return !!apiKey && apiKey.length > 10 && apiKey !== 'your_gemini_api_key_here';
}

export function getGeminiError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('API_KEY')) {
      return 'Invalid or missing Gemini API key';
    }
    if (error.message.includes('RATE_LIMIT')) {
      return 'Gemini rate limit exceeded';
    }
    if (error.message.includes('SAFETY')) {
      return 'Content blocked by Gemini safety filters';
    }
    return error.message;
  }
  return 'Unknown Gemini error';
}
