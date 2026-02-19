"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Play, Pause, Square, Send } from "lucide-react";

interface SessionMessage {
  id: string;
  agentName: string;
  agentType: string;
  role: string;
  content: string;
  turnNumber: number;
}

export default function SessionDetailPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [humanMessage, setHumanMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function getAgentColor(agentType: string, role: string) {
    if (agentType === "red_team" || role === "attacker") return "border-red-agent";
    if (agentType === "blue_team" || role === "defender") return "border-blue-agent";
    return "border-border";
  }

  function getAgentLabel(agentType: string, role: string) {
    if (agentType === "red_team" || role === "attacker") return "text-red-agent";
    if (agentType === "blue_team" || role === "defender") return "text-blue-agent";
    return "text-muted-foreground";
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold">Session: {sessionId}</h1>
          <p className="text-sm text-muted-foreground">
            {isRunning ? "Running" : "Idle"} &middot; {messages.length} messages
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsRunning(true)} disabled={isRunning} className="flex items-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50">
            <Play className="h-4 w-4" /> Start
          </button>
          <button onClick={() => setIsRunning(false)} disabled={!isRunning} className="flex items-center gap-2 rounded-md bg-yellow-600 px-3 py-2 text-sm text-white hover:bg-yellow-700 disabled:opacity-50">
            <Pause className="h-4 w-4" /> Pause
          </button>
          <button onClick={() => setIsRunning(false)} className="flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700">
            <Square className="h-4 w-4" /> Stop
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <p>Start the session to begin the conversation</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`rounded-lg border-l-4 ${getAgentColor(msg.agentType, msg.role)} bg-card p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-sm font-semibold ${getAgentLabel(msg.agentType, msg.role)}`}>{msg.agentName}</span>
                <span className="text-xs text-muted-foreground">Turn {msg.turnNumber}</span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border pt-4">
        <form onSubmit={(e) => { e.preventDefault(); if (humanMessage.trim()) setHumanMessage(""); }} className="flex gap-2">
          <input type="text" value={humanMessage} onChange={(e) => setHumanMessage(e.target.value)} placeholder="Inject a message into the session..." className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <button type="submit" className="rounded-md bg-primary p-2 text-primary-foreground hover:bg-primary/90">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
