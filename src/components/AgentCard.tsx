import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePurchases, type Agent, purchaseAgent, getAgentBgClass, getAgentColorClass } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface AgentCardProps {
  agent: Agent;
  showFeatures?: boolean;
}

export function AgentCard({ agent, showFeatures = false }: AgentCardProps) {
  const { user } = useAuth();
  const { data: purchases } = usePurchases();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [purchasing, setPurchasing] = useState(false);

  const owned = purchases?.some((p) => p.agent_id === agent.id);
  const features = (agent.features as string[]) || [];
  const displayFeatures = showFeatures ? features : features.slice(0, 3);
  const price = (agent.price_cents / 100).toFixed(2);

  const handleBuy = async () => {
    if (!user) {
      navigate(`/auth/login?redirect=/marketplace`);
      return;
    }
    setPurchasing(true);
    try {
      await purchaseAgent(user.id, agent.id);
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["purchased-agents"] });
      toast({ title: "Purchase successful!", description: `You now own ${agent.name}` });
    } catch (e: any) {
      toast({ title: "Purchase failed", description: e.message, variant: "destructive" });
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <Card className="flex flex-col h-full border hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3 mb-2">
          <div className={`text-3xl w-12 h-12 rounded-lg flex items-center justify-center ${getAgentBgClass(agent.color)}`}>
            {agent.icon}
          </div>
          <div>
            <h3 className="font-semibold text-lg leading-tight">{agent.name}</h3>
            <Badge variant="secondary" className="mt-1 text-xs">{agent.category}</Badge>
          </div>
        </div>
        <p className={`text-sm font-medium ${getAgentColorClass(agent.color)}`}>{agent.tagline}</p>
      </CardHeader>
      <CardContent className="flex-1 pb-3">
        {showFeatures && (
          <p className="text-sm text-muted-foreground mb-3">{agent.description}</p>
        )}
        <ul className="space-y-1.5">
          {displayFeatures.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 mt-0.5 shrink-0 text-foreground/50" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-3 flex items-center justify-between border-t">
        <span className="text-2xl font-bold">${price}</span>
        {owned ? (
          <Button onClick={() => navigate("/workspace")} variant="outline">
            Open Workspace
          </Button>
        ) : (
          <Button onClick={handleBuy} disabled={purchasing}>
            {purchasing ? "Processing..." : "Buy Now"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
