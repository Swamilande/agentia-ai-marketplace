import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { executeAgentTask, saveTask, completeTask, failTask } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Code2, ChevronDown, CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

const LANGUAGES = ["JavaScript", "TypeScript", "Python", "Go", "Java", "PHP", "Ruby", "Rust", "C++", "Other"];
const FOCUS_AREAS = ["Security", "Performance", "Code Quality", "Architecture"];
const STATUS_MESSAGES = ["Parsing code structure...", "Scanning for vulnerabilities...", "Analyzing performance...", "Checking code quality...", "Generating review..."];

interface CodeReviewerProps { agentId: string; }

export function CodeReviewerAgent({ agentId }: CodeReviewerProps) {
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [focusAreas, setFocusAreas] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const toggleFocus = (area: string) => {
    setFocusAreas((prev) => prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]);
  };

  const handleRun = async () => {
    if (!user || !code.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    let msgIndex = 0;
    const interval = setInterval(() => { setStatusMsg(STATUS_MESSAGES[msgIndex % STATUS_MESSAGES.length]); msgIndex++; }, 2000);

    let taskId: string | null = null;
    try {
      const task = await saveTask(user.id, agentId, { language, codeLength: code.length });
      taskId = task.id;

      const areas = focusAreas.length === 0 ? ["All"] : focusAreas;
      const userMessage = `Review this ${language} code:\nFocus areas: ${areas.join(", ")}\n\n\`\`\`${language.toLowerCase()}\n${code}\n\`\`\`\n\nIdentify all issues and return the complete JSON review.`;

      const res = await executeAgentTask("code-reviewer", userMessage);
      setResult(res);
      await completeTask(taskId, "code-review", res);
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

  const getScoreColor = (score: number) => {
    if (score >= 7) return "text-emerald-600";
    if (score >= 5) return "text-amber-600";
    return "text-red-600";
  };

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      critical: "bg-red-100 text-red-700",
      high: "bg-orange-100 text-orange-700",
      medium: "bg-amber-100 text-amber-700",
      low: "bg-blue-100 text-blue-700",
      info: "bg-muted text-muted-foreground",
    };
    return colors[severity] || colors.info;
  };

  const SeverityIcon = ({ severity }: { severity: string }) => {
    if (severity === "critical") return <AlertCircle className="h-4 w-4 text-red-600" />;
    if (severity === "high") return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    return <Info className="h-4 w-4 text-muted-foreground" />;
  };

  const issueCounts = result?.issues?.reduce((acc: Record<string, number>, issue: any) => {
    acc[issue.severity] = (acc[issue.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Code2 className="h-5 w-5" /> Code Review</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here..."
            className="font-mono text-sm bg-muted min-h-[200px]"
            rows={12}
          />
          <div className="flex gap-4 items-end flex-wrap">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Focus Areas</Label>
              <div className="flex gap-3">
                {FOCUS_AREAS.map((area) => (
                  <label key={area} className="flex items-center gap-1.5 text-sm">
                    <Checkbox checked={focusAreas.includes(area)} onCheckedChange={() => toggleFocus(area)} />
                    {area}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <Button onClick={handleRun} disabled={!code.trim() || loading} className="w-full">
            {loading ? "Reviewing Code..." : "Review Code"}
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
          {/* Score banner */}
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className={`text-5xl font-bold ${getScoreColor(result.overall_score)}`}>{result.overall_score}</p>
                  <p className="text-sm text-muted-foreground">/10</p>
                </div>
                <div className="flex-1">
                  <Progress value={result.overall_score * 10} className="h-3 mb-2" />
                  <p className="text-sm">{result.summary}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Issue summary */}
          {issueCounts && (
            <div className="flex gap-2 flex-wrap">
              {["critical", "high", "medium", "low", "info"].map((sev) => issueCounts[sev] ? (
                <Badge key={sev} className={getSeverityBadge(sev)}>{issueCounts[sev]} {sev}</Badge>
              ) : null)}
            </div>
          )}

          {/* Metrics */}
          {result.metrics && (
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Complexity", value: result.metrics.complexity },
                { label: "Maintainability", value: `${result.metrics.maintainability}/10` },
                { label: "Documentation", value: result.metrics.documentation },
                { label: "Test Coverage", value: result.metrics.test_coverage_estimate },
              ].map((m, i) => (
                <Card key={i}><CardContent className="py-3 text-center">
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <p className="font-semibold text-sm">{m.value}</p>
                </CardContent></Card>
              ))}
            </div>
          )}

          {/* Issues */}
          {result.issues?.map((issue: any, i: number) => (
            <Collapsible key={i}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardContent className="py-3 cursor-pointer hover:bg-muted/50 flex items-center gap-2">
                    <SeverityIcon severity={issue.severity} />
                    <Badge className={`${getSeverityBadge(issue.severity)} text-xs`}>{issue.severity}</Badge>
                    <span className="text-xs text-muted-foreground">{issue.id}</span>
                    <span className="font-medium text-sm flex-1">{issue.title}</span>
                    <span className="text-xs text-muted-foreground">{issue.line_reference}</span>
                    <ChevronDown className="h-4 w-4" />
                  </CardContent>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 space-y-2 text-sm">
                    <p>{issue.description}</p>
                    {issue.code_snippet && <pre className="bg-muted p-2 rounded text-xs font-mono overflow-x-auto">{issue.code_snippet}</pre>}
                    <p className="font-medium">Fix: {issue.fix}</p>
                    {issue.fix_example && <pre className="bg-emerald-50 p-2 rounded text-xs font-mono overflow-x-auto">{issue.fix_example}</pre>}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}

          {/* Positive */}
          {result.positive_observations?.length > 0 && (
            <Card className="border-emerald-200 bg-emerald-50">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><CheckCircle className="h-5 w-5 text-emerald-600" /> What's Done Well</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {result.positive_observations.map((obs: string, i: number) => <li key={i} className="text-sm">✓ {obs}</li>)}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Priority actions */}
          {result.priority_actions?.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Priority Actions</CardTitle></CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-1">
                  {result.priority_actions.map((a: string, i: number) => <li key={i} className="text-sm">{a}</li>)}
                </ol>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
