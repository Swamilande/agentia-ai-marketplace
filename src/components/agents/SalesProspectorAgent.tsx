import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { executeAgentTask, saveTask, completeTask, failTask } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Target, ChevronDown, Copy, Download, Mail } from "lucide-react";

const STATUS_MESSAGES = ["Searching company databases...", "Scoring leads...", "Building profiles...", "Writing outreach emails...", "Compiling market insights..."];

interface SalesProspectorProps { agentId: string; }

export function SalesProspectorAgent({ agentId }: SalesProspectorProps) {
  const { user } = useAuth();
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("SMB (50-200)");
  const [region, setRegion] = useState("");
  const [description, setDescription] = useState("");
  const [leadCount, setLeadCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleRun = async () => {
    if (!user || !industry) return;
    setLoading(true);
    setError("");
    setResult(null);

    let msgIndex = 0;
    const interval = setInterval(() => { setStatusMsg(STATUS_MESSAGES[msgIndex % STATUS_MESSAGES.length]); msgIndex++; }, 2000);

    let taskId: string | null = null;
    try {
      const task = await saveTask(user.id, agentId, { industry, companySize, region, description, leadCount });
      taskId = task.id;

      const userMessage = `Find ${leadCount} prospects matching this profile:\nIndustry: ${industry}\nCompany size: ${companySize}\nRegion: ${region}\nIdeal customer description: ${description || "Not specified"}\n\nGenerate realistic, detailed prospects with personalized outreach emails.`;

      const res = await executeAgentTask("sales-prospector", userMessage);
      setResult(res);
      await completeTask(taskId, "sales-prospecting", res);
    } catch (e: any) {
      setError(e.message);
      if (taskId) await failTask(taskId);
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      clearInterval(interval);
      setLoading(false);
      setStatusMsg("");
    }
  };

  const copyEmail = (email: any) => {
    navigator.clipboard.writeText(`Subject: ${email.subject}\n\n${email.body}`);
    toast({ title: "Copied to clipboard" });
  };

  const exportCSV = () => {
    if (!result?.prospects) return;
    const headers = ["Company", "Website", "Industry", "Employees", "Location", "Funding Stage", "Fit Score", "Decision Maker", "Title"];
    const rows = result.prospects.map((p: any) => [p.company, p.website, p.industry, p.employees, p.location, p.funding_stage, p.fit_score, p.decision_maker?.name, p.decision_maker?.title]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "prospects.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-emerald-100 text-emerald-700";
    if (score >= 5) return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" /> Sales Prospector</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Industry *</Label>
              <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g., SaaS, Fintech" />
            </div>
            <div className="space-y-2">
              <Label>Company Size</Label>
              <Select value={companySize} onValueChange={setCompanySize}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Startup (1-50)">Startup (1-50)</SelectItem>
                  <SelectItem value="SMB (50-200)">SMB (50-200)</SelectItem>
                  <SelectItem value="Mid-market (200-1000)">Mid-market (200-1000)</SelectItem>
                  <SelectItem value="Enterprise (1000+)">Enterprise (1000+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Region</Label>
              <Input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="e.g., North America" />
            </div>
            <div className="space-y-2">
              <Label>Number of leads</Label>
              <Input type="number" min={5} max={20} value={leadCount} onChange={(e) => setLeadCount(+e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Describe your ideal customer</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe their problems, budget, and why they'd buy..." rows={3} />
          </div>
          <Button onClick={handleRun} disabled={!industry || loading} className="w-full">
            {loading ? "Finding Prospects..." : "Find Prospects"}
          </Button>
        </CardContent>
      </Card>

      {loading && (
        <Card><CardContent className="py-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm font-medium">{statusMsg}</p>
        </CardContent></Card>
      )}

      {error && (
        <Card className="border-destructive"><CardContent className="py-4 flex items-center justify-between">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={handleRun}>Try Again</Button>
        </CardContent></Card>
      )}

      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{result.search_summary}</p>
              <p className="text-sm font-medium mt-1">{result.total_found} prospects found · Avg fit: {(result.prospects?.reduce((a: number, p: any) => a + p.fit_score, 0) / (result.prospects?.length || 1)).toFixed(1)}/10</p>
            </div>
            <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4 mr-1" /> Export CSV</Button>
          </div>

          {result.prospects?.map((p: any, i: number) => (
            <Card key={i}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{p.company}</h3>
                    <p className="text-sm text-muted-foreground">{p.website} · {p.industry} · {p.employees} employees · {p.location}</p>
                  </div>
                  <Badge className={getScoreColor(p.fit_score)}>{p.fit_score}/10</Badge>
                </div>
                <p className="text-sm mb-2">{p.description}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  <Badge variant="outline">{p.funding_stage}</Badge>
                  {p.buying_signals?.map((s: string, j: number) => (
                    <Badge key={j} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                </div>
                {p.decision_maker && (
                  <p className="text-sm text-muted-foreground mb-2">
                    👤 {p.decision_maker.name} — {p.decision_maker.title}
                  </p>
                )}
                {p.outreach_email && (
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm"><Mail className="h-4 w-4 mr-1" /> View Email <ChevronDown className="h-3 w-3 ml-1" /></Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 p-3 bg-muted rounded-md">
                      <p className="font-medium text-sm mb-1">Subject: {p.outreach_email.subject}</p>
                      <p className="text-sm whitespace-pre-line">{p.outreach_email.body}</p>
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => copyEmail(p.outreach_email)}>
                        <Copy className="h-3 w-3 mr-1" /> Copy Email
                      </Button>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </CardContent>
            </Card>
          ))}

          {result.market_insights && (
            <Card>
              <CardHeader><CardTitle className="text-base">Market Insights</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {result.market_insights.map((ins: string, i: number) => (
                    <li key={i} className="text-sm">• {ins}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
