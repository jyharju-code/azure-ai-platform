"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Loader2, ChevronDown, ChevronRight, Zap, Clock, Lock } from "lucide-react";

interface MutationResult {
  style: string;
  query: string;
  response: string;
}

interface SearchResult {
  query: string;
  mutations: Array<{ style: string; query: string }>;
  results: MutationResult[];
  synthesis: string;
  timing: { mutation_s: number; parallel_s: number; synthesis_s: number; total_s: number };
}

function generatePin(): string {
  const now = Date.now();
  const window = Math.floor(now / (2 * 60 * 60 * 1000)); // 2-hour windows
  const seed = window * 7919 + 42069;
  return String(seed % 1000000).padStart(6, "0");
}

function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = generatePin();
    if (pin === correctPin) {
      sessionStorage.setItem("megasearch_auth", correctPin);
      onUnlock();
    } else {
      setError("Väärä PIN. Pyydä uusi koodi ylläpitäjältä.");
      setPin("");
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-lg">
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-xl font-bold">MegaSearch</h2>
          <p className="text-center text-sm text-muted-foreground">
            Syötä 6-numeroinen PIN-koodi päästäksesi käyttämään MegaSearchia
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={pin}
            onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setError(""); }}
            placeholder="000000"
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {error && <p className="text-center text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={pin.length !== 6}
            className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Avaa
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          PIN vaihtuu 2 tunnin välein
        </p>
      </div>
    </div>
  );
}

function ResultPanel({ result, index }: { result: MutationResult; index: number }) {
  const [open, setOpen] = useState(false);
  const styleColors: Record<string, string> = {
    alkuperäinen: "bg-blue-500/10 text-blue-500",
    suora: "bg-green-500/10 text-green-500",
    kiertelevä: "bg-purple-500/10 text-purple-500",
    aggressiivinen: "bg-red-500/10 text-red-500",
    epämääräinen: "bg-gray-500/10 text-gray-400",
    asiantuntija: "bg-amber-500/10 text-amber-500",
    kriittinen: "bg-orange-500/10 text-orange-500",
    yksinkertaistettu: "bg-teal-500/10 text-teal-500",
    tekninen: "bg-cyan-500/10 text-cyan-500",
    luova: "bg-pink-500/10 text-pink-500",
    vastakkainen: "bg-rose-500/10 text-rose-500",
  };

  return (
    <div className="rounded-lg border border-border bg-card/50">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-secondary/30"
      >
        {open ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styleColors[result.style] ?? "bg-gray-500/10 text-gray-400"}`}>
          {result.style}
        </span>
        <span className="truncate text-muted-foreground">{result.query.slice(0, 80)}...</span>
      </button>
      {open && (
        <div className="border-t border-border px-4 py-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Kysymys:</p>
          <p className="mb-3 text-sm italic text-muted-foreground">{result.query}</p>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Vastaus:</p>
          <div className="prose prose-sm prose-invert max-w-none whitespace-pre-wrap text-sm">{result.response}</div>
        </div>
      )}
    </div>
  );
}

export default function MegaSearchPage() {
  const [authed, setAuthed] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("megasearch_auth");
    if (saved === generatePin()) setAuthed(true);
  }, []);

  if (!authed) return <PinGate onUnlock={() => setAuthed(true)} />;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    setResult(null);
    setError("");
    setPhase("Generoidaan 10 muunnosta...");

    try {
      const res = await fetch("/api/megasearch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Haku epäonnistui");
      }

      // SSE stream
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalResult: Partial<SearchResult> = { query: query.trim(), mutations: [], results: [] };

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.phase === "mutations" && data.status === "done") {
              finalResult.mutations = data.mutations;
              setPhase(`${data.mutations.length} muunnosta luotu (${data.time}s) — ajetaan 11 hakua...`);
            } else if (data.phase === "parallel" && data.status === "done") {
              setPhase(`11 vastausta saatu (${data.time}s) — syntetisoidaan...`);
            } else if (data.phase === "result") {
              finalResult.results = [...(finalResult.results || []), { style: data.style, query: data.query, response: data.response }];
            } else if (data.phase === "synthesis" && data.status === "done") {
              finalResult.synthesis = data.synthesis;
              finalResult.timing = {
                mutation_s: 0,
                parallel_s: 0,
                synthesis_s: data.time,
                total_s: data.total_time,
              };
              setResult(finalResult as SearchResult);
              setPhase("");
            }
          } catch {}
        }
      }
    } catch (err: any) {
      setError(err.message || "Tuntematon virhe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-bold">
          <Search className="h-8 w-8 text-primary" />
          MegaSearch
        </h1>
        <p className="mt-1 text-muted-foreground">
          11 rinnakkaista GPT-5.3 hakua, yksi synteesi. Syvällisempi vastaus kuin yhdestä kyselystä.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Kirjoita kysymyksesi..."
          className="flex-1 rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!query.trim() || loading}
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          {loading ? "Haetaan..." : "MegaSearch"}
        </button>
      </form>

      {phase && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          {phase}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Synthesis */}
          <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <Zap className="h-5 w-5 text-primary" />
              Synteesi
            </h2>
            <div className="prose prose-sm prose-invert max-w-none whitespace-pre-wrap">
              {result.synthesis}
            </div>
          </div>

          {/* Timing */}
          {result.timing && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Kokonaisaika: {result.timing.total_s}s
              {" · "}13 GPT-5.3 kutsua
              {" · "}11 rinnakkaista hakua
            </div>
          )}

          {/* Individual results */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              Yksittäiset vastaukset ({result.results.length})
            </h3>
            <div className="space-y-2">
              {result.results.map((r, i) => (
                <ResultPanel key={i} result={r} index={i} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
