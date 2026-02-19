import { Bot, Cpu, DollarSign, Activity } from "lucide-react";

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your AI agents and models
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Agents"
          value="0"
          icon={Bot}
          description="No agents running"
        />
        <StatCard
          title="Models Online"
          value="0"
          icon={Cpu}
          description="No models deployed"
        />
        <StatCard
          title="Active Sessions"
          value="0"
          icon={Activity}
          description="No sessions running"
        />
        <StatCard
          title="Total Cost"
          value="$0.00"
          icon={DollarSign}
          description="This month"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Recent Sessions</h2>
          <p className="mt-4 text-sm text-muted-foreground">
            No sessions yet. Create your first agent and start a session.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Cost Overview</h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Cost data will appear here once you start using models.
          </p>
        </div>
      </div>
    </div>
  );
}
