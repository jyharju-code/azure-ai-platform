"use client";

import { useState } from "react";
import { Key, Plus, Trash2, TestTube } from "lucide-react";

interface ApiKeyEntry {
  id: string;
  name: string;
  provider: "openai" | "anthropic";
  keyPrefix: string;
  isActive: boolean;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyEntry[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyProvider, setNewKeyProvider] = useState<"openai" | "anthropic">("openai");
  const [newKeyValue, setNewKeyValue] = useState("");

  async function handleAddKey(e: React.FormEvent) {
    e.preventDefault();
    const response = await fetch("/api/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newKeyName, provider: newKeyProvider, key: newKeyValue }),
    });
    if (response.ok) {
      setShowAddDialog(false);
      setNewKeyName("");
      setNewKeyValue("");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Keys</h1>
          <p className="text-muted-foreground">Manage your OpenAI and Anthropic API keys</p>
        </div>
        <button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Add Key
        </button>
      </div>

      {showAddDialog && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Add API Key</h2>
          <form onSubmit={handleAddKey} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <input type="text" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="My OpenAI Key" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Provider</label>
              <select value={newKeyProvider} onChange={(e) => setNewKeyProvider(e.target.value as "openai" | "anthropic")} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">API Key</label>
              <input type="password" value={newKeyValue} onChange={(e) => setNewKeyValue(e.target.value)} placeholder="sk-..." required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowAddDialog(false)} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary">Cancel</button>
              <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Save Key</button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-lg border border-border">
        <div className="grid grid-cols-5 gap-4 border-b border-border px-6 py-3 text-sm font-medium text-muted-foreground">
          <div className="col-span-2">Name</div>
          <div>Provider</div>
          <div>Key</div>
          <div>Actions</div>
        </div>
        {keys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Key className="mb-4 h-12 w-12" />
            <p>No API keys configured</p>
            <p className="text-sm">Add your OpenAI or Anthropic API key to get started</p>
          </div>
        ) : (
          keys.map((key) => (
            <div key={key.id} className="grid grid-cols-5 gap-4 px-6 py-3 text-sm border-b border-border last:border-0">
              <div className="col-span-2 font-medium">{key.name}</div>
              <div className="capitalize">{key.provider}</div>
              <div className="font-mono text-muted-foreground">{key.keyPrefix}...</div>
              <div className="flex gap-2">
                <button className="rounded p-1 hover:bg-secondary" title="Test key"><TestTube className="h-4 w-4" /></button>
                <button className="rounded p-1 hover:bg-destructive/20 text-destructive" title="Delete"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
