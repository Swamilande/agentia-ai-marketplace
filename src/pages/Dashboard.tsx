import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bot, 
  Play, 
  Settings, 
  CreditCard, 
  Download,
  TrendingUp,
  Clock,
  Zap,
  BarChart3,
  Calendar,
  User,
  History,
  Plus
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { emptyDashboardData, mockDashboardData, type DashboardAgent } from "@/data/mockDashboardData";
import { useNavigate, useSearchParams } from "react-router-dom";

// Simulate whether user is new (for demo, use localStorage to track)
const useIsNewUser = () => {
  const { user } = useAuthStore();
  const [isNew, setIsNew] = useState(true);

  useEffect(() => {
    if (user?.id) {
      const hasData = localStorage.getItem(`user_has_data_${user.id}`);
      setIsNew(!hasData);
    }
  }, [user?.id]);

  const markAsExperienced = () => {
    if (user?.id) {
      localStorage.setItem(`user_has_data_${user.id}`, 'true');
      setIsNew(false);
    }
  };

  return { isNew, markAsExperienced };
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const { isNew, markAsExperienced } = useIsNewUser();
  
  // Use empty data for new users, mock data for experienced users
  const dashboardData = isNew ? emptyDashboardData : mockDashboardData;
  
  const defaultTab = searchParams.get('tab') || 'agents';
  
  const stats = [
    { label: "Total Agents", value: dashboardData.stats.totalAgents.toString(), icon: Bot, change: isNew ? "Get started!" : "+1 this month" },
    { label: "API Calls", value: dashboardData.stats.apiCalls, icon: Zap, change: isNew ? "-" : "+23% vs last month" },
    { label: "Avg Response", value: dashboardData.stats.avgResponse, icon: Clock, change: isNew ? "-" : "-12% faster" },
    { label: "Success Rate", value: dashboardData.stats.successRate, icon: TrendingUp, change: isNew ? "-" : "+0.5%" },
  ];

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground />
      <Navbar />
      
      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
                  Welcome back, {user?.name || 'User'}
                </h1>
                <p className="text-muted-foreground">
                  {isNew 
                    ? "Let's get you started with your first AI agent" 
                    : "Manage your AI agents and monitor performance"
                  }
                </p>
              </div>
            </div>
            
            {/* Demo toggle for testing */}
            {isNew && (
              <div className="mt-4 p-4 rounded-2xl bg-primary/5 border border-primary/20">
                <p className="text-sm text-muted-foreground mb-2">
                  🎉 This is your empty dashboard. Once you create or purchase agents, they'll appear here.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={markAsExperienced}
                  className="text-xs"
                >
                  Demo: Show populated dashboard
                </Button>
              </div>
            )}
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="glass-card rounded-2xl p-6 border border-border/50"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-xs text-primary mt-2">{stat.change}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Tabs */}
          <Tabs defaultValue={defaultTab} className="space-y-8">
            <TabsList className="bg-muted/30 border border-border/50 p-1 rounded-2xl">
              <TabsTrigger value="agents" className="rounded-xl px-6 data-[state=active]:bg-background gap-2">
                <Bot className="w-4 h-4" />
                My Agents
              </TabsTrigger>
              <TabsTrigger value="activity" className="rounded-xl px-6 data-[state=active]:bg-background gap-2">
                <History className="w-4 h-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="billing" className="rounded-xl px-6 data-[state=active]:bg-background gap-2">
                <CreditCard className="w-4 h-4" />
                Billing
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-xl px-6 data-[state=active]:bg-background gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* My Agents Tab */}
            <TabsContent value="agents" className="space-y-8">
              {/* Created Agents Section */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-foreground">Created Agents</h2>
                  <Link to="/create-agent">
                    <Button size="sm" className="rounded-full gap-2">
                      <Plus className="w-4 h-4" />
                      Create Agent
                    </Button>
                  </Link>
                </div>
                
                {dashboardData.createdAgents.length === 0 ? (
                  <div className="glass-card rounded-3xl border border-border/50">
                    <EmptyState type="agents" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dashboardData.createdAgents.map((agent, i) => (
                      <AgentCard key={agent.id} agent={agent} index={i} navigate={navigate} />
                    ))}
                  </div>
                )}
              </div>

              {/* Purchased Agents Section */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-foreground">Purchased Agents</h2>
                  <Link to="/marketplace">
                    <Button variant="outline" size="sm" className="rounded-full">
                      Browse Marketplace
                    </Button>
                  </Link>
                </div>
                
                {dashboardData.purchasedAgents.length === 0 ? (
                  <div className="glass-card rounded-3xl border border-border/50">
                    <EmptyState type="purchases" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dashboardData.purchasedAgents.map((agent, i) => (
                      <AgentCard key={agent.id} agent={agent} index={i} navigate={navigate} />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              <div className="glass-card rounded-3xl border border-border/50 overflow-hidden">
                <div className="p-6 border-b border-border/50">
                  <h3 className="text-lg font-semibold text-foreground">Activity History</h3>
                  <p className="text-sm text-muted-foreground">Your recent actions and events</p>
                </div>
                
                {dashboardData.activityHistory.length === 0 ? (
                  <EmptyState type="activity" />
                ) : (
                  <div className="divide-y divide-border/50">
                    {dashboardData.activityHistory.map((activity) => (
                      <div key={activity.id} className="p-6 flex items-center gap-4 hover:bg-muted/20 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <History className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{activity.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <Badge variant="info" className="capitalize">{activity.type.replace('_', ' ')}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="space-y-6">
              <div className="glass-card rounded-3xl border border-border/50 overflow-hidden">
                <div className="p-6 border-b border-border/50">
                  <h3 className="text-lg font-semibold text-foreground">Payment History</h3>
                  <p className="text-sm text-muted-foreground">Your transaction history</p>
                </div>
                
                {dashboardData.transactions.length === 0 ? (
                  <EmptyState type="transactions" />
                ) : (
                  <div className="divide-y divide-border/50">
                    {dashboardData.transactions.map((tx) => (
                      <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-muted/20 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{tx.agentName}</p>
                            <p className="text-sm text-muted-foreground">{tx.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-foreground">{tx.amount}</span>
                          <Badge variant="info" className="capitalize">{tx.status}</Badge>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile Settings */}
                <div className="glass-card rounded-3xl border border-border/50 p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-6">Profile Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Display Name</label>
                      <input
                        type="text"
                        defaultValue={user?.name || ''}
                        className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Email</label>
                      <input
                        type="email"
                        defaultValue={user?.email || ''}
                        className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">User ID</label>
                      <input
                        type="text"
                        value={user?.id || ''}
                        className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 text-muted-foreground"
                        readOnly
                      />
                      <p className="text-xs text-muted-foreground mt-1">This ID links to your backend data</p>
                    </div>
                    <Button className="w-full rounded-xl mt-4">Save Changes</Button>
                  </div>
                </div>

                {/* API Keys */}
                <div className="glass-card rounded-3xl border border-border/50 p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-6">API Configuration</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">API Key</label>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          defaultValue="sk-xxxxxxxxxxxxxxxx"
                          className="flex-1 bg-muted/30 border border-border/50 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                          readOnly
                        />
                        <Button variant="outline" className="rounded-xl">Copy</Button>
                      </div>
                    </div>
                    <div className="p-4 bg-muted/20 rounded-xl border border-border/50">
                      <p className="text-sm text-muted-foreground">
                        Your API key provides access to all your purchased agents. Keep it secure and never share it publicly.
                      </p>
                    </div>
                    <Button variant="outline" className="w-full rounded-xl">
                      Regenerate API Key
                    </Button>
                  </div>
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

// Agent Card component
function AgentCard({ agent, index, navigate }: { agent: DashboardAgent; index: number; navigate: (path: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-card rounded-3xl overflow-hidden border border-border/50 group"
    >
      <div className="aspect-video relative overflow-hidden">
        <img
          src={agent.imageUrl}
          alt={agent.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <Badge className="absolute top-4 left-4" variant="category">
          {agent.category}
        </Badge>
        <Badge 
          className="absolute top-4 right-4" 
          variant={agent.status === 'active' ? 'live' : 'glass'}
        >
          {agent.status}
        </Badge>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-foreground mb-2">{agent.name}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {agent.description}
        </p>
        
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <BarChart3 className="w-3 h-3" />
            <span>{agent.apiCalls.toLocaleString()} calls</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{agent.status === 'active' ? 'Active' : 'Inactive'}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1 rounded-xl"
            onClick={() => navigate(`/agents/${agent.id}`)}
          >
            <Play className="w-4 h-4 mr-2" />
            Launch
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default Dashboard;
