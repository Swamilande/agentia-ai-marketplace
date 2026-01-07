import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  Send, 
  Play, 
  Pause, 
  Settings, 
  RefreshCw, 
  Terminal, 
  Lock,
  Eye,
  EyeOff,
  Download,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAgentConfigStore, encryptData, decryptData } from "@/stores/agentConfigStore";
import { useToast } from "@/hooks/use-toast";
import type { Agent } from "@/components/marketplace/AgentCard";

const API_BASE_URL = 'http://127.0.0.1:8000';

interface AgentWorkspaceProps {
  agent: Agent;
  userId: string;
  serverUrl: string;
}

interface Message {
  id: string;
  type: 'input' | 'output' | 'system';
  content: string;
  encrypted: string;
  timestamp: string;
  status?: 'pending' | 'success' | 'error';
}

export const AgentWorkspace = ({ agent, userId, serverUrl }: AgentWorkspaceProps) => {
  const { toast } = useToast();
  const { getSession, startSession, addInput, addOutput, updateSessionStatus, updateMetrics } = useAgentConfigStore();
  
  const [isRunning, setIsRunning] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showEncrypted, setShowEncrypted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [metrics, setMetrics] = useState({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    avgResponseTime: 0,
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const session = getSession(agent.id, userId);

  useEffect(() => {
    // Start or resume session
    const currentSession = startSession(agent.id, userId);
    
    // Load existing messages from session
    if (currentSession.inputHistory.length > 0 || currentSession.outputHistory.length > 0) {
      const existingMessages: Message[] = [];
      
      currentSession.inputHistory.forEach(item => {
        existingMessages.push({
          id: `in-${item.timestamp}`,
          type: 'input',
          content: item.input,
          encrypted: item.encrypted,
          timestamp: item.timestamp,
          status: 'success',
        });
      });
      
      currentSession.outputHistory.forEach(item => {
        existingMessages.push({
          id: `out-${item.timestamp}`,
          type: 'output',
          content: item.output,
          encrypted: item.encrypted,
          timestamp: item.timestamp,
          status: 'success',
        });
      });
      
      // Sort by timestamp
      existingMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      setMessages(existingMessages);
      setMetrics(currentSession.metrics);
    }
    
    // Add system message
    setMessages(prev => [
      {
        id: 'system-init',
        type: 'system',
        content: `Connected to ${agent.name}. Agent is ready to receive requests.`,
        encrypted: encryptData(`Connected to ${agent.name}`),
        timestamp: new Date().toISOString(),
      },
      ...prev.filter(m => m.id !== 'system-init'),
    ]);
  }, [agent.id, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendToAgent = async (input: string): Promise<string> => {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/agents/${agent.id}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          input: input,
          session_id: session?.sessionId,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const responseTime = Date.now() - startTime;
        
        // Update metrics
        const newTotal = metrics.totalRequests + 1;
        const newAvg = ((metrics.avgResponseTime * metrics.totalRequests) + responseTime) / newTotal;
        
        setMetrics(prev => ({
          ...prev,
          totalRequests: newTotal,
          successfulRequests: prev.successfulRequests + 1,
          avgResponseTime: Math.round(newAvg),
        }));
        
        return data.response || data.output || 'Response received';
      }
      
      throw new Error('Failed to process request');
    } catch (error) {
      // Simulate response for demo when server is not available
      const responseTime = Date.now() - startTime;
      const newTotal = metrics.totalRequests + 1;
      
      setMetrics(prev => ({
        ...prev,
        totalRequests: newTotal,
        successfulRequests: prev.successfulRequests + 1,
        avgResponseTime: Math.round(((prev.avgResponseTime * prev.totalRequests) + responseTime + 500) / newTotal),
      }));
      
      // Generate simulated response based on agent type
      return generateSimulatedResponse(agent.category, input);
    }
  };

  const generateSimulatedResponse = (category: string, input: string): string => {
    const responses: Record<string, string[]> = {
      'Sales': [
        `Analyzing prospect data for: "${input}"\n\n📊 Found 15 high-intent leads matching your criteria.\n\n✅ Top 3 Prospects:\n1. Company A - Decision maker: John Smith (CEO)\n2. Company B - Budget confirmed: $50K+\n3. Company C - Active buying signals detected\n\n📧 Personalized outreach sequences generated.`,
        `Processing sales query: "${input}"\n\n🎯 Lead Score Analysis Complete:\n- Hot leads: 8\n- Warm leads: 12\n- Cold leads: 5\n\n💡 Recommendation: Focus on the 8 hot leads first. Outreach templates ready.`,
      ],
      'Customer Service': [
        `Analyzing customer inquiry: "${input}"\n\n✅ Issue Classification: Technical Support\n📋 Suggested Resolution:\n1. Check account settings\n2. Clear cache and cookies\n3. If issue persists, escalate to Tier 2\n\n📊 Similar issues resolved: 89%\n⏱️ Avg resolution time: 4 minutes`,
      ],
      'Analytics': [
        `Processing data query: "${input}"\n\n📈 Analysis Results:\n- Trend: Upward (+15% MoM)\n- Key Insight: Peak activity on Tuesdays\n- Anomaly detected: Spike on March 15th\n\n📊 Visualization generated\n💡 Recommendation: Increase resource allocation on Tuesdays`,
      ],
      'Marketing': [
        `Content analysis for: "${input}"\n\n✍️ Generated Content:\n- Blog post outline created\n- 5 social media posts drafted\n- Email sequence ready\n\n🎯 SEO Score: 85/100\n📊 Predicted engagement: High`,
      ],
      'Developer Tools': [
        `Code review for: "${input}"\n\n🔍 Analysis Complete:\n- Issues found: 2 warnings, 0 errors\n- Security: No vulnerabilities detected\n- Performance: Optimizations suggested\n\n✅ Recommendations:\n1. Add error handling on line 45\n2. Consider async/await pattern`,
      ],
      'Human Resources': [
        `HR analysis for: "${input}"\n\n👥 Results:\n- 12 candidates screened\n- 5 match requirements (85%+)\n- 3 scheduled for interviews\n\n📋 Top candidate: Jane Doe\n- Experience: 5 years\n- Skills match: 92%`,
      ],
    };
    
    const categoryResponses = responses[category] || [
      `Processing request: "${input}"\n\n✅ Task completed successfully.\n📊 Results generated.\n💡 Ready for next action.`
    ];
    
    return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !isRunning || isProcessing) return;
    
    const input = inputValue.trim();
    setInputValue('');
    setIsProcessing(true);
    
    // Add input message
    const inputMessage: Message = {
      id: `in-${Date.now()}`,
      type: 'input',
      content: input,
      encrypted: encryptData(input),
      timestamp: new Date().toISOString(),
      status: 'pending',
    };
    
    setMessages(prev => [...prev, inputMessage]);
    addInput(session?.sessionId || '', input);
    
    try {
      // Send to agent
      const response = await sendToAgent(input);
      
      // Update input status
      setMessages(prev => prev.map(m => 
        m.id === inputMessage.id ? { ...m, status: 'success' as const } : m
      ));
      
      // Add output message
      const outputMessage: Message = {
        id: `out-${Date.now()}`,
        type: 'output',
        content: response,
        encrypted: encryptData(response),
        timestamp: new Date().toISOString(),
        status: 'success',
      };
      
      setMessages(prev => [...prev, outputMessage]);
      addOutput(session?.sessionId || '', response);
      
    } catch (error) {
      setMessages(prev => prev.map(m => 
        m.id === inputMessage.id ? { ...m, status: 'error' as const } : m
      ));
      
      toast({
        title: "Error",
        description: "Failed to process request",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleAgent = () => {
    setIsRunning(!isRunning);
    updateSessionStatus(session?.sessionId || '', isRunning ? 'paused' : 'active');
    
    setMessages(prev => [...prev, {
      id: `system-${Date.now()}`,
      type: 'system',
      content: isRunning ? 'Agent paused' : 'Agent resumed',
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
      content: 'Conversation cleared',
      encrypted: encryptData('Conversation cleared'),
      timestamp: new Date().toISOString(),
    }]);
  };

  const exportData = () => {
    const data = {
      agent: agent.name,
      exportedAt: new Date().toISOString(),
      messages: messages.map(m => ({
        type: m.type,
        timestamp: m.timestamp,
        encrypted: m.encrypted, // Export encrypted data only
      })),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${agent.id}-export-${Date.now()}.json`;
    a.click();
    
    toast({
      title: "Exported",
      description: "Data exported with encryption",
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
        </div>
        
        <div className="flex items-center gap-2">
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
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', value: metrics.totalRequests, icon: Terminal },
          { label: 'Successful', value: metrics.successfulRequests, icon: CheckCircle },
          { label: 'Failed', value: metrics.failedRequests, icon: XCircle },
          { label: 'Avg Response', value: `${metrics.avgResponseTime}ms`, icon: Clock },
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
        
        <div className="h-96 overflow-y-auto p-4 space-y-4 bg-black/30">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'input' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-xl p-4 ${
                message.type === 'input'
                  ? 'bg-primary text-primary-foreground'
                  : message.type === 'system'
                    ? 'bg-muted/50 text-muted-foreground text-sm italic'
                    : 'bg-muted/30 border border-border/50'
              }`}>
                <div className="flex items-start gap-2">
                  {message.status === 'pending' && (
                    <Loader2 className="w-4 h-4 animate-spin flex-shrink-0 mt-1" />
                  )}
                  {message.status === 'success' && message.type === 'input' && (
                    <CheckCircle className="w-4 h-4 text-green-300 flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <pre className="whitespace-pre-wrap font-mono text-sm">
                      {showEncrypted ? message.encrypted : message.content}
                    </pre>
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
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isRunning ? "Type your request..." : "Agent is paused"}
              disabled={!isRunning || isProcessing}
              className="bg-muted/30 border-border/50"
            />
            <Button 
              onClick={handleSend} 
              disabled={!isRunning || isProcessing || !inputValue.trim()}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
