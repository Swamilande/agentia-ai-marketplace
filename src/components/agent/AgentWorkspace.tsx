import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Send, 
  Play, 
  Pause,
  Terminal, 
  Lock,
  Eye,
  EyeOff,
  Download,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Upload,
  FileText,
  Image as ImageIcon,
  X,
  Settings,
  Cpu,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAgentConfigStore, encryptData } from "@/stores/agentConfigStore";
import { useToast } from "@/hooks/use-toast";
import { 
  executeAgent, 
  getDefaultProvider, 
  getAvailableProviders,
  validateExecutionInput,
  getExecutionStatus,
  type LLMProvider,
  type AgentExecutionOutput
} from "@/services/agentRuntime";
import { downloadOutput, formatBytes, type AgentOutput } from "@/services/outputExtractor";
import { handleAgentError } from "@/services/errorHandler";
import { getAgentRole } from "@/data/agentRoles";
import type { Agent } from "@/components/marketplace/AgentCard";

interface AgentWorkspaceProps {
  agent: Agent;
  userId: string;
  serverUrl: string;
}

interface Message {
  id: string;
  type: 'input' | 'output' | 'system' | 'error';
  content: string;
  encrypted: string;
  timestamp: string;
  status?: 'pending' | 'success' | 'error';
  outputs?: AgentOutput[];
  executionTime?: number;
  tokensUsed?: number;
  provider?: LLMProvider;
  files?: { name: string; size: number }[];
}

export const AgentWorkspace = ({ agent, userId }: AgentWorkspaceProps) => {
  const { toast } = useToast();
  const { getSession, startSession, addInput, addOutput } = useAgentConfigStore();
  
  const [isRunning, setIsRunning] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showEncrypted, setShowEncrypted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [provider, setProvider] = useState<LLMProvider>(getDefaultProvider());
  const [metrics, setMetrics] = useState({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    avgResponseTime: 0,
    totalTokens: 0,
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const session = getSession(agent.id, userId);
  const agentRole = getAgentRole(agent.id);
  const availableProviders = getAvailableProviders();

  useEffect(() => {
    startSession(agent.id, userId);
    
    // Add system message
    const providerStatus = availableProviders.gemini || availableProviders.openai 
      ? `Using ${provider === 'gemini' ? 'Google Gemini' : 'OpenAI GPT-4'}`
      : '⚠️ No API keys configured';
    
    setMessages([{
      id: 'system-init',
      type: 'system',
      content: `🚀 ${agent.name} is ready. ${providerStatus}. Upload files or type your request.`,
      encrypted: encryptData(`Connected to ${agent.name}`),
      timestamp: new Date().toISOString(),
    }]);
  }, [agent.id, userId, agent.name, provider]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];
    
    for (const file of newFiles) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name} is too large (max 10MB)`);
        continue;
      }
      
      // Check if file type is supported
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const isImage = file.type.startsWith('image/');
      const supportedExts = agentRole?.fileTypes || [];
      
      if (!isImage && !supportedExts.includes(ext)) {
        errors.push(`${file.name} is not supported. Supported: ${supportedExts.join(', ')}`);
        continue;
      }
      
      validFiles.push(file);
    }
    
    if (errors.length > 0) {
      toast({
        title: "Some files skipped",
        description: errors.join('\n'),
        variant: "destructive",
      });
    }
    
    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
      toast({
        title: "Files added",
        description: `${validFiles.length} file(s) ready for processing`,
      });
    }
  }, [agentRole, toast]);

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleExecute = async () => {
    if (!inputValue.trim() || !isRunning || isProcessing) return;
    
    const userPrompt = inputValue.trim();
    setInputValue('');
    setIsProcessing(true);
    
    // Validate input
    const validationErrors = validateExecutionInput({
      agentId: agent.id,
      userPrompt,
      files: uploadedFiles,
      provider
    });
    
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors.join('\n'),
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }
    
    // Add input message
    const inputMessage: Message = {
      id: `in-${Date.now()}`,
      type: 'input',
      content: userPrompt,
      encrypted: encryptData(userPrompt),
      timestamp: new Date().toISOString(),
      status: 'pending',
      files: uploadedFiles.map(f => ({ name: f.name, size: f.size })),
    };
    
    setMessages(prev => [...prev, inputMessage]);
    addInput(session?.sessionId || '', userPrompt);
    
    try {
      // Update status
      setProcessingStatus(getExecutionStatus(provider, 'processing_files'));
      
      if (uploadedFiles.some(f => f.type.startsWith('image/'))) {
        setProcessingStatus(getExecutionStatus(provider, 'processing_images'));
      }
      
      setProcessingStatus(getExecutionStatus(provider, 'calling_api'));
      
      // Execute agent
      const result: AgentExecutionOutput = await executeAgent({
        agentId: agent.id,
        userPrompt,
        files: uploadedFiles,
        provider
      });
      
      setProcessingStatus(getExecutionStatus(provider, 'extracting_outputs'));
      
      // Update input status
      setMessages(prev => prev.map(m => 
        m.id === inputMessage.id ? { ...m, status: 'success' as const } : m
      ));
      
      // Add output message
      const outputMessage: Message = {
        id: `out-${Date.now()}`,
        type: 'output',
        content: result.message,
        encrypted: encryptData(result.message),
        timestamp: new Date().toISOString(),
        status: 'success',
        outputs: result.outputs,
        executionTime: result.executionTime,
        tokensUsed: result.tokensUsed,
        provider: result.provider,
      };
      
      setMessages(prev => [...prev, outputMessage]);
      addOutput(session?.sessionId || '', result.message);
      
      // Update metrics
      setMetrics(prev => {
        const newTotal = prev.totalRequests + 1;
        const newAvg = ((prev.avgResponseTime * prev.totalRequests) + result.executionTime) / newTotal;
        return {
          totalRequests: newTotal,
          successfulRequests: prev.successfulRequests + 1,
          failedRequests: prev.failedRequests,
          avgResponseTime: Math.round(newAvg),
          totalTokens: prev.totalTokens + (result.tokensUsed || 0),
        };
      });
      
      // Clear uploaded files after successful execution
      setUploadedFiles([]);
      
      setProcessingStatus(getExecutionStatus(provider, 'complete'));
      
    } catch (error) {
      console.error('Agent execution error:', error);
      
      setMessages(prev => prev.map(m => 
        m.id === inputMessage.id ? { ...m, status: 'error' as const } : m
      ));
      
      // Add error message
      const errorMessage = handleAgentError(error, { provider, agentId: agent.id });
      
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        type: 'error',
        content: errorMessage,
        encrypted: encryptData(errorMessage),
        timestamp: new Date().toISOString(),
      }]);
      
      setMetrics(prev => ({
        ...prev,
        totalRequests: prev.totalRequests + 1,
        failedRequests: prev.failedRequests + 1,
      }));
      
      setProcessingStatus(getExecutionStatus(provider, 'error'));
      
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProcessingStatus(''), 3000);
    }
  };

  const handleDownload = (output: AgentOutput) => {
    try {
      downloadOutput(output);
      toast({
        title: "Download started",
        description: `Downloading ${output.filename}`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const toggleAgent = () => {
    setIsRunning(!isRunning);
    
    setMessages(prev => [...prev, {
      id: `system-${Date.now()}`,
      type: 'system',
      content: isRunning ? '⏸️ Agent paused' : '▶️ Agent resumed',
      encrypted: encryptData(isRunning ? 'Agent paused' : 'Agent resumed'),
      timestamp: new Date().toISOString(),
    }]);
    
    toast({
      title: isRunning ? "Agent Paused" : "Agent Running",
      description: isRunning ? "The agent has been paused" : "The agent is now running",
    });
  };

  const clearMessages = () => {
    setMessages([{
      id: 'system-clear',
      type: 'system',
      content: '🗑️ Conversation cleared',
      encrypted: encryptData('Conversation cleared'),
      timestamp: new Date().toISOString(),
    }]);
    setUploadedFiles([]);
  };

  const exportData = () => {
    const data = {
      agent: agent.name,
      exportedAt: new Date().toISOString(),
      messages: messages.map(m => ({
        type: m.type,
        timestamp: m.timestamp,
        encrypted: m.encrypted,
      })),
      metrics,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${agent.id}-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exported",
      description: "Session data exported with encryption",
    });
  };

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <div className="flex items-center justify-between p-4 glass-card rounded-2xl border border-border/50">
        <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
          <span className="font-medium">{isRunning ? 'Active' : 'Paused'}</span>
          <Badge variant="outline" className="gap-1">
            <Lock className="w-3 h-3" />
            Encrypted
          </Badge>
          {processingStatus && (
            <Badge variant="secondary" className="gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              {processingStatus}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Provider Selector */}
          <Select value={provider} onValueChange={(v) => setProvider(v as LLMProvider)}>
            <SelectTrigger className="w-[140px] h-8">
              <Cpu className="w-3 h-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gemini" disabled={!availableProviders.gemini}>
                <span className={!availableProviders.gemini ? 'opacity-50' : ''}>
                  Gemini {!availableProviders.gemini && '(No key)'}
                </span>
              </SelectItem>
              <SelectItem value="openai" disabled={!availableProviders.openai}>
                <span className={!availableProviders.openai ? 'opacity-50' : ''}>
                  OpenAI {!availableProviders.openai && '(No key)'}
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={() => setShowEncrypted(!showEncrypted)}>
            {showEncrypted ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={clearMessages}>
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button 
            variant={isRunning ? "outline" : "default"} 
            size="sm"
            onClick={toggleAgent}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: 'Total Requests', value: metrics.totalRequests, icon: Terminal },
          { label: 'Successful', value: metrics.successfulRequests, icon: CheckCircle },
          { label: 'Failed', value: metrics.failedRequests, icon: XCircle },
          { label: 'Avg Response', value: `${metrics.avgResponseTime}ms`, icon: Clock },
          { label: 'Tokens Used', value: metrics.totalTokens.toLocaleString(), icon: Zap },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* File Upload Area */}
      <div 
        className="glass-card rounded-2xl border border-dashed border-border/50 p-4 transition-colors hover:border-primary/50"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
          accept={agentRole?.fileTypes.map(t => `.${t}`).join(',') + ',image/*'}
        />
        
        {uploadedFiles.length === 0 ? (
          <div 
            className="flex flex-col items-center justify-center py-6 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-10 h-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Drag & drop files here or click to upload
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supported: {agentRole?.fileTypes.join(', ')}, images
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{uploadedFiles.length} file(s) ready</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Add More
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {uploadedFiles.map((file, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2"
                >
                  {file.type.startsWith('image/') ? (
                    <ImageIcon className="w-4 h-4 text-primary" />
                  ) : (
                    <FileText className="w-4 h-4 text-primary" />
                  )}
                  <span className="text-sm truncate max-w-[150px]">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({formatBytes(file.size)})
                  </span>
                  <button 
                    onClick={() => removeFile(index)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chat Interface */}
      <div className="glass-card rounded-2xl border border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Agent Console</h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {showEncrypted ? 'Showing encrypted data' : 'Showing decrypted data'}
          </span>
        </div>
        
        <div className="h-[500px] overflow-y-auto p-4 space-y-4 bg-black/30">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'input' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-xl p-4 ${
                message.type === 'input'
                  ? 'bg-primary text-primary-foreground'
                  : message.type === 'system'
                    ? 'bg-muted/50 text-muted-foreground text-sm italic'
                    : message.type === 'error'
                      ? 'bg-destructive/20 border border-destructive/50 text-destructive'
                      : 'bg-muted/30 border border-border/50'
              }`}>
                <div className="flex items-start gap-2">
                  {message.status === 'pending' && (
                    <Loader2 className="w-4 h-4 animate-spin flex-shrink-0 mt-1" />
                  )}
                  {message.status === 'success' && message.type === 'input' && (
                    <CheckCircle className="w-4 h-4 text-green-300 flex-shrink-0 mt-1" />
                  )}
                  {message.status === 'error' && (
                    <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1 min-w-0">
                    {/* Show attached files for input messages */}
                    {message.files && message.files.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {message.files.map((f, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            📎 {f.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <pre className="whitespace-pre-wrap font-mono text-sm break-words">
                      {showEncrypted ? message.encrypted : message.content}
                    </pre>
                    
                    {/* Execution info */}
                    {message.type === 'output' && (message.executionTime || message.tokensUsed) && (
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {message.executionTime && (
                          <span>⏱️ {message.executionTime}ms</span>
                        )}
                        {message.tokensUsed && (
                          <span>📊 {message.tokensUsed.toLocaleString()} tokens</span>
                        )}
                        {message.provider && (
                          <Badge variant="outline" className="text-xs">
                            {message.provider === 'gemini' ? '🔷 Gemini' : '🟢 OpenAI'}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {/* Download buttons for outputs */}
                    {message.outputs && message.outputs.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">
                          📥 Deliverables ({message.outputs.length}):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {message.outputs.map((output, index) => (
                            <Button
                              key={index}
                              variant="secondary"
                              size="sm"
                              onClick={() => handleDownload(output)}
                              className="gap-2"
                            >
                              <Download className="w-3 h-3" />
                              {output.filename}
                              <span className="text-xs opacity-70">
                                ({formatBytes(output.size)})
                              </span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs opacity-60 mt-2">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 border-t border-border/50">
          <div className="flex gap-2">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleExecute();
                }
              }}
              placeholder={isRunning ? "Describe what you want the agent to do..." : "Agent is paused"}
              disabled={!isRunning || isProcessing}
              className="bg-muted/30 border-border/50 min-h-[60px] resize-none"
              rows={2}
            />
            <Button 
              onClick={handleExecute} 
              disabled={!isRunning || isProcessing || !inputValue.trim()}
              className="h-auto px-6"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          {uploadedFiles.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              {uploadedFiles.length} file(s) will be processed with your request
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
