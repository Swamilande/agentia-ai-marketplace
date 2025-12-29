import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  hasLiveDemo: boolean;
  tags?: string[];
}

interface AgentCardProps {
  agent: Agent;
  index?: number;
}

export function AgentCard({ agent, index = 0 }: AgentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -12 }}
      className="group relative"
    >
      <Link to={`/agents/${agent.id}`}>
        <div className="relative bg-zinc-900/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-foreground/5 hover:border-primary/50 transition-all duration-500 glow-hover">
          {/* Image Container */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={agent.imageUrl}
              alt={agent.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent" />
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge className="bg-background/60 backdrop-blur-md text-foreground border-foreground/10 rounded-2xl px-4 py-2 text-2xs uppercase tracking-[0.2em] font-black">
                {agent.category}
              </Badge>
            </div>
            {agent.hasLiveDemo && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-green-500/80 backdrop-blur-md text-foreground border-none rounded-2xl px-3 py-1.5 text-2xs uppercase tracking-[0.15em] font-black">
                  <span className="w-1.5 h-1.5 bg-foreground rounded-full mr-1.5 animate-pulse" />
                  Live Demo
                </Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="relative -mt-12 px-6 pb-6 pt-0">
            {/* Rating pill */}
            <div className="inline-flex items-center gap-1.5 bg-background/80 backdrop-blur-md rounded-full px-3 py-1.5 border border-foreground/10 mb-4">
              <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-bold">{agent.rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({agent.reviewCount})</span>
            </div>

            <h3 className="text-2xl font-black tracking-tight mb-2 group-hover:text-primary transition-colors">
              {agent.name}
            </h3>
            <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
              {agent.description}
            </p>

            {/* Divider */}
            <div className="border-t border-foreground/5 my-4" />

            {/* Price & Actions */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">One-time</p>
                <p className="text-3xl font-black">${agent.price}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" className="rounded-full h-10 px-4 text-xs font-bold uppercase tracking-wider">
                  Try
                </Button>
                <Button size="sm" className="rounded-full h-10 px-4 text-xs font-bold uppercase tracking-wider group/btn">
                  Deploy
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </div>
            </div>
          </div>

          {/* Glow effect */}
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      </Link>
    </motion.div>
  );
}
