import { useState, useCallback } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { executeAgentTask, saveTask, completeTask, failTask } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Upload, TrendingUp, TrendingDown, Minus, Download, BarChart3, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const STATUS_MESSAGES = [
  "Parsing dataset...",
  "Running statistical analysis...",
  "Identifying trends...",
  "Detecting anomalies...",
  "Writing insights...",
];

const CHART_COLORS = ["#3B8BD4", "#1D9E75", "#D85A30", "#7F77DD", "#E4A853", "#C74375"];

interface DataAnalystProps {
  agentId: string;
}

export function DataAnalystAgent({ agentId }: DataAnalystProps) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith(".csv") || f.name.endsWith(".xlsx") || f.name.endsWith(".xls"))) {
      setFile(f);
      setError("");
    } else {
      setError("Please upload a .csv or .xlsx file");
    }
  }, []);

  const parseFile = async (f: File): Promise<{ columns: string[]; rows: any[]; totalRows: number }> => {
    if (f.name.endsWith(".csv")) {
      return new Promise((resolve, reject) => {
        Papa.parse(f, {
          header: true,
          complete: (results) => {
            resolve({ columns: results.meta.fields || [], rows: results.data as any[], totalRows: results.data.length });
          },
          error: reject,
        });
      });
    } else {
      const buffer = await f.arrayBuffer();
      const wb = XLSX.read(buffer);
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet) as any[];
      const columns = data.length > 0 ? Object.keys(data[0]) : [];
      return { columns, rows: data, totalRows: data.length };
    }
  };

  const computeStats = (columns: string[], rows: any[]) => {
    const stats: Record<string, any> = {};
    for (const col of columns) {
      const nums = rows.map((r) => parseFloat(r[col])).filter((n) => !isNaN(n));
      if (nums.length > rows.length * 0.5) {
        const sum = nums.reduce((a, b) => a + b, 0);
        stats[col] = {
          type: "numeric",
          min: Math.min(...nums),
          max: Math.max(...nums),
          mean: +(sum / nums.length).toFixed(2),
          count: nums.length,
        };
      } else {
        stats[col] = { type: "categorical", uniqueValues: [...new Set(rows.map((r) => r[col]))].slice(0, 20).length };
      }
    }
    return stats;
  };

  const handleRun = async () => {
    if (!file || !user) return;
    setLoading(true);
    setError("");
    setResult(null);

    let msgIndex = 0;
    const interval = setInterval(() => {
      setStatusMsg(STATUS_MESSAGES[msgIndex % STATUS_MESSAGES.length]);
      msgIndex++;
    }, 2000);

    let taskId: string | null = null;
    try {
      const { columns, rows, totalRows } = await parseFile(file);
      const sampleRows = rows.slice(0, 50);
      const columnStats = computeStats(columns, rows);

      const task = await saveTask(user.id, agentId, { filename: file.name, question });
      taskId = task.id;

      const userMessage = `Dataset: ${file.name}\nTotal rows: ${totalRows}\nColumns: ${columns.join(", ")}\nData sample (first 50 rows): ${JSON.stringify(sampleRows)}\nColumn statistics: ${JSON.stringify(columnStats)}\nUser question: ${question || "Provide a comprehensive analysis"}\n\nAnalyze this data and return the JSON report.`;

      const res = await executeAgentTask("data-analyst", userMessage);
      setResult(res);
      await completeTask(taskId, "data-analysis", res);
    } catch (e: any) {
      setError(e.message || "Analysis failed");
      if (taskId) await failTask(taskId);
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      clearInterval(interval);
      setLoading(false);
      setStatusMsg("");
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analysis-report.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderChart = (chart: any) => {
    if (!chart) return null;
    const chartData = chart.labels.map((label: string, i: number) => {
      const point: any = { name: label };
      chart.datasets.forEach((ds: any) => {
        point[ds.label] = ds.data[i];
      });
      return point;
    });

    if (chart.type === "bar") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Legend />
            {chart.datasets.map((ds: any, i: number) => (
              <Bar key={ds.label} dataKey={ds.label} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    }
    if (chart.type === "line") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Legend />
            {chart.datasets.map((ds: any, i: number) => (
              <Line key={ds.label} dataKey={ds.label} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    }
    if (chart.type === "pie") {
      const pieData = chart.labels.map((label: string, i: number) => ({
        name: label,
        value: chart.datasets[0]?.data[i] || 0,
      }));
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
              {pieData.map((_: any, i: number) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }
    return null;
  };

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-emerald-600" />;
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Data Analysis</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div
            onDrop={handleFileDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            {file ? (
              <p className="text-sm font-medium">{file.name}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Drop a CSV or Excel file here, or click to browse</p>
            )}
            <input
              id="file-input"
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); }}
            />
          </div>
          <div className="space-y-2">
            <Label>What do you want to analyze? (optional)</Label>
            <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g., Show me sales trends by region" />
          </div>
          <Button onClick={handleRun} disabled={!file || loading} className="w-full">
            {loading ? "Running Analysis..." : "Run Analysis"}
          </Button>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-sm font-medium">{statusMsg}</p>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="py-4 flex items-center justify-between">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={handleRun}>Try Again</Button>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{result.title}</h2>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" /> Download Report
            </Button>
          </div>
          <p className="text-muted-foreground">{result.summary}</p>

          {/* Metrics */}
          {result.key_metrics && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {result.key_metrics.map((m: any, i: number) => (
                <Card key={i}>
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{m.label}</span>
                      <TrendIcon trend={m.trend} />
                    </div>
                    <p className="text-2xl font-bold">{m.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{m.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Insights */}
          {result.insights && (
            <div className="space-y-2">
              <h3 className="font-semibold">Insights</h3>
              {result.insights.map((ins: any, i: number) => (
                <Card key={i} className={ins.severity === "positive" ? "border-emerald-200 bg-emerald-50" : ins.severity === "warning" ? "border-amber-200 bg-amber-50" : ""}>
                  <CardContent className="py-3 flex items-start gap-2">
                    {ins.severity === "positive" ? <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" /> :
                      ins.severity === "warning" ? <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" /> :
                        <Info className="h-5 w-5 text-muted-foreground shrink-0" />}
                    <div>
                      <p className="font-medium text-sm">{ins.title}</p>
                      <p className="text-sm text-muted-foreground">{ins.detail}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Chart */}
          {result.chart && (
            <Card>
              <CardHeader><CardTitle className="text-base">{result.chart.title}</CardTitle></CardHeader>
              <CardContent>{renderChart(result.chart)}</CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {result.recommendations && (
            <Card>
              <CardHeader><CardTitle className="text-base">Recommendations</CardTitle></CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-1">
                  {result.recommendations.map((r: string, i: number) => (
                    <li key={i} className="text-sm">{r}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          {/* Data Quality */}
          {result.data_quality && (
            <Card>
              <CardHeader><CardTitle className="text-base">Data Quality</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-3">
                  <Progress value={result.data_quality.score} className="flex-1" />
                  <span className="text-sm font-medium">{result.data_quality.score}/100</span>
                </div>
                {result.data_quality.issues?.length > 0 && (
                  <ul className="space-y-1">
                    {result.data_quality.issues.map((issue: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground">• {issue}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
