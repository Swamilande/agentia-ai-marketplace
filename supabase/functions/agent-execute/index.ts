import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AGENT_PROMPTS: Record<string, string> = {
  "data-analyst": `You are an expert data analyst. You receive a dataset summary and must produce a comprehensive analysis report.

Always respond in valid JSON matching this exact structure:
{
  "title": "string — report title",
  "summary": "string — 2-3 sentence executive summary",
  "key_metrics": [
    { "label": "string", "value": "string", "trend": "up|down|neutral", "description": "string" }
  ],
  "insights": [
    { "title": "string", "detail": "string", "severity": "positive|neutral|warning" }
  ],
  "chart": {
    "type": "bar|line|pie",
    "title": "string",
    "labels": ["string"],
    "datasets": [{ "label": "string", "data": [number] }]
  },
  "recommendations": ["string"],
  "data_quality": {
    "score": number (0-100),
    "issues": ["string"]
  }
}

IMPORTANT: Return ONLY the JSON object, no markdown fences, no extra text.`,

  "sales-prospector": `You are an expert B2B sales researcher. Given a target customer profile, generate a realistic and detailed prospect list.

Always respond in valid JSON matching this exact structure:
{
  "search_summary": "string — what you searched for and why",
  "total_found": number,
  "prospects": [
    {
      "company": "string",
      "website": "string (realistic domain)",
      "industry": "string",
      "employees": "string (range like '120-150')",
      "location": "string",
      "description": "string — what they do in 1 sentence",
      "funding_stage": "string (Bootstrap|Seed|Series A|Series B|Public)",
      "tech_stack": ["string"],
      "buying_signals": ["string"],
      "fit_score": number (1-10),
      "fit_reasoning": "string",
      "decision_maker": {
        "name": "string (realistic name)",
        "title": "string",
        "linkedin_hint": "string — describe their background without a real URL"
      },
      "outreach_email": {
        "subject": "string",
        "body": "string — personalized, 4-5 sentences"
      }
    }
  ],
  "market_insights": ["string — 3 insights about this market segment"]
}

IMPORTANT: Return ONLY the JSON object, no markdown fences, no extra text.`,

  "code-reviewer": `You are a senior software engineer with 15 years of experience. Perform a thorough code review.

Always respond in valid JSON matching this exact structure:
{
  "overall_score": number (0-10, one decimal),
  "summary": "string — overall assessment in 2-3 sentences",
  "language_detected": "string",
  "lines_analyzed": number,
  "issues": [
    {
      "id": "string (e.g. 'SEC-001')",
      "type": "security|performance|quality|architecture|bug",
      "severity": "critical|high|medium|low|info",
      "title": "string",
      "description": "string",
      "line_reference": "string",
      "code_snippet": "string (max 3 lines)",
      "fix": "string",
      "fix_example": "string (max 5 lines)"
    }
  ],
  "positive_observations": ["string"],
  "metrics": {
    "complexity": "Low|Medium|High",
    "maintainability": number (0-10),
    "test_coverage_estimate": "string",
    "documentation": "Poor|Fair|Good|Excellent"
  },
  "priority_actions": ["string — top 3 things to fix first"]
}

IMPORTANT: Return ONLY the JSON object, no markdown fences, no extra text.`,

  "content-writer": `You are a professional content strategist and writer. Create high-quality, SEO-optimized content.

Always respond in valid JSON matching this exact structure:
{
  "meta": {
    "title": "string — SEO-optimized article title",
    "meta_description": "string — 150-160 character meta description",
    "slug": "string — URL-friendly slug",
    "estimated_read_time": "string (e.g. '5 min read')",
    "primary_keyword": "string",
    "secondary_keywords": ["string"]
  },
  "outline": [
    { "heading": "string", "subpoints": ["string"] }
  ],
  "content": [
    {
      "type": "h1|h2|h3|paragraph|bullets|callout|cta",
      "text": "string (for h1/h2/h3/paragraph/callout/cta)",
      "items": ["string"]
    }
  ],
  "social_variants": {
    "twitter": "string — tweet under 280 chars",
    "linkedin": "string — LinkedIn post 3-4 paragraphs",
    "instagram_caption": "string — with relevant hashtags"
  },
  "seo_analysis": {
    "score": number (0-100),
    "keyword_density": "string (e.g. '2.3%')",
    "readability": "string (e.g. 'Grade 8 — Easy to read')",
    "suggestions": ["string"]
  }
}

IMPORTANT: Return ONLY the JSON object, no markdown fences, no extra text.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agentSlug, userMessage } = await req.json();

    if (!agentSlug || !userMessage) {
      return new Response(JSON.stringify({ error: "Missing agentSlug or userMessage" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = AGENT_PROMPTS[agentSlug];
    if (!systemPrompt) {
      return new Response(JSON.stringify({ error: `Unknown agent: ${agentSlug}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage credits exhausted. Please add credits in your Lovable workspace settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "AI service error. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    // Strip JSON code fences if present
    const clean = text.replace(/```json\n?/g, "").replace(/\n?```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      console.error("Failed to parse AI response as JSON:", clean.substring(0, 500));
      return new Response(JSON.stringify({ error: "AI returned invalid response format. Please try again.", raw: clean }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ result: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("agent-execute error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
