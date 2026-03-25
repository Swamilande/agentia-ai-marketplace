import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { AgentCard } from "@/components/marketplace/AgentCard";
import { mockAgents } from "@/data/mockAgents";

export function FeaturedAgents() {
  const featuredAgents = mockAgents.slice(0, 3);

  return (
    <section className="py-24 lg:py-40 relative overflow-hidden">
      {/* Gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12 lg:mb-16"
        >
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Featured Agents
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl">
              Hand-picked AI agents trusted by leading enterprises worldwide.
            </p>
          </div>
          <Link
            to="/marketplace"
            className="group flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
          >
            View full catalog
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredAgents.map((agent, index) => (
            <AgentCard key={agent.id} agent={agent} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
