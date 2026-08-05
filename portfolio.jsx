// Karthik Rasamsetti — QA Automation → AI Engineer Portfolio
// Engineering-log aesthetic: monospace + grotesk, ASCII rules, live test runner.

const { useState, useEffect, useRef, useMemo } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#3b82f6",
  "displayFont": "grotesk",
  "density": "comfortable",
  "heroVariant": "agent"
}/*EDITMODE-END*/;

// ──────────────────────────────────────────────────────────────────────
// LIVE TEST RUNNER
// ──────────────────────────────────────────────────────────────────────
const TEST_SUITE = [
  { file: "auth.spec.ts", name: "user can sign in with valid credentials", ms: 412 },
  { file: "auth.spec.ts", name: "rejects expired session tokens", ms: 287 },
  { file: "checkout.spec.ts", name: "applies promo code at cart level", ms: 631 },
  { file: "checkout.spec.ts", name: "blocks payment when address invalid", ms: 549 },
  { file: "search.spec.ts", name: "returns ranked results for typo query", ms: 384 },
  { file: "agent.spec.ts", name: "LLM agent retries on rate-limit", ms: 1247 },
  { file: "agent.spec.ts", name: "agent halts on hallucinated tool call", ms: 892 },
  { file: "perf.k6.js", name: "p95 latency under 250ms @ 1k vus", ms: 2103 },
];

function TestRunner({ accent }) {
  const [lines, setLines] = useState([]);
  const [running, setRunning] = useState(true);
  const [stats, setStats] = useState({ passed: 0, failed: 0, total: 0 });
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    if (!running) return;
    if (cursor >= TEST_SUITE.length) {
      const t = setTimeout(() => {
        setLines([]);
        setStats({ passed: 0, failed: 0, total: 0 });
        setCursor(0);
      }, 3200);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      const test = TEST_SUITE[cursor];
      const fail = cursor === 6; // one realistic flake
      setLines(L => [...L, { ...test, fail, ts: Date.now() }]);
      setStats(s => ({
        passed: s.passed + (fail ? 0 : 1),
        failed: s.failed + (fail ? 1 : 0),
        total: s.total + 1,
      }));
      setCursor(c => c + 1);
    }, 380 + Math.random() * 220);
    return () => clearTimeout(t);
  }, [cursor, running]);

  const dur = lines.reduce((a, l) => a + l.ms, 0);

  return (
    <div className="test-runner" style={{ "--accent": accent }}>
      <div className="tr-chrome">
        <div className="tr-dots"><span /><span /><span /></div>
        <div className="tr-title">playwright test --reporter=line</div>
        <div className="tr-status">
          <span className={`tr-pulse ${running ? "live" : ""}`} />
          {running ? "running" : "idle"}
        </div>
      </div>
      <div className="tr-body">
        {lines.map((l, i) => (
          <div key={i} className={`tr-line ${l.fail ? "fail" : "pass"}`}>
            <span className="tr-mark">{l.fail ? "✗" : "✓"}</span>
            <span className="tr-file">{l.file}</span>
            <span className="tr-arrow">›</span>
            <span className="tr-name">{l.name}</span>
            <span className="tr-ms">{l.ms}ms</span>
          </div>
        ))}
        {cursor < TEST_SUITE.length && (
          <div className="tr-line tr-running">
            <span className="tr-spinner">◐</span>
            <span className="tr-file">{TEST_SUITE[cursor].file}</span>
            <span className="tr-arrow">›</span>
            <span className="tr-name">{TEST_SUITE[cursor].name}</span>
          </div>
        )}
      </div>
      <div className="tr-footer">
        <div className="tr-stat"><span className="dot pass" />{stats.passed} passed</div>
        <div className="tr-stat"><span className="dot fail" />{stats.failed} failed</div>
        <div className="tr-stat"><span className="dot mute" />{stats.total}/{TEST_SUITE.length}</div>
        <div className="tr-stat tr-dur">{(dur / 1000).toFixed(2)}s</div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// AGENT LOG variant (alternative hero)
// ──────────────────────────────────────────────────────────────────────
const AGENT_STEPS = [
  { kind: "user", text: "Verify checkout flow handles invalid coupon" },
  { kind: "thought", text: "Plan: navigate → add item → apply coupon → assert error toast" },
  { kind: "tool", text: "browser.goto('/cart')", result: "200 OK · 412ms" },
  { kind: "tool", text: "browser.click('[data-test=add]')", result: "ok" },
  { kind: "tool", text: "browser.fill('#promo', 'EXPIRED')", result: "ok" },
  { kind: "tool", text: "browser.click('button[type=submit]')", result: "ok" },
  { kind: "thought", text: "Expecting role=alert with text matching /expired|invalid/i" },
  { kind: "tool", text: "browser.assert.toast(/expired/i)", result: "✓ matched" },
  { kind: "done", text: "Test PASSED · 1 of 1 scenarios green" },
];

function AgentLog({ accent }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (shown >= AGENT_STEPS.length) {
      const t = setTimeout(() => setShown(0), 3500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setShown(s => s + 1), 700);
    return () => clearTimeout(t);
  }, [shown]);

  return (
    <div className="test-runner" style={{ "--accent": accent }}>
      <div className="tr-chrome">
        <div className="tr-dots"><span /><span /><span /></div>
        <div className="tr-title">qa-agent · trace</div>
        <div className="tr-status">
          <span className="tr-pulse live" />thinking
        </div>
      </div>
      <div className="tr-body agent">
        {AGENT_STEPS.slice(0, shown).map((s, i) => (
          <div key={i} className={`agent-step ${s.kind}`}>
            <span className="agent-kind">{s.kind}</span>
            <div className="agent-body">
              <div className="agent-text">{s.text}</div>
              {s.result && <div className="agent-result">→ {s.result}</div>}
            </div>
          </div>
        ))}
      </div>
      <div className="tr-footer">
        <div className="tr-stat"><span className="dot pass" />step {shown}/{AGENT_STEPS.length}</div>
        <div className="tr-stat tr-dur">claude-sonnet · tools=3</div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// PERF GRAPH variant
// ──────────────────────────────────────────────────────────────────────
function PerfGraph({ accent }) {
  const [data, setData] = useState(() => Array.from({ length: 40 }, (_, i) => 120 + Math.sin(i / 3) * 40 + Math.random() * 30));
  useEffect(() => {
    const id = setInterval(() => {
      setData(d => [...d.slice(1), 120 + Math.sin(Date.now() / 600) * 40 + Math.random() * 40]);
    }, 180);
    return () => clearInterval(id);
  }, []);
  const max = Math.max(...data);
  const min = Math.min(...data);
  const last = data[data.length - 1];
  const p95 = [...data].sort((a, b) => a - b)[Math.floor(data.length * 0.95)];

  return (
    <div className="test-runner" style={{ "--accent": accent }}>
      <div className="tr-chrome">
        <div className="tr-dots"><span /><span /><span /></div>
        <div className="tr-title">k6 run --vus=1000 --duration=30s</div>
        <div className="tr-status"><span className="tr-pulse live" />streaming</div>
      </div>
      <div className="tr-body perf">
        <svg viewBox="0 0 400 140" preserveAspectRatio="none" className="perf-svg">
          <defs>
            <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3].map(i => <line key={i} x1="0" x2="400" y1={i * 35} y2={i * 35} stroke="rgba(255,255,255,0.05)" />)}
          <polyline
            fill="url(#pg)"
            stroke="none"
            points={`0,140 ${data.map((v, i) => `${(i / (data.length - 1)) * 400},${140 - ((v - 50) / 250) * 140}`).join(" ")} 400,140`}
          />
          <polyline
            fill="none"
            stroke={accent}
            strokeWidth="1.5"
            points={data.map((v, i) => `${(i / (data.length - 1)) * 400},${140 - ((v - 50) / 250) * 140}`).join(" ")}
          />
        </svg>
        <div className="perf-grid">
          <div><span className="perf-k">requests/s</span><span className="perf-v">{Math.round(last * 7.4).toLocaleString()}</span></div>
          <div><span className="perf-k">p50</span><span className="perf-v">{Math.round(min * 0.6)}ms</span></div>
          <div><span className="perf-k">p95</span><span className="perf-v" style={{ color: accent }}>{Math.round(p95)}ms</span></div>
          <div><span className="perf-k">errors</span><span className="perf-v">0.02%</span></div>
        </div>
      </div>
      <div className="tr-footer">
        <div className="tr-stat"><span className="dot pass" />SLO: p95 &lt; 250ms</div>
        <div className="tr-stat tr-dur">vus=1000 · iter=84,221</div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// HERO
// ──────────────────────────────────────────────────────────────────────
function Hero({ accent, variant }) {
  const widget = variant === "agent" ? <AgentLog accent={accent} />
    : variant === "perf" ? <PerfGraph accent={accent} />
      : <TestRunner accent={accent} />;
  return (
    <section className="hero">
      <div className="hero-grid">
        <div className="hero-left">
          <div className="hero-avatar">
            <img src="./me.png" alt="Karthik Rasamsetti" />
            <span className="hero-avatar-ring" style={{ borderColor: accent }} />
          </div>
          <div className="meta-row">
            <span className="meta-dot" style={{ background: accent }} />
            <span className="meta-text">QA · Automation · {new Date().getFullYear()}</span>
            <span className="meta-sep">/</span>
            <span className="meta-text">available for AI engineering roles</span>
          </div>
          <h1 className="hero-h">
            <span className="muted">Hi, I'm</span> Karthik Rasamsetti
            <span className="muted"> — building </span>
            <span className="hero-em">intelligent testing systems</span>
            <span className="muted"> at the seam of </span>
            <span className="hero-em" style={{ color: accent }}>QA &amp; AI</span>.
          </h1>
          <p className="hero-sub">
            3+ years writing automation that catches what humans miss. Now teaching agents
            to do the same — Playwright, k6, and a growing stack of LLM tooling.
          </p>
          <div className="cta-row">
            <a className="btn primary" href="#projects" style={{ "--accent": accent }}>
              <span>view projects</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8m0 0L7 3m4 4L7 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
            <a className="btn ghost" href="./Resume.html" target="_blank" rel="noreferrer">
              view resume ↗
            </a>
            <a className="btn ghost" href="#contact">contact</a>
          </div>
          <div className="hero-stats">
            <div><strong>3+</strong><span>years QA automation</span></div>
            <div><strong>40k+</strong><span>tests authored / shipped</span></div>
            <div><strong>~70%</strong><span>manual regression cut</span></div>
            <div><strong>1k vus</strong><span>k6 perf suites</span></div>
          </div>
        </div>
        <div className="hero-right">
          {widget}
          <div className="ascii-rule">└─── live · streams a fresh suite every few seconds ───┘</div>
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────
// SECTION HEADER
// ──────────────────────────────────────────────────────────────────────
function SectionHeader({ idx, title, kicker, id }) {
  return (
    <header className="section-h" id={id}>
      <div className="section-num">§{String(idx).padStart(2, "0")}</div>
      <div>
        <div className="section-kicker">{kicker}</div>
        <h2 className="section-title">{title}</h2>
      </div>
      <div className="section-rule" />
    </header>
  );
}

// ──────────────────────────────────────────────────────────────────────
// ABOUT
// ──────────────────────────────────────────────────────────────────────
function About() {
  return (
    <section className="section about">
      <SectionHeader idx={1} kicker="who" title="About" id="about" />
      <div className="about-grid">
        <div className="about-prose">
          <p className="lead">
            I'm a QA automation engineer who got tired of writing the same selectors over and over —
            so I started looking at what comes next. <em>Agents that read the UI like a person does.
              LLMs that draft test cases from a PR diff. Self-healing locators.</em>
          </p>
          <p>
            For three years I've built end-to-end frameworks in Playwright, Selenium, and WebdriverIO,
            wired them into Jenkins pipelines, and pushed services through k6 until they tell us where
            they break. The work I'm proudest of isn't a passing suite — it's the one that surfaced
            a race condition production had been hiding for six months.
          </p>
          <p>
            Now I'm spending nights on <span className="hl">LangGraph</span>, <span className="hl">RAG pipelines</span>,
            and what it takes to make an LLM a reliable teammate. The next decade of testing
            looks different. I'd like to be the one writing it.
          </p>
          <blockquote className="about-quote">
            "AI will not replace testers — but testers using AI will replace testers who don't."
          </blockquote>
        </div>
        <aside className="about-card">
          <div className="card-row"><span>location</span><strong>Hyderabad, IN</strong></div>
          <div className="card-row"><span>role</span><strong>QA Automation Engineer</strong></div>
          <div className="card-row"><span>focus</span><strong>AI-driven QA · Agentic RAG</strong></div>
          <div className="card-row"><span>stack</span><strong>Java · JS · Python · k6</strong></div>
          <div className="card-row"><span>open to</span><strong>AI Eng · SDET · QA-AI</strong></div>
          <div className="card-row last"><span>status</span><strong className="status-live">● available</strong></div>
        </aside>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────
// SKILLS
// ──────────────────────────────────────────────────────────────────────
const SKILL_GROUPS = [
  {
    label: "automation", items: [
      { name: "Playwright", level: 92 },
      { name: "Selenium", level: 88 },
      { name: "WebdriverIO", level: 80 },
      { name: "Karate DSL (API)", level: 78 },
      { name: "Cypress", level: 65 },
    ]
  },
  {
    label: "languages", items: [
      { name: "JavaScript / TypeScript", level: 90 },
      { name: "Java", level: 85 },
      { name: "Python", level: 72 },
      { name: "SQL", level: 70 },
    ]
  },
  {
    label: "performance", items: [
      { name: "k6", level: 86 },
      { name: "JMeter", level: 65 },
      { name: "WebLoad", level: 60 },
    ]
  },
  {
    label: "devops", items: [
      { name: "Jenkins", level: 84 },
      { name: "GitHub Actions", level: 78 },
      { name: "Docker", level: 70 },
      { name: "Allure / reporting", level: 75 },
      { name: "CircleCI", level: 60 },
    ]
  },
  {
    label: "ai · building", items: [
      { name: "LLMs (OpenAI, Claude, Groq)", level: 74 },
      { name: "LangGraph / multi-agent", level: 70 },
      { name: "RAG pipelines", level: 68 },
      { name: "LLM eval (DeepEval/RAGAS)", level: 66 },
      { name: "Prompt engineering", level: 72 },
    ]
  },
];

function Skills({ accent }) {
  return (
    <section className="section">
      <SectionHeader idx={2} kicker="what" title="Skills" id="skills" />
      <div className="skills-grid">
        {SKILL_GROUPS.map(g => (
          <div key={g.label} className="skill-col">
            <div className="skill-col-h">
              <span className="skill-col-label">{g.label}</span>
              <span className="skill-col-rule" />
            </div>
            {g.items.map(s => (
              <div key={s.name} className="skill-row">
                <div className="skill-name">{s.name}</div>
                <div className="skill-bar">
                  <div className="skill-fill" style={{ width: `${s.level}%`, background: accent }} />
                  <div className="skill-bar-ticks">
                    {Array.from({ length: 20 }).map((_, i) => <span key={i} />)}
                  </div>
                </div>
                <div className="skill-pct">{s.level}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────
// PROJECTS (GitHub-style cards, mocked)
// ──────────────────────────────────────────────────────────────────────
const PROJECTS = [
  {
    name: "mediclear",
    desc: "A bilingual health companion that reads a photo or PDF of a prescription or lab report and explains it in plain English, Telugu, and Hindi — with read-aloud, medication reminders, water tracking, and lab-value trend charts. Built so family members who don't read English can understand their own health. Safety-first by design: it explains and organizes, flags anything it reads with low confidence, and never diagnoses or gives personal medical advice — every result routes back to a doctor. A swappable multi-provider AI vision layer (Gemini / Claude / OpenAI) sits behind a factory pattern, with per-user accounts, history, and result caching.",
    tech: ["React", "FastAPI", "PostgreSQL", "Gemini", "Claude", "OpenAI", "JWT", "Vercel", "Render"],
    tags: ["ai"],
    stars: 0, forks: 0, lang: "Python", langColor: "#3572a5",
    impact: "a medical document → a calm, plain-language explanation your parents can read or hear in their own language — full-stack and deployed",
    url: "https://github.com/karthikrasamsetti/mediclear",
    demo: "https://mediclear-mu.vercel.app",
    pinned: true,
    fresh: true,
  },
  {
    name: "qa-engine",
    desc: "Intelligent QA Engine — an 11-agent LangGraph platform that turns a plain-English user story into a verified, executed browser test. It validates the story (INVEST), plans steps, maps real DOM elements on the live page, writes a Playwright script, has a Critic review-and-fix it, runs it in an isolated Docker sandbox, self-heals broken selectors, and produces a stakeholder report — streaming its reasoning live to a three-panel dashboard.",
    tech: ["Python", "LangGraph", "OpenAI", "Anthropic", "Playwright", "Docker", "FastAPI", "ChromaDB"],
    tags: ["ai", "automation"],
    stars: 0, forks: 0, lang: "Python", langColor: "#3572a5",
    impact: "user story → validated, executed browser test with a pass/bug/flaky verdict — end to end, human-in-the-loop only when the story is too vague",
    url: "https://github.com/karthikrasamsetti/qa-engine",
    pinned: true,
    fresh: true,
  },
  {
    name: "diagnostician",
    desc: "A read-only AI agent that triages CI/CD test failures. Given a failed test's error, logs, retry outcome, commit diff, and run context, it classifies the root cause into one of four categories (application_bug / broken_test / flaky / environment_issue), assigns a confidence score, recommends a next action, and explains its reasoning from the evidence. Decision rules encode how an experienced QA engineer separates causes that share the same symptom.",
    tech: ["Python", "LangGraph", "Anthropic", "OpenAI", "FastAPI", "pytest"],
    tags: ["ai", "automation"],
    stars: 0, forks: 0, lang: "Python", langColor: "#3572a5",
    impact: "first-pass diagnosis of nightly red tests so engineers only make the final call — never edits code or files tickets",
    url: "https://github.com/karthikrasamsetti/diagnostician",
    pinned: true,
    fresh: true,
  },
  {
    name: "ai-sql-assistant",
    desc: "Ask questions in plain English, get SQL and answers. Reads your database schema, generates a SQLite query with an LLM (Qwen2.5-Coder-7B via Hugging Face Inference API), validates it read-only, executes it, and returns the results as a table. Schema-aware prompting keeps the model to columns that exist; a safety gate runs only SELECT and rejects writes/DDL/injection chains.",
    tech: ["Python", "Hugging Face", "Gradio", "SQLite", "pytest"],
    tags: ["ai"],
    stars: 0, forks: 0, lang: "Python", langColor: "#3572a5",
    impact: "natural language → validated read-only SQL with a safety gate; 9 unit tests on SQL cleaning, safety, and the data layer",
    url: "https://github.com/karthikrasamsetti/ai-sql-assistant",
    fresh: true,
  },
  {
    name: "karate-api-framework",
    desc: "Production-grade API automation framework built with Karate DSL — REST and SOAP testing, data-driven runs (JSON/CSV/inline tables), JDBC DB validation, parallel execution, multi-environment config, tag-based runs (@smoke/@regression/@sanity), and full CI/CD with a Jenkins pipeline and GitHub Actions.",
    tech: ["Java", "Karate DSL", "Maven", "JUnit 5", "Jenkins", "GitHub Actions"],
    tags: ["automation"],
    stars: 0, forks: 0, lang: "Gherkin", langColor: "#5b2f91",
    impact: "one framework covering REST + SOAP + DB validation with smoke-on-push and scheduled regression",
    url: "https://github.com/karthikrasamsetti/karate-api-framework",
  },
  {
    name: "test-forge",
    desc: "AI-powered test script generator — a 6-agent pipeline (Reader → Planner → Auth → Crawler → Generator → Validator) that converts manual test cases from CSV/Excel/Word/PDF into production-ready Playwright scripts by crawling the live app for real DOM selectors.",
    tech: ["Python", "LangChain", "OpenAI", "Anthropic", "Playwright", "FastAPI", "Streamlit"],
    tags: ["ai", "automation"],
    stars: 0, forks: 0, lang: "Python", langColor: "#3572a5",
    impact: "manual test case → Playwright script in minutes, not hours",
    url: "https://github.com/karthikrasamsetti/test-forge",
    pinned: true,
    fresh: true,
  },
  {
    name: "rag-eval-platform",

    desc: "Production-grade RAG evaluation platform that benchmarks retrieval-augmented generation systems using RAGAS, G-Eval, and DeepEval in a unified pipeline. Supports document ingestion (PDF/URL/Text), ChromaDB retrieval, LLM generation, and automated evaluation with a single API call. Includes LangSmith tracing, Factory-pattern LLM abstraction, FastAPI backend, and Streamlit dashboard with live eval metrics.",

    tech: ["Python", "LangChain", "OpenAI", "Anthropic", "ChromaDB", "RAGAS", "DeepEval", "LangSmith", "FastAPI", "Streamlit"],

    tags: ["ai", "rag", "evaluation", "llm"],

    stars: 1,
    forks: 0,
    lang: "Python",
    langColor: "#3572a5",

    impact: "diagnosed retrieval precision drop (1.0 → 0.75) and hallucination spike (0.0 → 0.25) using multi-framework eval — fixed via chunk tuning + prompt grounding, improving reliability on mixed-document queries",

    url: "https://github.com/karthikrasamsetti/rag-eval-platform",

    pinned: true,
    fresh: true,
  },
  {
    name: "playwright_UTAF",
    desc: "Universal Test Automation Framework — Page Object Model with parallel sharding, Allure reporting, Docker support, Grafana dashboards for test metrics, and CI/CD across GitHub Actions, Azure Pipelines, and Jenkins.",
    tech: ["JavaScript", "Playwright", "Docker", "Jenkins", "GitHub Actions", "Grafana"],
    tags: ["automation"],
    stars: 2, forks: 0, lang: "JavaScript", langColor: "#f1e05a",
    impact: "multi-platform CI with real-time test dashboards",
    url: "https://github.com/karthikrasamsetti/playwright_UTAF",
    pinned: true,
  },
  {
    name: "k6_premotheus_grafana",
    desc: "Performance observability stack — k6 load tests feed metrics into Prometheus, visualised live in Grafana dashboards. Docker-compose spins the full stack locally; Playwright scripts drive the app under load.",
    tech: ["k6", "Prometheus", "Grafana", "Docker", "JavaScript"],
    tags: ["performance"],
    stars: 0, forks: 0, lang: "JavaScript", langColor: "#f1e05a",
    impact: "full perf pipeline: load → metrics → dashboard in one compose up",
    url: "https://github.com/karthikrasamsetti/k6_premotheus_grafana",
    pinned: true,
  },
  {
    name: "langgraph-framework",
    desc: "Production-ready LangGraph agent framework with multi-provider LLM support (OpenAI, Anthropic, Bedrock, Groq, Ollama), RAG over PDFs/URLs, LangSmith observability, FastAPI + Streamlit interfaces, and flexible session persistence (SQLite / PostgreSQL).",
    tech: ["Python", "LangGraph", "FastAPI", "ChromaDB", "Streamlit"],
    tags: ["ai"],
    stars: 1, forks: 0, lang: "Python", langColor: "#3572a5",
    impact: "swap LLM providers without touching agent logic",
    url: "https://github.com/karthikrasamsetti/langgraph-framework",
    pinned: true,
  },
  {
    name: "scam-analyzer",
    desc: "AI scam detection system with a built-in evaluation layer — GPT-4o mini classifies SMS/email/WhatsApp messages as scam or safe, while DeepEval runs hallucination, relevancy, and confidence calibration checks on every response. Includes LangSmith tracing, a Factory-pattern LLM abstraction, FastAPI + Streamlit UI with live eval scores.",
    tech: ["Python", "LangChain", "OpenAI", "DeepEval", "LangSmith", "FastAPI", "Streamlit"],
    tags: ["ai", "automation"],
    stars: 0, forks: 0, lang: "Python", langColor: "#3572a5",
    impact: "found & fixed a hallucination failure via eval loop — prompt v1 → v2 improved from 90% to 100%",
    url: "https://github.com/karthikrasamsetti/scam-analyzer",
    pinned: true,
    fresh: true,
  },
  {
    name: "OrangeHrmSelenium",
    desc: "Selenium + TestNG + Maven automation suite for OrangeHRM — Excel-driven data management, structured Allure-style reporting, TestNG parallel execution, and clean Page Object separation.",
    tech: ["Java", "Selenium", "TestNG", "Maven"],
    tags: ["automation"],
    stars: 1, forks: 1, lang: "Java", langColor: "#b07219",
    impact: "data-driven HRM regression coverage",
    url: "https://github.com/karthikrasamsetti/OrangeHrmSelenium",
  },
  {
    name: "langchain-practice",
    desc: "Hands-on LangChain experiments — chains, agents, prompt templates, retrieval patterns, memory, and tool-use. A living reference for building production LLM-powered applications.",
    tech: ["Python", "LangChain", "OpenAI"],
    tags: ["ai"],
    stars: 0, forks: 0, lang: "Python", langColor: "#3572a5",
    impact: "LLM patterns catalogue for rapid prototyping",
    url: "https://github.com/karthikrasamsetti/langchain-practice",
  },
  {
    name: "spring-security-jwt",
    desc: "Spring Security with JWT authentication — stateless REST API with token generation, validation, and role-based access control. Clean reference for securing Java backends that serve automation tooling.",
    tech: ["Java", "Spring Security", "JWT", "REST"],
    tags: ["automation"],
    stars: 1, forks: 0, lang: "Java", langColor: "#b07219",
    impact: "secure backend foundation for test environments",
    url: "https://github.com/karthikrasamsetti/spring-security-jwt",
  },
];

const FILTERS = [
  { key: "all", label: "all" },
  { key: "automation", label: "automation" },
  { key: "performance", label: "performance" },
  { key: "ai", label: "ai" },
];

function Projects({ accent }) {
  const [filter, setFilter] = useState("all");
  const visible = filter === "all" ? PROJECTS : PROJECTS.filter(p => p.tags.includes(filter));

  return (
    <section className="section">
      <SectionHeader idx={3} kicker="builds" title="Projects" id="projects" />
      <div className="proj-toolbar">
        <div className="proj-filters">
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`chip ${filter === f.key ? "active" : ""}`}
              onClick={() => setFilter(f.key)}
              style={filter === f.key ? { "--accent": accent } : {}}
            >
              {f.label}
              <span className="chip-count">
                {f.key === "all" ? PROJECTS.length : PROJECTS.filter(p => p.tags.includes(f.key)).length}
              </span>
            </button>
          ))}
        </div>
        <a className="proj-gh-link" href="https://github.com/karthikrasamsetti" target="_blank" rel="noreferrer">
          github.com/karthikrasamsetti ↗
        </a>
      </div>
      <div className="proj-grid">
        {visible.map(p => (
          <article key={p.name} className={`proj-card ${p.pinned ? "pinned" : ""}`}>
            <div className="proj-head">
              <div className="proj-name">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z" /></svg>
                <a href={p.url} target="_blank" rel="noreferrer">{p.name}</a>
                {p.demo && <a className="proj-demo-link" href={p.demo} target="_blank" rel="noreferrer" style={{ color: accent }}>live ↗</a>}
                {p.pinned && <span className="badge pinned-badge">pinned</span>}
                {p.fresh && <span className="badge fresh-badge" style={{ color: accent, borderColor: accent }}>new</span>}
              </div>
              <div className="proj-meta">
                <span className="ghm">★ {p.stars}</span>
                <span className="ghm">⑂ {p.forks}</span>
              </div>
            </div>
            <p className="proj-desc">{p.desc}</p>
            <div className="proj-impact">
              <span className="impact-label">impact</span>
              <span className="impact-val">{p.impact}</span>
            </div>
            <div className="proj-foot">
              <div className="proj-lang">
                <span className="lang-dot" style={{ background: p.langColor }} />
                <span>{p.lang}</span>
              </div>
              <div className="proj-tech">
                {p.tech.map(t => <span key={t} className="tech-pill">{t}</span>)}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────
// AI JOURNEY TIMELINE
// ──────────────────────────────────────────────────────────────────────
const TIMELINE = [
  {
    when: "2024 · Q3", title: "Started taking LLMs seriously",
    body: "Stopped seeing them as autocomplete, started seeing them as test partners. Read the OpenAI cookbook end to end. Built a prompt that drafted Playwright assertions from screenshots."
  },
  {
    when: "2024 · Q4", title: "First agent that did real work",
    body: "A Claude-tool-use loop that could open a URL, click a flow, and write a test for it. Janky, slow, glorious. Convinced me this is the path."
  },
  {
    when: "2025 · Q1", title: "RAG over the bug DB",
    body: "Indexed three years of Jira + spec docs. Now I can ask 'has anyone seen this stack trace before?' and get an answer with citations. Saved a sprint."
  },
  {
    when: "2025 · Q2", title: "LangGraph for test orchestration",
    body: "Moved from single-shot prompts to stateful graphs. Plan → execute → reflect → retry. Currently the most reliable test-author I've worked with."
  },
  {
    when: "2025 · Q3", title: "Shipped a full multi-agent QA engine",
    body: "qa-engine: 11 agents from story validation to a Docker-sandboxed run and a self-healing loop, streaming their reasoning live. Also built diagnostician, a read-only agent that triages nightly CI failures into bug / broken-test / flaky / env."
  },
  {
    when: "now", title: "Self-healing locators + intent-based tests",
    body: "Making agents cheaper and more trustworthy — model routing + cost tracking across OpenAI/Claude/Groq, evals on every verdict, and describing a test in English so it survives UI rewrites. Open-sourcing pieces as they harden.", current: true
  },
];

function Journey({ accent }) {
  return (
    <section className="section journey">
      <SectionHeader idx={4} kicker="trajectory" title="AI Journey" id="ai" />
      <div className="tl">
        <div className="tl-axis" style={{ background: `linear-gradient(180deg, transparent, ${accent}55, transparent)` }} />
        {TIMELINE.map((t, i) => (
          <div key={i} className={`tl-row ${t.current ? "current" : ""}`}>
            <div className="tl-when">{t.when}</div>
            <div className="tl-node">
              <span className="tl-dot" style={{ background: t.current ? accent : "#444" }} />
              {t.current && <span className="tl-pulse" style={{ background: accent }} />}
            </div>
            <div className="tl-card">
              <h4>{t.title}{t.current && <span className="now-tag" style={{ color: accent, borderColor: accent }}>now</span>}</h4>
              <p>{t.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────
// NOW / CURRENTLY LEARNING
// ──────────────────────────────────────────────────────────────────────
function Now({ accent }) {
  const items = [
    { tag: "building", text: "qa-engine — 11-agent LangGraph pipeline: story → executed, self-healing browser test" },
    { tag: "shipping", text: "diagnostician — read-only agent that triages CI failures into bug / broken-test / flaky / env" },
    { tag: "tinkering", text: "multi-model compare tool — OpenAI vs Claude vs Groq with live token + cost tracking" },
    { tag: "studying", text: "LangGraph persistence + model routing across providers" },
    { tag: "reading", text: "“Building Effective Agents” — Anthropic" },
  ];
  return (
    <section className="section now">
      <SectionHeader idx={5} kicker="this week" title="Now" id="now" />
      <div className="now-card">
        <div className="now-head">
          <span className="now-dot" style={{ background: accent }} />
          <span>last updated · {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          <span className="now-loc">· from Hyderabad</span>
        </div>
        <ul className="now-list">
          {items.map((it, i) => (
            <li key={i}>
              <span className="now-tag-l" style={{ color: accent }}>{it.tag}</span>
              <span>{it.text}</span>
            </li>
          ))}
        </ul>
        <div className="now-foot">
          inspired by <a href="https://nownownow.com" target="_blank" rel="noreferrer">nownownow.com</a> · what I'm focused on right now, not a résumé summary
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────
// EXPERIENCE
// ──────────────────────────────────────────────────────────────────────
const EXPERIENCE = [
  {
    role: "Performance & QA Automation Engineer",
    company: "OnTrac · Logistics & Transportation",
    span: "2024 — Present",
    bullets: [
      "Designed and executed performance testing strategy with k6, holding system stability through peak holiday traffic spikes (~3× normal load).",
      "Migrated legacy WebLOAD load-testing scripts to k6, cutting execution time by ~40% and unlocking parallel cloud runs.",
      "Built end-to-end pytest framework covering UI flows + database validation across 4 service modules.",
      "Integrated automation pipelines into Azure DevOps for continuous testing on every PR — reduced manual regression effort by ~60%.",
    ]
  },
  {
    role: "QA Automation Engineer",
    company: "LeaseLock · FinTech / Insurance",
    span: "2023 — 2024",
    bullets: [
      "Designed and implemented UTAF (Unified Test Automation Framework) standardising UI, API, and DB testing across teams — adopted by 3 squads.",
      "Built reusable, modular components covering end-to-end policy and underwriting workflows.",
      "Wired automation suites into CircleCI with automated email reporting on failures and nightly summaries.",
      "Lifted test coverage by ~50% and reduced flaky failures through framework reuse and stable selector patterns.",
    ]
  },
  {
    role: "QA Automation Engineer",
    company: "Encore · Event Management",
    span: "2022 — 2023",
    bullets: [
      "Developed and maintained BDD automation scripts in Cucumber for event-management workflows (hotels, infrastructure, services).",
      "Authored cross-browser test suites running on Chrome, Firefox, Safari, and Edge in parallel.",
      "Collaborated in Agile ceremonies and partnered with devs on shift-left QA practices.",
    ]
  },
];

function Experience() {
  return (
    <section className="section">
      <SectionHeader idx={6} kicker="track record" title="Experience" id="experience" />
      <div className="exp-list">
        {EXPERIENCE.map((e, i) => (
          <div key={i} className="exp-row">
            <div className="exp-span">{e.span}</div>
            <div className="exp-body">
              <h4>{e.role} <span className="exp-co">· {e.company}</span></h4>
              <ul>
                {e.bullets.map((b, j) => <li key={j}>{b}</li>)}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────
// CONTACT
// ──────────────────────────────────────────────────────────────────────
function Contact({ accent }) {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", msg: "" });

  return (
    <section className="section contact">
      <SectionHeader idx={7} kicker="get in touch" title="Contact" id="contact" />
      <div className="contact-grid">
        <div className="contact-prose">
          <h3>Have an interesting QA-meets-AI problem?</h3>
          <p>
            I'm most useful where automation meets reasoning — agent-driven testing,
            self-healing suites, eval pipelines for LLM features. Drop a note.
          </p>
          <div className="contact-links">
            <a href="mailto:karthikrasamsetti@gmail.com" className="cl">
              <span className="cl-k">email</span>
              <span className="cl-v">karthikrasamsetti@gmail.com</span>
            </a>
            <a href="https://github.com/karthikrasamsetti" target="_blank" rel="noreferrer" className="cl">
              <span className="cl-k">github</span>
              <span className="cl-v">@karthikrasamsetti</span>
            </a>
            <a href="https://www.linkedin.com/in/karthik-rasamsetti-29450319b" target="_blank" rel="noreferrer" className="cl">
              <span className="cl-k">linkedin</span>
              <span className="cl-v">/in/karthikrasamsetti</span>
            </a>
            <a href="./Resume.html" target="_blank" rel="noreferrer" className="cl">
              <span className="cl-k">resume</span>
              <span className="cl-v">3 formats · view &amp; print ↗</span>
            </a>
          </div>
        </div>
        <form className="contact-form" onSubmit={(e) => {
          e.preventDefault();
          if (!form.name || !form.email || !form.msg) return;
          fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              access_key: '__WEB3FORMS_KEY__',
              name: form.name,
              email: form.email,
              message: form.msg,
            })
          }).then(() => setSent(true)).catch(() => setSent(true));
        }}>
          <label>
            <span>name</span>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="ada lovelace" disabled={sent} />
          </label>
          <label>
            <span>email</span>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="ada@analytical.engine" disabled={sent} />
          </label>
          <label>
            <span>message</span>
            <textarea rows="5" value={form.msg} onChange={e => setForm({ ...form, msg: e.target.value })} placeholder="what are you working on?" disabled={sent} />
          </label>
          <button type="submit" className="btn primary" style={{ "--accent": accent }} disabled={sent}>
            {sent ? "✓ message sent" : "send →"}
          </button>
          {sent && <div className="form-note">got it — I'll reply within a day or two.</div>}
        </form>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────
// NAV + FOOTER
// ──────────────────────────────────────────────────────────────────────
function Nav({ accent }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-inner">
        <a href="#" className="brand">
          <span className="brand-mark" style={{ background: accent }} />
          <span className="brand-text">karthik<span className="muted">.dev</span></span>
        </a>
        <div className="nav-links">
          <a href="#about">about</a>
          <a href="#skills">skills</a>
          <a href="#projects">projects</a>
          <a href="#ai">ai journey</a>
          <a href="#now">now</a>
          <a href="#contact">contact</a>
        </div>
        <a href="#contact" className="nav-cta" style={{ "--accent": accent }}>get in touch</a>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="ascii-art">
        {`  ┌──────────────────────────────────────────────────────┐
  │  built with care · last deploy ${new Date().toISOString().slice(0, 10)}              │
  │  no trackers · no cookies · just html + a little js  │
  └──────────────────────────────────────────────────────┘`}
      </div>
      <div className="footer-row">
        <span>© {new Date().getFullYear()} Karthik Rasamsetti</span>
        <span className="footer-sep">·</span>
        <span>handcrafted in Hyderabad</span>
        <span className="footer-sep">·</span>
        <span>v1.0.0</span>
      </div>
    </footer>
  );
}

// ──────────────────────────────────────────────────────────────────────
// TWEAKS PANEL
// ──────────────────────────────────────────────────────────────────────
function Tweaks({ tweaks, setTweak }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection title="Look">
        <TweakColor label="Accent" value={tweaks.accent} onChange={v => setTweak("accent", v)} />
        <TweakRadio
          label="Display font"
          value={tweaks.displayFont}
          onChange={v => setTweak("displayFont", v)}
          options={[
            { value: "grotesk", label: "Grotesk" },
            { value: "serif", label: "Serif" },
            { value: "mono", label: "Mono" },
          ]}
        />
        <TweakRadio
          label="Density"
          value={tweaks.density}
          onChange={v => setTweak("density", v)}
          options={[
            { value: "comfortable", label: "Comfy" },
            { value: "compact", label: "Compact" },
          ]}
        />
      </TweakSection>
      <TweakSection title="Hero widget">
        <TweakSelect
          label="Variant"
          value={tweaks.heroVariant}
          onChange={v => setTweak("heroVariant", v)}
          options={[
            { value: "test-runner", label: "Live test runner (Playwright)" },
            { value: "agent", label: "AI agent trace log" },
            { value: "perf", label: "k6 perf graph" },
          ]}
        />
      </TweakSection>
    </TweaksPanel>
  );
}

// ──────────────────────────────────────────────────────────────────────
// APP
// ──────────────────────────────────────────────────────────────────────
function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const accent = tweaks.accent;

  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty("--accent", accent);
    r.dataset.font = tweaks.displayFont;
    r.dataset.density = tweaks.density;
  }, [accent, tweaks.displayFont, tweaks.density]);

  return (
    <div className="app">
      <Nav accent={accent} />
      <main>
        <Hero accent={accent} variant={tweaks.heroVariant} />
        <About />
        <Skills accent={accent} />
        <Projects accent={accent} />
        <Journey accent={accent} />
        <Now accent={accent} />
        <Experience />
        <Contact accent={accent} />
      </main>
      <Footer />
      <Tweaks tweaks={tweaks} setTweak={setTweak} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);