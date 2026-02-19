import { Plus, Cloud, Server } from "lucide-react";

const commercialModels = [
  { name: "GPT-4o", provider: "OpenAI", status: "available" },
  { name: "GPT-4o Mini", provider: "OpenAI", status: "available" },
  { name: "Claude 3.5 Sonnet", provider: "Anthropic", status: "available" },
  { name: "Claude 3.5 Haiku", provider: "Anthropic", status: "available" },
];

const openSourceModels = [
  { name: "Mistral 7B Instruct", hfId: "mistralai/Mistral-7B-Instruct-v0.3", gpu: "T4", status: "not_deployed" },
  { name: "Gemma 2 9B", hfId: "google/gemma-2-9b-it", gpu: "T4/A100", status: "not_deployed" },
  { name: "Llama 3.1 8B", hfId: "meta-llama/Llama-3.1-8B-Instruct", gpu: "T4", status: "not_deployed" },
  { name: "Phi-3 Mini 4K", hfId: "microsoft/Phi-3-mini-4k-instruct", gpu: "T4", status: "not_deployed" },
];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    available: "bg-green-500/10 text-green-500",
    running: "bg-green-500/10 text-green-500",
    deploying: "bg-yellow-500/10 text-yellow-500",
    stopped: "bg-gray-500/10 text-gray-500",
    not_deployed: "bg-gray-500/10 text-gray-500",
    failed: "bg-red-500/10 text-red-500",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? styles.not_deployed}`}>
      {status.replace("_", " ")}
    </span>
  );
}

export default function ModelsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Models</h1>
        <p className="text-muted-foreground">Manage commercial API models and deploy open-source models</p>
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Commercial APIs</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {commercialModels.map((model) => (
            <div key={model.name} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{model.name}</p>
                <StatusBadge status={model.status} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{model.provider}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Open Source Models</h2>
          </div>
          <a href="/models/deploy" className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Deploy Model
          </a>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {openSourceModels.map((model) => (
            <div key={model.name} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{model.name}</p>
                <StatusBadge status={model.status} />
              </div>
              <p className="mt-1 text-xs font-mono text-muted-foreground">{model.hfId}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">GPU: {model.gpu}</span>
                <button className="rounded-md bg-secondary px-3 py-1 text-xs hover:bg-secondary/80">Deploy</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
