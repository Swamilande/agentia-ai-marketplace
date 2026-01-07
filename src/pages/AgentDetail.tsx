import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Shield, Zap, BarChart3, Share2, Check, ExternalLink } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentCard } from "@/components/marketplace/AgentCard";
import { mockAgents } from "@/data/mockAgents";
import { useAuthStore } from "@/stores/authStore";
import { usePurchaseStore } from "@/stores/purchaseStore";

const AgentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { hasPurchased, getPurchase } = usePurchaseStore();
  
  const agent = mockAgents.find((a) => a.id === id) || mockAgents[0];
  const relatedAgents = mockAgents.filter((a) => a.id !== agent.id).slice(0, 3);
  
  const isPurchased = user ? hasPurchased(agent.id, user.id) : false;
  const purchase = user ? getPurchase(agent.id, user.id) : undefined;

  const handlePurchaseClick = () => {
    if (!isAuthenticated) {
      navigate("/auth/login", { state: { from: `/purchase/${agent.id}` } });
      return;
    }
    navigate(`/purchase/${agent.id}`);
  };

  const handleUseAgent = () => {
    // Navigate to the agent view page
    navigate(`/agent-view/${agent.id}`);
  };

  const features = [
    "Natural language understanding with 99.2% accuracy",
    "Multi-channel support (web, email, chat, voice)",
    "Real-time sentiment analysis and routing",
    "Custom knowledge base integration",
    "24/7 autonomous operation",
    "Seamless human handoff when needed",
    "Analytics dashboard with ROI tracking",
    "API access for custom integrations",
  ];

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
              to="/marketplace"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to marketplace
            </Link>
          </motion.div>

          {/* Hero Section */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 mb-16">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative aspect-square rounded-4xl overflow-hidden"
            >
              <img
                src={agent.imageUrl}
                alt={agent.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="category">{agent.category}</Badge>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold">{agent.rating}</span>
                  <span className="text-muted-foreground">({agent.reviewCount} reviews)</span>
                </div>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                {agent.name}
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {agent.description}
              </p>

              {/* Purchase Card */}
              <div className="glass-card border border-foreground/10 rounded-3xl p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">One-time purchase</p>
                    <p className="text-4xl font-black">${agent.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-400 font-medium">Instant Deploy</p>
                    <p className="text-sm text-muted-foreground">7-day refund policy</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  {isPurchased ? (
                    <Button 
                      className="flex-1 h-14 rounded-2xl text-base font-bold bg-green-600 hover:bg-green-700"
                      onClick={handleUseAgent}
                    >
                      Use Agent
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      className="flex-1 h-14 rounded-2xl text-base font-bold"
                      onClick={handlePurchaseClick}
                    >
                      Purchase Now
                    </Button>
                  )}
                  <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-4">
                {[
                  { icon: Shield, label: "Secure Payment" },
                  { icon: Zap, label: "Instant Access" },
                  { icon: BarChart3, label: "Analytics Included" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-20"
          >
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start bg-transparent border-b border-foreground/10 rounded-none h-auto p-0 mb-8">
                <TabsTrigger
                  value="overview"
                  className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 pb-4 text-base"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="features"
                  className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 pb-4 text-base"
                >
                  Features
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 pb-4 text-base"
                >
                  Reviews
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-0">
                <div className="prose prose-invert max-w-none">
                  <h3 className="text-2xl font-bold mb-4">About this agent</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {agent.name} is a production-ready AI agent designed to transform how businesses handle {agent.category.toLowerCase()}. Built on the latest large language models and fine-tuned for enterprise use cases, this agent delivers exceptional accuracy and reliability out of the box.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    With support for multiple languages, seamless integration capabilities, and real-time analytics, {agent.name} helps teams reduce operational costs while improving customer satisfaction and response times.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="features" className="mt-0">
                <h3 className="text-2xl font-bold mb-6">What's included</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-2xl bg-secondary/30 border border-foreground/5"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-0">
                <h3 className="text-2xl font-bold mb-6">Customer reviews</h3>
                <div className="text-center py-12 text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>Reviews coming soon</p>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Related Agents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold mb-8">You might also like</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedAgents.map((agent, index) => (
                <AgentCard key={agent.id} agent={agent} index={index} />
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AgentDetail;
