"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AgentType } from "@repo/types";

const agentTypes: Array<{ value: AgentType; label: string; description: string }> = [
  { value: "red_team", label: "Red Team", description: "Offensive security testing agent" },
  { value: "blue_team", label: "Blue Team", description: "Defensive security agent" },
  { value: "general", label: "General", description: "General-purpose AI agent" },
  { value: "custom", label: "Custom", description: "Custom agent configuration" },
];

export default function NewAgentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<AgentType>("general");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [temperature, setTemperature] = useState("0.7");
  const [maxTokens, setMaxTokens] = useState("4096");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, type, systemPrompt, temperature, maxTokens: parseInt(maxTokens, 10) }),
      });
      if (response.ok) router.push("/agents");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Agent</h1>
        <p className="text-muted-foreground">Configure a new AI agent</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Agent" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this agent do?" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Type</label>
          <div className="grid grid-cols-2 gap-3">
            {agentTypes.map((t) => (
              <button key={t.value} type="button" onClick={() => setType(t.value)} className={`rounded-md border p-3 text-left transition-colors ${type === t.value ? "border-primary bg-secondary" : "border-border hover:border-primary/50"}`}>
                <p className="text-sm font-medium">{t.label}</p>
                <p className="text-xs text-muted-foreground">{t.description}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">System Prompt</label>
          <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} placeholder="You are a helpful AI assistant..." rows={6} required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Temperature ({temperature})</label>
            <input type="range" min="0" max="2" step="0.1" value={temperature} onChange={(e) => setTemperature(e.target.value)} className="w-full" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Max Tokens</label>
            <input type="number" value={maxTokens} onChange={(e) => setMaxTokens(e.target.value)} min="256" max="128000" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{isSubmitting ? "Creating..." : "Create Agent"}</button>
        </div>
      </form>
    </div>
  );
}
