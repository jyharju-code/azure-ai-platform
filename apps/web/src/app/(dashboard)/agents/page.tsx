import Link from "next/link";
import { Bot, Plus } from "lucide-react";

export default function AgentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agents</h1>
          <p className="text-muted-foreground">Create and manage your AI agents</p>
        </div>
        <Link
          href="/agents/new"
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Agent
        </Link>
      </div>

      <div className="rounded-lg border border-border">
        <div className="grid grid-cols-6 gap-4 border-b border-border px-6 py-3 text-sm font-medium text-muted-foreground">
          <div className="col-span-2">Name</div>
          <div>Type</div>
          <div>Model</div>
          <div>Status</div>
          <div>Actions</div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Bot className="mb-4 h-12 w-12" />
          <p>No agents yet</p>
          <p className="text-sm">Create your first agent to get started</p>
        </div>
      </div>
    </div>
  );
}
