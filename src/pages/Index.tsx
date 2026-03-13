import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/FooterNew";
import { AgentCard } from "@/components/AgentCard";
import { useAgents } from "@/lib/api";
import { Zap, ShoppingCart, LayoutDashboard, Play } from "lucide-react";

const steps = [
  { icon: ShoppingCart, title: "Browse the marketplace", desc: "Find the perfect AI agent for your task." },
  { icon: Zap, title: "Purchase an agent", desc: "One-time payment — no subscriptions." },
  { icon: LayoutDashboard, title: "Open your workspace", desc: "Access your agents in a unified dashboard." },
  { icon: Play, title: "Run and get results", desc: "Upload data, click run, get deliverables." },
];

export default function Index() {
  const { data: agents, isLoading } = useAgents();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 md:py-28">
          <div className="container text-center max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Your Digital Workforce, On Demand
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Purchase specialized AI agents that do real work — data analysis, sales research, code review, and content writing.
            </p>
          </div>
        </section>

        {/* Agent grid */}
        <section className="pb-16">
          <div className="container">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-80 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {agents?.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 bg-muted/50">
          <div className="container">
            <h2 className="text-2xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-8">
              {steps.map((step, i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
