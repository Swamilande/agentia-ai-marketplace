import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Settings, 
  ExternalLink,
  Copy,
  Loader2,
  Shield,
  Zap
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
import { useAgentConfigStore } from "@/stores/agentConfigStore";
import { AgentSetupWizard } from "@/components/agent/AgentSetupWizard";
import { AgentWorkspace } from "@/components/agent/AgentWorkspace";

const AgentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuthStore();
  const { hasPurchased, getPurchase } = usePurchaseStore();
  const { isSetupComplete, getConfig } = useAgentConfigStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  
  const agent = mockAgents.find((a) => a.id === id);
  const isPurchased = user ? hasPurchased(id || '', user.id) : false;
  const purchase = user ? getPurchase(id || '', user.id) : undefined;
  const setupComplete = user ? isSetupComplete(id || '', user.id) : false;
  const config = user ? getConfig(id || '', user.id) : undefined;
  
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

  // Check if setup is needed
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (isPurchased && !setupComplete) {
        setShowSetup(true);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [isPurchased, setupComplete]);

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

  const handleSetupComplete = () => {
    setShowSetup(false);
    toast({
      title: "🚀 Agent Ready!",
      description: "Your agent is now configured and ready to use.",
    });
  };

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

  // Show setup wizard if not complete
  if (showSetup && user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="w-20 h-20 rounded-3xl overflow-hidden mx-auto mb-4">
                <img src={agent.imageUrl} alt={agent.name} className="w-full h-full object-cover" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Setup {agent.name}</h1>
              <p className="text-muted-foreground">
                Configure your agent to get started. This only takes a minute.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-3xl border border-border/50 p-8"
            >
              <AgentSetupWizard
                agentId={agent.id}
                agentName={agent.name}
                userId={user.id}
                onComplete={handleSetupComplete}
              />
            </motion.div>
          </div>
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
                  <Badge variant="live">Active</Badge>
                  <Badge variant="outline" className="gap-1">
                    <Shield className="w-3 h-3" />
                    Encrypted
                  </Badge>
                </div>
                <p className="text-muted-foreground">{agent.category}</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => setShowSetup(true)}
              >
                <Settings className="h-4 w-4" />
                Reconfigure
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
                <span className="text-sm text-muted-foreground">Agent Server:</span>
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

          {/* Config Summary */}
          {config && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass-card rounded-2xl border border-border/50 p-4 mb-8"
            >
              <div className="flex items-center gap-4 flex-wrap">
                <Badge variant="outline">
                  <Zap className="w-3 h-3 mr-1" />
                  {config.setupData.industry || 'General'}
                </Badge>
                {config.setupData.goals?.slice(0, 3).map(goal => (
                  <Badge key={goal} variant="secondary">{goal}</Badge>
                ))}
                {(config.setupData.goals?.length || 0) > 3 && (
                  <Badge variant="outline">+{(config.setupData.goals?.length || 0) - 3} more</Badge>
                )}
              </div>
            </motion.div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="workspace" className="space-y-4">
            <TabsList className="bg-muted/30 border border-border/50 p-1 rounded-2xl">
              <TabsTrigger value="workspace" className="rounded-xl px-6 data-[state=active]:bg-background gap-2">
                <Zap className="w-4 h-4" />
                Workspace
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-xl px-6 data-[state=active]:bg-background gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="workspace">
              {user && (
                <AgentWorkspace
                  agent={agent}
                  userId={user.id}
                  serverUrl={purchase?.agentServerUrl || `http://127.0.0.1:8000/agents/${id}`}
                />
              )}
            </TabsContent>

            <TabsContent value="settings">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card rounded-3xl border border-border/50 p-6"
              >
                <h3 className="text-xl font-bold mb-6">Agent Configuration</h3>
                {config && (
                  <div className="grid gap-4 max-w-xl">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Business Name</label>
                      <input
                        type="text"
                        defaultValue={config.setupData.businessName}
                        className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 text-foreground"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Industry</label>
                      <input
                        type="text"
                        defaultValue={config.setupData.industry}
                        className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 text-foreground"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Webhook URL</label>
                      <input
                        type="text"
                        defaultValue={config.setupData.webhookUrl || 'Not configured'}
                        className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 text-foreground"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Custom Instructions</label>
                      <textarea
                        defaultValue={config.setupData.customPrompt || 'No custom instructions'}
                        className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 text-foreground min-h-[100px]"
                        readOnly
                      />
                    </div>
                    <Button className="mt-4" onClick={() => setShowSetup(true)}>
                      Edit Configuration
                    </Button>
                  </div>
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AgentView;
