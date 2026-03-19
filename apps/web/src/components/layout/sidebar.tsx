"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  Cpu,
  LayoutDashboard,
  MessageSquare,
  Key,
  DollarSign,
  Settings,
  Search,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "MegaSearch", href: "/megasearch", icon: Search },
  { name: "Agents", href: "/agents", icon: Bot },
  { name: "Models", href: "/models", icon: Cpu },
  { name: "Sessions", href: "/sessions", icon: MessageSquare },
  { name: "API Keys", href: "/api-keys", icon: Key },
  { name: "Costs", href: "/costs", icon: DollarSign },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center border-b border-border px-4">
        <Bot className="mr-2 h-6 w-6 text-primary" />
        <span className="text-lg font-bold">AI Platform</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navigation.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
