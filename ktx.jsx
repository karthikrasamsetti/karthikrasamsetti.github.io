// ktx — floating terminal assistant for Karthik's portfolio.
// Scripted commands answer instantly and offline; anything else is routed
// to the Groq-backed Vercel proxy. Depends on React globals (same as portfolio.jsx).

const KTX_ENDPOINT = "https://ktx-api.vercel.app/api/chat";

// ── scripted command data (instant, no API) ─────────────────────────────
const KTX_COMMANDS = {
  help: () => [
    "available commands:",
    "  whoami      who is Karthik",
    "  skills      the stack",
    "  projects    what he's built",
    "  experience  work history",
    "  contact     how to reach him",
    "  clear       wipe the screen",
    "",
    "or just type a question — e.g. \"what's qa-engine?\"",
  ],
  whoami: () => [
    "Karthik Rasamsetti",
    "QA Automation Engineer → AI Engineer · Hyderabad, IN",
    "3+ yrs. Building intelligent testing systems at the seam of QA & AI.",
    "Open to: AI Eng · SDET · QA-AI roles.",
  ],
  skills: () => [
    "automation   Playwright · Selenium · WebdriverIO · Karate DSL · Cypress",
    "languages    JavaScript/TS · Java · Python · SQL",
    "performance  k6 · JMeter · WebLoad",
    "devops       Jenkins · GitHub Actions · Docker · Azure DevOps · CircleCI",
    "ai           LangGraph · LangChain · RAG · DeepEval · Groq · OpenAI · Claude",
  ],
  projects: () => [
    "qa-engine        11-agent LangGraph: user story → executed browser test",
    "diagnostician    read-only agent triaging CI failures (bug/flaky/env)",
    "ai-sql-assistant natural language → safe read-only SQL",
    "karate-api-...   REST + SOAP + DB API automation w/ CI",
    "test-forge       manual test cases → Playwright scripts",
    "",
    "type a name for detail, or: github",
  ],
  github: () => ["→ https://github.com/karthikrasamsetti"],
  experience: () => [
    "OnTrac      2024–now  perf testing (k6), ~3x peak load, WebLOAD→k6 (~40% faster)",
    "LeaseLock   2023–24   built UTAF framework, adopted by 3 squads, +50% coverage",
    "Encore      2022–23   BDD/Cucumber, cross-browser suites",
  ],
  contact: () => [
    "email     karthikrasamsetti@gmail.com",
    "github    @karthikrasamsetti",
    "linkedin  /in/karthik-rasamsetti-29450319b",
  ],
};

const BOOT_LINES = [
  "ktx v1.0.0 — Karthik Rasamsetti // interactive shell",
  "loading profile ........ ok",
  "type 'help' for commands, or ask anything about Karthik.",
];

function KtxTerminal() {
  const [open, setOpen] = React.useState(false);
  const [lines, setLines] = React.useState([]); // {who:'sys'|'user'|'ktx', text}
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [booted, setBooted] = React.useState(false);
  const bodyRef = React.useRef(null);
  const inputRef = React.useRef(null);
  const history = React.useRef([]); // for LLM context

  // boot sequence — runs once, first time the panel opens
  React.useEffect(() => {
    if (!open || booted) return;
    setBooted(true);
    let i = 0;
    const tick = () => {
      if (i < BOOT_LINES.length) {
        setLines(L => [...L, { who: "sys", text: BOOT_LINES[i] }]);
        i++;
        setTimeout(tick, 380);
      }
    };
    tick();
  }, [open, booted]);

  React.useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [lines, busy]);

  React.useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open, busy]);

  const push = (who, text) => {
    const arr = Array.isArray(text) ? text : [text];
    setLines(L => [...L, ...arr.map(t => ({ who, text: t }))]);
  };

  async function runFreeText(q) {
    setBusy(true);
    push("ktx", "…thinking");
    history.current.push({ role: "user", content: q });
    try {
      const res = await fetch(KTX_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.current }),
      });
      const data = await res.json();
      const reply = data.reply || "(no response — try 'help')";
      history.current.push({ role: "assistant", content: reply });
      // replace the "…thinking" placeholder with the real reply
      setLines(L => {
        const copy = [...L];
        const idx = copy.map(x => x.text).lastIndexOf("…thinking");
        if (idx >= 0) copy[idx] = { who: "ktx", text: reply };
        return copy;
      });
    } catch (e) {
      setLines(L => {
        const copy = [...L];
        const idx = copy.map(x => x.text).lastIndexOf("…thinking");
        const msg = "connection error — the AI backend didn't respond. commands still work: try 'help'.";
        if (idx >= 0) copy[idx] = { who: "ktx", text: msg };
        return copy;
      });
    } finally {
      setBusy(false);
    }
  }

  function submit(e) {
    e.preventDefault();
    const raw = input.trim();
    if (!raw || busy) return;
    setInput("");
    push("user", raw);

    const cmd = raw.toLowerCase();
    if (cmd === "clear") { setLines([]); return; }
    if (KTX_COMMANDS[cmd]) { push("ktx", KTX_COMMANDS[cmd]()); return; }

    // project-name shortcuts route through the LLM for a richer answer
    runFreeText(raw);
  }

  return (
    <div className="ktx-root">
      {!open && (
        <button className="ktx-launcher" onClick={() => setOpen(true)} aria-label="Open ktx terminal">
          <span className="ktx-launcher-avatar">
            <img src="./ktx-bot.png" alt="" />
            <span className="ktx-launcher-dot" />
          </span>
          <span className="ktx-launcher-text">ask&nbsp;<b>ktx</b></span>
          <span className="ktx-launcher-caret">▸</span>
        </button>
      )}

      {open && (
        <div className="ktx-panel" role="dialog" aria-label="ktx terminal">
          <div className="ktx-chrome">
            <div className="ktx-dots"><span /><span /><span /></div>
            <div className="ktx-title">ktx — ask me about Karthik</div>
            <button className="ktx-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
          </div>

          <div className="ktx-body" ref={bodyRef}>
            {lines.map((l, i) => (
              <div key={i} className={`ktx-line ${l.who}`}>
                {l.who === "user" && <span className="ktx-prompt">$</span>}
                {l.who === "ktx" && <span className="ktx-prompt ktx-arrow">›</span>}
                <span className="ktx-text">{l.text}</span>
              </div>
            ))}
          </div>

          <form className="ktx-inputbar" onSubmit={submit}>
            <span className="ktx-prompt">$</span>
            <input
              ref={inputRef}
              className="ktx-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={busy ? "waiting…" : "type a command or a question"}
              disabled={busy}
              autoComplete="off"
              spellCheck="false"
            />
          </form>
        </div>
      )}
    </div>
  );
}

// mount into its own root so it floats above everything, independent of <App/>
(function mountKtx() {
  const el = document.createElement("div");
  el.id = "ktx-mount";
  document.body.appendChild(el);
  ReactDOM.createRoot(el).render(<KtxTerminal />);
})();