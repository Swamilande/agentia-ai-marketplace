import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/FooterNew";
import { AgentCard } from "@/components/AgentCard";
import { useAgents } from "@/lib/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const categories = ["All", "Analytics", "Sales", "Engineering", "Marketing"];

export default function Marketplace() {
  const { data: agents, isLoading } = useAgents();
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All" ? agents : agents?.filter((a) => a.category === filter);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-6">Agent Marketplace</h1>

        <div className="flex gap-2 mb-8 flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={filter === cat ? "default" : "outline"}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered?.map((agent) => (
              <AgentCard key={agent.id} agent={agent} showFeatures />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
