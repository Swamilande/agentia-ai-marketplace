import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Bot, Plus, Search, ShoppingBag, History } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  type: 'agents' | 'purchases' | 'transactions' | 'activity';
}

const emptyStates = {
  agents: {
    icon: Bot,
    title: "No agents yet",
    description: "You haven't created any agents yet. Start building your first AI agent or explore our marketplace.",
    primaryAction: { label: "Create Agent", href: "/create-agent", icon: Plus },
    secondaryAction: { label: "Explore Marketplace", href: "/marketplace", icon: Search },
  },
  purchases: {
    icon: ShoppingBag,
    title: "No purchased agents",
    description: "You haven't purchased any agents from the marketplace yet. Discover powerful AI agents to supercharge your workflow.",
    primaryAction: { label: "Browse Marketplace", href: "/marketplace", icon: Search },
    secondaryAction: null,
  },
  transactions: {
    icon: History,
    title: "No transactions yet",
    description: "Your payment history will appear here once you make your first purchase.",
    primaryAction: { label: "Explore Marketplace", href: "/marketplace", icon: Search },
    secondaryAction: null,
  },
  activity: {
    icon: History,
    title: "No activity yet",
    description: "Your activity history will appear here as you use the platform.",
    primaryAction: null,
    secondaryAction: null,
  },
};

export function EmptyState({ type }: EmptyStateProps) {
  const state = emptyStates[type];
  const Icon = state.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-20 h-20 rounded-3xl bg-muted/50 border border-border/50 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-muted-foreground" />
      </div>
      
      <h3 className="text-xl font-bold text-foreground mb-2">
        {state.title}
      </h3>
      
      <p className="text-muted-foreground max-w-md mb-8">
        {state.description}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        {state.primaryAction && (
          <Link to={state.primaryAction.href}>
            <Button className="rounded-full gap-2">
              <state.primaryAction.icon className="w-4 h-4" />
              {state.primaryAction.label}
            </Button>
          </Link>
        )}
        {state.secondaryAction && (
          <Link to={state.secondaryAction.href}>
            <Button variant="outline" className="rounded-full gap-2">
              <state.secondaryAction.icon className="w-4 h-4" />
              {state.secondaryAction.label}
            </Button>
          </Link>
        )}
      </div>
    </motion.div>
  );
}
