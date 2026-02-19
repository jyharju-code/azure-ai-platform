import Link from "next/link";
import { MessageSquare, Plus } from "lucide-react";

export default function SessionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sessions</h1>
          <p className="text-muted-foreground">Run multi-agent sessions and red team vs blue team scenarios</p>
        </div>
        <Link href="/sessions/new" className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          New Session
        </Link>
      </div>
      <div className="rounded-lg border border-border">
        <div className="grid grid-cols-6 gap-4 border-b border-border px-6 py-3 text-sm font-medium text-muted-foreground">
          <div className="col-span-2">Name</div>
          <div>Type</div>
          <div>Status</div>
          <div>Turns</div>
          <div>Actions</div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <MessageSquare className="mb-4 h-12 w-12" />
          <p>No sessions yet</p>
          <p className="text-sm">Create a session to start a multi-agent conversation</p>
        </div>
      </div>
    </div>
  );
}
