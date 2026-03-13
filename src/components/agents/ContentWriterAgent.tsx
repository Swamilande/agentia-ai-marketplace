import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { executeAgentTask, saveTask, completeTask, failTask } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { PenTool, Copy, Download } from "lucide-react";

const CONTENT_TYPES = ["Blog Article", "Newsletter", "Landing Page Copy", "Social Media Posts", "Product Description"];
const TONES = ["Professional", "Conversational", "Bold & Direct", "Educational", "Inspirational"];
const AUDIENCES = ["Startup Founders", "Enterprise Teams", "Small Business Owners", "Developers", "Marketers"];
const WORD_COUNTS = [500, 800, 1200, 1500, 2000];
const STATUS_MESSAGES = ["Researching topic...", "Planning outline...", "Writing first draft...", "Optimizing for SEO...", "Polishing content..."];

interface ContentWriterProps { agentId: string; }

export function ContentWriterAgent({ agentId }: ContentWriterProps) {
  const { user } = useAuth();
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [contentType, setContentType] = useState("Blog Article");
  const [tone, setTone] = useState("Professional");
  const [audience, setAudience] = useState("Startup Founders");
  const [wordCount, setWordCount] = useState(1200);
  const [brandNotes, setBrandNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleRun = async () => {
    if (!user || !topic) return;
    setLoading(true);
    setError("");
    setResult(null);

    let msgIndex = 0;
    const interval = setInterval(() => { setStatusMsg(STATUS_MESSAGES[msgIndex % STATUS_MESSAGES.length]); msgIndex++; }, 2000);

    let taskId: string | null = null;
    try {
      const task = await saveTask(user.id, agentId, { topic, contentType, tone, wordCount });
      taskId = task.id;

      const userMessage = `Write ${contentType} content with these specifications:\nTopic: ${topic}\nKeywords: ${keywords || "None specified"}\nTone: ${tone}\nAudience: ${audience}\nWord count target: ${wordCount}\nBrand notes: ${brandNotes || "None"}\n\nReturn the complete JSON content package.`;

      const res = await executeAgentTask("content-writer", userMessage);
      setResult(res);
      await completeTask(taskId, "content-writing", res);
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

  const getPlainText = () => {
    if (!result?.content) return "";
    return result.content.map((block: any) => {
      if (block.type === "bullets") return block.items?.map((item: string) => `• ${item}`).join("\n") || "";
      return block.text || "";
    }).join("\n\n");
  };

  const copyAll = () => {
    navigator.clipboard.writeText(getPlainText());
    toast({ title: "Copied to clipboard" });
  };

  const downloadTxt = () => {
    const blob = new Blob([getPlainText()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${result?.meta?.slug || "content"}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const copySocial = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const renderContent = (blocks: any[]) => {
    return blocks.map((block: any, i: number) => {
      switch (block.type) {
        case "h1": return <h1 key={i} className="text-3xl font-bold mt-6 mb-3">{block.text}</h1>;
        case "h2": return <h2 key={i} className="text-2xl font-semibold mt-5 mb-2">{block.text}</h2>;
        case "h3": return <h3 key={i} className="text-xl font-medium mt-4 mb-2">{block.text}</h3>;
        case "paragraph": return <p key={i} className="text-sm leading-relaxed mb-3">{block.text}</p>;
        case "bullets": return (
          <ul key={i} className="list-disc list-inside space-y-1 mb-3">
            {block.items?.map((item: string, j: number) => <li key={j} className="text-sm">{item}</li>)}
          </ul>
        );
        case "callout": return (
          <blockquote key={i} className="border-l-4 border-primary/30 bg-muted pl-4 py-2 my-3 text-sm italic">{block.text}</blockquote>
        );
        case "cta": return (
          <div key={i} className="bg-primary text-primary-foreground p-4 rounded-lg text-center my-4">
            <p className="font-semibold">{block.text}</p>
          </div>
        );
        default: return <p key={i} className="text-sm">{block.text}</p>;
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><PenTool className="h-5 w-5" /> Content Writer</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Topic or title *</Label>
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., How AI is changing small business operations" />
          </div>
          <div className="space-y-2">
            <Label>Target keywords (comma-separated)</Label>
            <Textarea value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="AI, small business, automation" rows={2} />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Content type</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CONTENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Audience</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{AUDIENCES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Word count</Label>
              <Select value={wordCount.toString()} onValueChange={(v) => setWordCount(+v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{WORD_COUNTS.map((w) => <SelectItem key={w} value={w.toString()}>{w}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Brand notes (optional)</Label>
            <Input value={brandNotes} onChange={(e) => setBrandNotes(e.target.value)} placeholder="Specific terms, things to avoid..." />
          </div>
          <Button onClick={handleRun} disabled={!topic || loading} className="w-full">
            {loading ? "Writing Content..." : "Write Content"}
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
        <Card>
          <CardContent className="pt-4">
            <Tabs defaultValue="article">
              <TabsList className="mb-4">
                <TabsTrigger value="article">Article</TabsTrigger>
                <TabsTrigger value="seo">SEO & Social</TabsTrigger>
              </TabsList>

              <TabsContent value="article">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary">{result.meta?.estimated_read_time}</Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyAll}><Copy className="h-3 w-3 mr-1" /> Copy All</Button>
                    <Button variant="outline" size="sm" onClick={downloadTxt}><Download className="h-3 w-3 mr-1" /> Download .txt</Button>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none">
                  {result.content && renderContent(result.content)}
                </div>
              </TabsContent>

              <TabsContent value="seo" className="space-y-4">
                {result.meta && (
                  <Card>
                    <CardHeader><CardTitle className="text-base">Meta Tags</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Title ({result.meta.title?.length || 0} chars)</p>
                        <p className="text-sm font-medium">{result.meta.title}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Description ({result.meta.meta_description?.length || 0} chars)</p>
                        <p className="text-sm">{result.meta.meta_description}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Keywords</p>
                        <div className="flex gap-1 flex-wrap">
                          <Badge>{result.meta.primary_keyword}</Badge>
                          {result.meta.secondary_keywords?.map((kw: string, i: number) => <Badge key={i} variant="outline">{kw}</Badge>)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {result.seo_analysis && (
                  <Card>
                    <CardHeader><CardTitle className="text-base">SEO Score</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Progress value={result.seo_analysis.score} className="flex-1" />
                        <span className="text-sm font-medium">{result.seo_analysis.score}/100</span>
                      </div>
                      <p className="text-sm">Keyword density: {result.seo_analysis.keyword_density}</p>
                      <p className="text-sm">Readability: {result.seo_analysis.readability}</p>
                      {result.seo_analysis.suggestions?.map((s: string, i: number) => (
                        <p key={i} className="text-sm text-muted-foreground">• {s}</p>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {result.social_variants && (
                  <div className="space-y-3">
                    <h3 className="font-semibold">Social Media Variants</h3>
                    {[
                      { label: "Twitter", text: result.social_variants.twitter },
                      { label: "LinkedIn", text: result.social_variants.linkedin },
                      { label: "Instagram", text: result.social_variants.instagram_caption },
                    ].map((social) => social.text ? (
                      <Card key={social.label}>
                        <CardContent className="py-3">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium">{social.label}</p>
                            <Button variant="ghost" size="sm" onClick={() => copySocial(social.text)}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground whitespace-pre-line">{social.text}</p>
                        </CardContent>
                      </Card>
                    ) : null)}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
