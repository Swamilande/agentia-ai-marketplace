import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
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
  ChevronRight
} from "lucide-react";
import { mockAgents } from "@/data/mockAgents";
import { useNavigate } from "react-router-dom";

const purchasedAgents = mockAgents.slice(0, 3);

const stats = [
  { label: "Total Agents", value: "3", icon: Bot, change: "+1 this month" },
  { label: "API Calls", value: "12.4K", icon: Zap, change: "+23% vs last month" },
  { label: "Avg Response", value: "0.8s", icon: Clock, change: "-12% faster" },
  { label: "Success Rate", value: "99.2%", icon: TrendingUp, change: "+0.5%" },
];

const transactions = [
  { id: 1, agent: "Customer Support AI", date: "Dec 28, 2024", amount: "$49", status: "completed" },
  { id: 2, agent: "Sales Assistant Pro", date: "Dec 15, 2024", amount: "$79", status: "completed" },
  { id: 3, agent: "Data Analyst Bot", date: "Dec 1, 2024", amount: "$99", status: "completed" },
];

const Dashboard = () => {
  const navigate = useNavigate();

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
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage your AI agents and monitor performance
            </p>
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
          <Tabs defaultValue="agents" className="space-y-8">
            <TabsList className="bg-muted/30 border border-border/50 p-1 rounded-2xl">
              <TabsTrigger value="agents" className="rounded-xl px-6 data-[state=active]:bg-background">
                My Agents
              </TabsTrigger>
              <TabsTrigger value="billing" className="rounded-xl px-6 data-[state=active]:bg-background">
                Billing & History
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-xl px-6 data-[state=active]:bg-background">
                Settings
              </TabsTrigger>
            </TabsList>

            {/* My Agents Tab */}
            <TabsContent value="agents" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {purchasedAgents.map((agent, i) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
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
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-foreground mb-2">{agent.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {agent.description}
                      </p>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <BarChart3 className="w-3 h-3" />
                          <span>2.4K calls</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>Active</span>
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
                ))}
              </div>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="space-y-6">
              <div className="glass-card rounded-3xl border border-border/50 overflow-hidden">
                <div className="p-6 border-b border-border/50">
                  <h3 className="text-lg font-semibold text-foreground">Payment History</h3>
                </div>
                <div className="divide-y divide-border/50">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-muted/20 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{tx.agent}</p>
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
                        defaultValue="John Doe"
                        className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Email</label>
                      <input
                        type="email"
                        defaultValue="john@example.com"
                        className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                      />
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

export default Dashboard;
