export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Platform configuration</p>
      </div>
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Azure Configuration</h2>
          <p className="mt-2 text-sm text-muted-foreground">Configure your Azure subscription and resource settings.</p>
          <div className="mt-4 space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Subscription ID</label>
              <input type="text" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono" disabled />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Resource Group</label>
              <input type="text" placeholder="ai-platform-rg" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" disabled />
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Default Model Settings</h2>
          <p className="mt-2 text-sm text-muted-foreground">Default parameters for new agents.</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Temperature</label>
              <input type="number" defaultValue="0.7" step="0.1" min="0" max="2" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Max Tokens</label>
              <input type="number" defaultValue="4096" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
