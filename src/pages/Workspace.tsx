import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePurchasedAgents, useTaskHistory, type Agent, getAgentBgClass, getAgentColorClass } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Bot, History, ShoppingBag, LogOut } from "lucide-react";
import { DataAnalystAgent } from "@/components/agents/DataAnalystAgent";
import { SalesProspectorAgent } from "@/components/agents/SalesProspectorAgent";
import { CodeReviewerAgent } from "@/components/agents/CodeReviewerAgent";
import { ContentWriterAgent } from "@/components/agents/ContentWriterAgent";
import { format } from "date-fns";

export default function Workspace() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: agents, isLoading } = usePurchasedAgents();
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const { data: taskHistory } = useTaskHistory(activeAgent?.id);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth/login?redirect=/workspace");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (agents?.length && !activeAgent) setActiveAgent(agents[0]);
  }, [agents, activeAgent]);

  if (authLoading || isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  if (!agents?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold">No agents yet</h2>
          <p className="text-muted-foreground">Browse the marketplace to purchase your first AI agent.</p>
          <Button onClick={() => navigate("/marketplace")}>Browse Agents</Button>
        </div>
      </div>
    );
  }

  const renderAgent = () => {
    if (!activeAgent) return null;
    switch (activeAgent.slug) {
      case "data-analyst": return <DataAnalystAgent agentId={activeAgent.id} />;
      case "sales-prospector": return <SalesProspectorAgent agentId={activeAgent.id} />;
      case "code-reviewer": return <CodeReviewerAgent agentId={activeAgent.id} />;
      case "content-writer": return <ContentWriterAgent agentId={activeAgent.id} />;
      default: return <p className="text-muted-foreground">Unknown agent type</p>;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-60 border-r bg-background flex flex-col shrink-0">
        <div className="p-4 border-b flex items-center gap-2 font-bold">
          <Bot className="h-5 w-5" /> AgentMarket
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {agents?.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setActiveAgent(agent)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left text-sm transition-colors ${
                activeAgent?.id === agent.id ? "bg-muted font-medium" : "hover:bg-muted/50"
              }`}
            >
              <span className={`text-xl w-8 h-8 rounded flex items-center justify-center shrink-0 ${getAgentBgClass(agent.color)}`}>{agent.icon}</span>
              <span className="truncate">{agent.name.replace(" Agent", "")}</span>
            </button>
          ))}
        </nav>
        <div className="p-3 border-t">
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => { signOut(); navigate("/"); }}>
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b flex items-center justify-between px-6 shrink-0">
          <h1 className={`font-semibold ${getAgentColorClass(activeAgent?.color || "")}`}>
            {activeAgent?.icon} {activeAgent?.name}
          </h1>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm"><History className="h-4 w-4 mr-1" /> Task History</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader><SheetTitle>Task History</SheetTitle></SheetHeader>
              <div className="mt-4 space-y-3">
                {taskHistory?.length === 0 && <p className="text-sm text-muted-foreground">No tasks yet.</p>}
                {taskHistory?.map((task: any) => (
                  <div key={task.id} className="border rounded-md p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={task.status === "done" ? "default" : task.status === "failed" ? "destructive" : "secondary"}>
                        {task.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(task.created_at), "MMM d, h:mm a")}
                      </span>
                    </div>
                    <p className="text-sm truncate">
                      {JSON.stringify(task.input).substring(0, 60)}...
                    </p>
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </header>

        {/* Agent interface */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderAgent()}
        </main>
      </div>
    </div>
  );
}
