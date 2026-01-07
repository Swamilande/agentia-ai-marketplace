import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Settings, 
  RefreshCw, 
  Terminal, 
  Activity,
  Zap,
  Clock,
  BarChart3,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Copy,
  Loader2
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { mockAgents } from "@/data/mockAgents";
import { useAuthStore } from "@/stores/authStore";
import { usePurchaseStore } from "@/stores/purchaseStore";

const AgentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuthStore();
  const { hasPurchased, getPurchase } = usePurchaseStore();
  
  const [isRunning, setIsRunning] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  
  const agent = mockAgents.find((a) => a.id === id);
  const isPurchased = user ? hasPurchased(id || '', user.id) : false;
  const purchase = user ? getPurchase(id || '', user.id) : undefined;
  
  // Redirect if not authenticated or not purchased
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }
    
    if (!isPurchased && !isLoading) {
      navigate(`/agents/${id}`);
      toast({
        title: "Access Denied",
        description: "You need to purchase this agent to use it.",
        variant: "destructive"
      });
    }
  }, [isAuthenticated, isPurchased, isLoading, navigate, id, toast]);

  // Simulate loading and connection
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setLogs([
        `[${new Date().toLocaleTimeString()}] Connecting to agent server...`,
        `[${new Date().toLocaleTimeString()}] Connection established`,
        `[${new Date().toLocaleTimeString()}] Agent ${agent?.name} is ready`,
        `[${new Date().toLocaleTimeString()}] Listening for requests...`,
      ]);
    }, 1500);
    return () => clearTimeout(timer);
  }, [agent?.name]);

  // Simulate live logs
  useEffect(() => {
    if (!isRunning || isLoading) return;
    
    const interval = setInterval(() => {
      const messages = [
        'Processing incoming request...',
        'Request handled successfully',
        'Response sent to client',
        'Health check passed',
        'Memory usage: 45%',
        'Active connections: 12',
      ];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setLogs(prev => [...prev.slice(-19), `[${new Date().toLocaleTimeString()}] ${randomMessage}`]);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isRunning, isLoading]);

  if (!agent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Agent not found</p>
      </div>
    );
  }

  const handleCopyUrl = () => {
    if (purchase?.agentServerUrl) {
      navigator.clipboard.writeText(purchase.agentServerUrl);
      toast({
        title: "Copied!",
        description: "Agent URL copied to clipboard",
      });
    }
  };

  const toggleAgent = () => {
    setIsRunning(!isRunning);
    setLogs(prev => [
      ...prev, 
      `[${new Date().toLocaleTimeString()}] Agent ${isRunning ? 'paused' : 'resumed'}`
    ]);
    toast({
      title: isRunning ? "Agent Paused" : "Agent Running",
      description: isRunning ? "The agent has been paused" : "The agent is now running",
    });
  };

  const stats = [
    { label: "Status", value: isRunning ? "Running" : "Paused", icon: Activity, status: isRunning ? "success" : "warning" },
    { label: "Response Time", value: "45ms", icon: Clock },
    { label: "API Calls Today", value: "1,234", icon: Zap },
    { label: "Success Rate", value: "99.8%", icon: BarChart3 },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-20 min-h-[80vh] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Connecting to Agent</h2>
            <p className="text-muted-foreground">Establishing secure connection...</p>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden">
                <img src={agent.imageUrl} alt={agent.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold">{agent.name}</h1>
                  <Badge variant={isRunning ? "live" : "glass"}>
                    {isRunning ? "Running" : "Paused"}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{agent.category}</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant={isRunning ? "outline" : "default"} 
                onClick={toggleAgent}
                className="gap-2"
              >
                {isRunning ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Pause Agent
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Start Agent
                  </>
                )}
              </Button>
              <Button variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Restart
              </Button>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>

          {/* Agent Server URL */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl border border-border/50 p-4 mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-muted-foreground">Agent Server URL:</span>
                <code className="text-sm font-mono text-primary">
                  {purchase?.agentServerUrl || `http://127.0.0.1:8000/agents/${id}`}
                </code>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleCopyUrl}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => window.open(purchase?.agentServerUrl || `http://127.0.0.1:8000/agents/${id}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="glass-card rounded-2xl p-4 border border-border/50"
              >
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            ))}
          </motion.div>

          {/* Tabs */}
          <Tabs defaultValue="console" className="space-y-4">
            <TabsList className="bg-muted/30 border border-border/50 p-1 rounded-2xl">
              <TabsTrigger value="console" className="rounded-xl px-6 data-[state=active]:bg-background gap-2">
                <Terminal className="w-4 h-4" />
                Console
              </TabsTrigger>
              <TabsTrigger value="metrics" className="rounded-xl px-6 data-[state=active]:bg-background gap-2">
                <BarChart3 className="w-4 h-4" />
                Metrics
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-xl px-6 data-[state=active]:bg-background gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="console">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card rounded-3xl border border-border/50 overflow-hidden"
              >
                <div className="p-4 border-b border-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Live Console</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                    <span className="text-xs text-muted-foreground">{isRunning ? 'Streaming' : 'Paused'}</span>
                  </div>
                </div>
                <div className="bg-black/50 p-4 h-80 overflow-y-auto font-mono text-sm">
                  {logs.map((log, i) => (
                    <div key={i} className="text-green-400 py-0.5">
                      {log}
                    </div>
                  ))}
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="metrics">
              <div className="glass-card rounded-3xl border border-border/50 p-8 text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Metrics Dashboard</h3>
                <p className="text-muted-foreground mb-4">
                  View detailed performance metrics, API usage analytics, and response time trends.
                </p>
                <Button>View Full Analytics</Button>
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <div className="glass-card rounded-3xl border border-border/50 p-6">
                <h3 className="text-xl font-bold mb-6">Agent Configuration</h3>
                <div className="grid gap-4 max-w-xl">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Agent Name</label>
                    <input
                      type="text"
                      defaultValue={agent.name}
                      className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">API Endpoint</label>
                    <input
                      type="text"
                      defaultValue={purchase?.agentServerUrl || `http://127.0.0.1:8000/agents/${id}`}
                      className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 text-foreground"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Timeout (ms)</label>
                    <input
                      type="number"
                      defaultValue="30000"
                      className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 text-foreground"
                    />
                  </div>
                  <Button className="mt-4">Save Configuration</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AgentView;
