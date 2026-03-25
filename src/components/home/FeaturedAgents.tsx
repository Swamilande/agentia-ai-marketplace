import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Code2, Headphones, BarChart3, PenTool } from "lucide-react";

const trendingAgents = [
  {
    icon: Code2,
    name: "CodeCraft AI",
    description: "An advanced pair programming agent that writes, reviews, and optimizes your code.",
    tag: "Developer",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    slug: "code-reviewer",
  },
  {
    icon: Headphones,
    name: "SupportNexus",
    description: "Autonomous L1 customer support agent that resolves tickets 24/7 with human-like empathy.",
    tag: "Customer Success",
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    slug: "customer-support-ai",
  },
  {
    icon: BarChart3,
    name: "DataQuant",
    description: "Connect your database and get instant, natural-language analytics and visualizations.",
    tag: "Analytics",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    slug: "data-analyst",
  },
  {
    icon: PenTool,
    name: "Content Weaver",
    description: "Generates high-converting marketing copy, blog posts, and social media content.",
    tag: "Marketing",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    slug: "content-creator",
  },
];

export function FeaturedAgents() {
  return (
    <section className="py-24 lg:py-36 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12"
        >
          <div>
            <span className="inline-block glass-card rounded-full px-5 py-1.5 text-xs font-medium tracking-widest uppercase text-primary mb-4">
              Trending Agents
            </span>
            <p className="text-lg text-muted-foreground max-w-xl">
              Discover the most popular agents built by the community to automate your workflow.
            </p>
          </div>
          <Link
            to="/marketplace"
            className="group flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium text-sm"
          >
            View Full Marketplace
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingAgents.map((agent, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Link
                to={`/marketplace`}
                className="block glass-card rounded-3xl p-6 hover:border-primary/30 transition-all duration-500 group h-full"
              >
                {/* Glow dot */}
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-10 h-10 rounded-xl ${agent.bgColor} flex items-center justify-center border ${agent.borderColor}`}>
                    <agent.icon className={`h-5 w-5 ${agent.color}`} />
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                </div>

                <h3 className="text-lg font-bold mb-2">{agent.name}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {agent.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${agent.bgColor} ${agent.color}`}>
                    {agent.tag}
                  </span>
                  <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                    View Agent <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
