import { DollarSign, Download } from "lucide-react";

export default function CostsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cost Tracking</h1>
          <p className="text-muted-foreground">Monitor your AI model usage and costs</p>
        </div>
        <button className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Total Cost</p>
          <p className="mt-2 text-3xl font-bold">$0.00</p>
          <p className="text-sm text-muted-foreground">This month</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">API Costs</p>
          <p className="mt-2 text-3xl font-bold">$0.00</p>
          <p className="text-sm text-muted-foreground">OpenAI + Anthropic</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">GPU Costs</p>
          <p className="mt-2 text-3xl font-bold">$0.00</p>
          <p className="text-sm text-muted-foreground">Azure Container Apps</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Cost by Model</h2>
        <div className="mt-8 flex items-center justify-center py-12 text-muted-foreground">
          <div className="text-center">
            <DollarSign className="mx-auto mb-4 h-12 w-12" />
            <p>No cost data yet</p>
            <p className="text-sm">Costs will appear here as you use models</p>
          </div>
        </div>
      </div>
    </div>
  );
}
