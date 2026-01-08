export interface AgentOutput {
  filename: string;
  mimeType: string;
  base64Data: string;
  size: number;
}

/**
 * Extracts downloadable files from agent response
 * Format: ```output:filename.ext
 * [content]
 * ```
 */
export function extractOutputsFromResponse(
  response: string,
  defaultFilename?: string
): AgentOutput[] {
  const outputs: AgentOutput[] = [];
  
  // Pattern: ```output:filename.ext followed by content and closing ```
  const outputRegex = /```output:([^\n]+)\n([\s\S]*?)```/g;
  let match;

  while ((match = outputRegex.exec(response)) !== null) {
    const filename = match[1].trim();
    const content = match[2].trim();
    
    // Encode content properly for base64
    const base64Data = stringToBase64(content);
    
    outputs.push({
      filename,
      mimeType: getMimeType(filename),
      base64Data,
      size: new Blob([content]).size
    });
  }

  // If no explicit outputs but response is substantial, create a default markdown file
  if (outputs.length === 0 && response.length > 100 && defaultFilename) {
    // Clean response by removing any incomplete output blocks
    const cleanedResponse = response.replace(/```output:[^\n]*\n?/g, '').trim();
    
    if (cleanedResponse.length > 50) {
      outputs.push({
        filename: defaultFilename,
        mimeType: 'text/markdown',
        base64Data: stringToBase64(cleanedResponse),
        size: new Blob([cleanedResponse]).size
      });
    }
  }

  return outputs;
}

/**
 * Converts a string to base64, handling Unicode properly
 */
function stringToBase64(str: string): string {
  try {
    // Use TextEncoder for proper Unicode handling
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } catch {
    // Fallback for simpler ASCII content
    return btoa(unescape(encodeURIComponent(str)));
  }
}

/**
 * Gets MIME type from filename extension
 */
function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    'md': 'text/markdown',
    'txt': 'text/plain',
    'csv': 'text/csv',
    'json': 'application/json',
    'pdf': 'application/pdf',
    'html': 'text/html',
    'xml': 'application/xml',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'xls': 'application/vnd.ms-excel',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'js': 'application/javascript',
    'ts': 'application/typescript',
    'py': 'text/x-python',
    'java': 'text/x-java',
    'cpp': 'text/x-c++src',
    'go': 'text/x-go',
    'rs': 'text/x-rust',
    'rb': 'text/x-ruby',
    'php': 'text/x-php',
    'sql': 'application/sql',
    'css': 'text/css'
  };
  return mimeTypes[ext || 'txt'] || 'application/octet-stream';
}

/**
 * Creates a clean message by removing output blocks from response
 */
export function getCleanMessage(response: string): string {
  // Remove output blocks from the visible message
  let cleaned = response.replace(/```output:[^\n]+\n[\s\S]*?```/g, '');
  
  // Clean up excessive whitespace
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();
  
  return cleaned;
}

/**
 * Downloads a file from AgentOutput
 */
export function downloadOutput(output: AgentOutput): void {
  try {
    // Decode base64 to binary
    const binaryString = atob(output.base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const blob = new Blob([bytes], { type: output.mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = output.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Cleanup
    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error('Download failed:', error);
    throw new Error(`Failed to download ${output.filename}`);
  }
}

/**
 * Formats bytes to human readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
