"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SessionType } from "@repo/types";

const sessionTypes: Array<{ value: SessionType; label: string; description: string }> = [
  { value: "red_vs_blue", label: "Red vs Blue", description: "Adversarial session between attacker and defender" },
  { value: "multi_agent", label: "Multi-Agent", description: "Collaborative multi-agent session" },
  { value: "single_agent", label: "Single Agent", description: "Interactive single agent session" },
];

export default function NewSessionPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState<SessionType>("red_vs_blue");
  const [scenario, setScenario] = useState("");
  const [maxTurns, setMaxTurns] = useState("50");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const response = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type, scenario, maxTurns: parseInt(maxTurns, 10), agentIds: [] }),
    });
    if (response.ok) {
      const session = await response.json();
      router.push("/sessions/" + session.id);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Session</h1>
        <p className="text-muted-foreground">Set up a new multi-agent session</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Session Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Red vs Blue: Web App Security" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Session Type</label>
          <div className="grid grid-cols-3 gap-3">
            {sessionTypes.map((t) => (
              <button key={t.value} type="button" onClick={() => setType(t.value)} className={`rounded-md border p-3 text-left transition-colors ${type === t.value ? "border-primary bg-secondary" : "border-border hover:border-primary/50"}`}>
                <p className="text-sm font-medium">{t.label}</p>
                <p className="text-xs text-muted-foreground">{t.description}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Scenario</label>
          <textarea value={scenario} onChange={(e) => setScenario(e.target.value)} placeholder="Describe the scenario..." rows={4} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Max Turns</label>
          <input type="number" value={maxTurns} onChange={(e) => setMaxTurns(e.target.value)} min="1" max="500" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary">Cancel</button>
          <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Create Session</button>
        </div>
      </form>
    </div>
  );
}
