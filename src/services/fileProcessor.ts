import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ProcessedFile {
  filename: string;
  type: string;
  content: string;
  size: number;
}

export async function processFiles(files?: File[]): Promise<string> {
  if (!files || files.length === 0) return '';

  const contents = await Promise.all(
    files.map(file => processFile(file))
  );

  return contents
    .map(f => `--- FILE: ${f.filename} (${formatBytes(f.size)}) ---\n\n${f.content}`)
    .join('\n\n========================================\n\n');
}

async function processFile(file: File): Promise<ProcessedFile> {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  let content: string;

  try {
    switch (ext) {
      case 'csv':
        content = await processCSV(file);
        break;
      case 'xlsx':
      case 'xls':
        content = await processExcel(file);
        break;
      case 'json':
        content = await processJSON(file);
        break;
      case 'txt':
      case 'md':
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
      case 'py':
      case 'java':
      case 'cpp':
      case 'go':
      case 'rs':
      case 'rb':
      case 'php':
      case 'html':
      case 'css':
      case 'sql':
        content = await file.text();
        break;
      default:
        // Try to read as text for unknown types
        try {
          content = await file.text();
        } catch {
          throw new Error(`Unsupported file type: .${ext}`);
        }
    }
  } catch (error) {
    throw new Error(`Failed to process ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    filename: file.name,
    type: ext,
    content,
    size: file.size
  };
}

async function processCSV(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        const rows = results.data as string[][];
        
        if (rows.length === 0) {
          resolve('(Empty CSV file)');
          return;
        }

        // Get headers
        const headers = rows[0];
        const dataRows = rows.slice(1).filter(row => row.some(cell => cell.trim() !== ''));
        
        // Build markdown table
        let table = '| ' + headers.join(' | ') + ' |\n';
        table += '| ' + headers.map(() => '---').join(' | ') + ' |\n';
        
        // Limit rows for very large files
        const maxRows = 100;
        const displayRows = dataRows.slice(0, maxRows);
        
        displayRows.forEach(row => {
          table += '| ' + row.map(cell => cell.replace(/\|/g, '\\|')).join(' | ') + ' |\n';
        });

        if (dataRows.length > maxRows) {
          table += `\n... and ${dataRows.length - maxRows} more rows (${dataRows.length} total)`;
        }

        // Add summary statistics
        const summary = `
**CSV Summary:**
- Total Rows: ${dataRows.length}
- Total Columns: ${headers.length}
- Columns: ${headers.join(', ')}

**Data Preview:**
${table}`;

        resolve(summary);
      },
      error: (error) => reject(new Error(`CSV parsing error: ${error.message}`))
    });
  });
}

async function processExcel(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  
  let output = '';
  
  workbook.SheetNames.forEach((sheetName, index) => {
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];
    
    if (index > 0) output += '\n\n---\n\n';
    output += `**Sheet: ${sheetName}**\n\n`;
    
    if (data.length === 0) {
      output += '(Empty sheet)';
      return;
    }

    // Get headers
    const headers = data[0] as string[];
    const dataRows = data.slice(1).filter(row => row && row.some(cell => cell !== undefined && cell !== ''));
    
    // Build markdown table
    let table = '| ' + headers.join(' | ') + ' |\n';
    table += '| ' + headers.map(() => '---').join(' | ') + ' |\n';
    
    const maxRows = 100;
    const displayRows = dataRows.slice(0, maxRows);
    
    displayRows.forEach(row => {
      const cells = headers.map((_, i) => String(row[i] ?? '').replace(/\|/g, '\\|'));
      table += '| ' + cells.join(' | ') + ' |\n';
    });

    if (dataRows.length > maxRows) {
      table += `\n... and ${dataRows.length - maxRows} more rows (${dataRows.length} total)`;
    }

    output += `- Total Rows: ${dataRows.length}\n`;
    output += `- Total Columns: ${headers.length}\n\n`;
    output += table;
  });
  
  return output;
}

async function processJSON(file: File): Promise<string> {
  const text = await file.text();
  
  try {
    const data = JSON.parse(text);
    const formatted = JSON.stringify(data, null, 2);
    
    // Add summary for arrays
    let summary = '';
    if (Array.isArray(data)) {
      summary = `**JSON Array:** ${data.length} items\n`;
      if (data.length > 0 && typeof data[0] === 'object') {
        summary += `**Fields:** ${Object.keys(data[0]).join(', ')}\n\n`;
      }
    } else if (typeof data === 'object') {
      summary = `**JSON Object:** ${Object.keys(data).length} top-level keys\n`;
      summary += `**Keys:** ${Object.keys(data).join(', ')}\n\n`;
    }
    
    // Truncate very large JSON
    const maxLength = 10000;
    const truncatedJson = formatted.length > maxLength 
      ? formatted.substring(0, maxLength) + '\n\n... (truncated, ' + formatBytes(file.size) + ' total)'
      : formatted;
    
    return summary + '```json\n' + truncatedJson + '\n```';
  } catch (e) {
    return `Invalid JSON: ${e instanceof Error ? e.message : 'Parse error'}\n\nRaw content:\n${text.substring(0, 1000)}...`;
  }
}

export async function processImages(images?: File[]): Promise<string[]> {
  if (!images || images.length === 0) return [];

  return await Promise.all(
    images.map(async (img) => {
      const base64 = await fileToBase64(img);
      return base64;
    })
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsDataURL(file);
  });
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getSupportedFileTypes(): string[] {
  return [
    '.csv', '.xlsx', '.xls', '.json', '.txt', '.md',
    '.js', '.ts', '.jsx', '.tsx', '.py', '.java',
    '.cpp', '.go', '.rs', '.rb', '.php', '.html', '.css', '.sql'
  ];
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/') || 
    /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file.name);
}

export function isCodeFile(file: File): boolean {
  const codeExtensions = ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'go', 'rs', 'rb', 'php', 'html', 'css', 'sql'];
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  return codeExtensions.includes(ext);
}
