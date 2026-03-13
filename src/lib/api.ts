import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import type { Tables } from "@/integrations/supabase/types";

export type Agent = Tables<"agents">;
export type Purchase = Tables<"purchases">;

export function useAgents() {
  return useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .eq("is_active", true)
        .order("created_at");
      if (error) throw error;
      return data as Agent[];
    },
  });
}

export function usePurchases() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["purchases", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("purchases")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      return data as Purchase[];
    },
    enabled: !!user,
  });
}

export function usePurchasedAgents() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["purchased-agents", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("purchases")
        .select("agent_id, agents(*)")
        .eq("user_id", user.id);
      if (error) throw error;
      return (data || []).map((p: any) => p.agents as Agent).filter(Boolean);
    },
    enabled: !!user,
  });
}

export async function purchaseAgent(userId: string, agentId: string) {
  // TODO: Replace with Stripe Checkout via Supabase Edge Function
  const { error } = await supabase.from("purchases").insert({
    user_id: userId,
    agent_id: agentId,
    stripe_session_id: `sim_${Date.now()}`,
  });
  if (error) throw error;
}

export async function executeAgentTask(agentSlug: string, userMessage: string) {
  const { data, error } = await supabase.functions.invoke("agent-execute", {
    body: { agentSlug, userMessage },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data.result;
}

export async function saveTask(userId: string, agentId: string, input: any) {
  const { data, error } = await supabase
    .from("tasks")
    .insert({ user_id: userId, agent_id: agentId, input, status: "running" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function completeTask(taskId: string, outputType: string, content: any) {
  await supabase.from("task_outputs").insert({ task_id: taskId, output_type: outputType, content });
  await supabase.from("tasks").update({ status: "done" }).eq("id", taskId);
}

export async function failTask(taskId: string) {
  await supabase.from("tasks").update({ status: "failed" }).eq("id", taskId);
}

export function useTaskHistory(agentId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["tasks", user?.id, agentId],
    queryFn: async () => {
      if (!user || !agentId) return [];
      const { data, error } = await supabase
        .from("tasks")
        .select("*, task_outputs(*)")
        .eq("user_id", user.id)
        .eq("agent_id", agentId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!agentId,
  });
}

export function getAgentColor(color: string): string {
  const map: Record<string, string> = {
    "#3B8BD4": "hsl(var(--agent-blue))",
    "#1D9E75": "hsl(var(--agent-green))",
    "#D85A30": "hsl(var(--agent-orange))",
    "#7F77DD": "hsl(var(--agent-purple))",
  };
  return map[color] || color;
}

export function getAgentColorClass(color: string): string {
  const map: Record<string, string> = {
    "#3B8BD4": "text-agent-blue",
    "#1D9E75": "text-agent-green",
    "#D85A30": "text-agent-orange",
    "#7F77DD": "text-agent-purple",
  };
  return map[color] || "";
}

export function getAgentBgClass(color: string): string {
  const map: Record<string, string> = {
    "#3B8BD4": "bg-agent-blue/10",
    "#1D9E75": "bg-agent-green/10",
    "#D85A30": "bg-agent-orange/10",
    "#7F77DD": "bg-agent-purple/10",
  };
  return map[color] || "bg-muted";
}
