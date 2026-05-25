"use client";

import { useChat } from "@ai-sdk/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Send, TerminalSquare, User, Globe, FileText, FileEdit, Package } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AgentApprovalGate } from "@/components/AgentApprovalGate";

import { useState, useRef, useCallback } from "react";

// ─── Tool Result Renderer ─────────────────────────────────────────────────────
// Renders tool invocation results based on the tool type, not just execute_bash.
function ToolResultDisplay({ toolInvocation }: { toolInvocation: any }) {
  const toolName = toolInvocation.toolName;
  const args = toolInvocation.args || {};
  const result = toolInvocation.result || {};

  // Determine display label & content based on tool type
  let label = "";
  let content = "";
  let errorContent = "";

  switch (toolName) {
    case "execute_bash":
      label = `$ ${args.command || "unknown command"}`;
      content = result.stdout || "(no output)";
      errorContent = result.stderr || "";
      break;
    case "web_search":
      label = `🔍 Search: ${args.query || ""}`;
      content = result.result || "(no results)";
      break;
    case "read_file":
      label = `📄 Read: ${args.path || ""}`;
      content = result.content || "(empty file)";
      break;
    case "write_file":
      label = `✏️ Write: ${args.path || ""}`;
      content = result.bytes ? `Written ${result.bytes} bytes` : "File written";
      break;
    case "install_tool":
      label = `📦 Install: ${args.tool_name || ""} (${args.method || ""})`;
      content = result.output || "Installed";
      break;
    default:
      label = `Tool: ${toolName}`;
      content = JSON.stringify(result, null, 2);
  }

  // Pick icon based on tool
  const iconMap: Record<string, any> = {
    execute_bash: TerminalSquare,
    web_search: Globe,
    read_file: FileText,
    write_file: FileEdit,
    install_tool: Package,
  };
  const IconComponent = iconMap[toolName] || TerminalSquare;

  return (
    <div className="p-3 bg-black/50 rounded border border-primary/30 font-mono text-xs text-green-400">
      <div className="flex items-center gap-2 mb-2">
        <IconComponent className="w-4 h-4" />
        <span className="truncate">{label}</span>
      </div>
      <div className="mt-2 text-muted-foreground whitespace-pre-wrap break-all">
        {content}
        {errorContent && (
          <span className="text-red-400">{errorContent}</span>
        )}
      </div>
    </div>
  );
}

// ─── Tool Invocation Component ────────────────────────────────────────────────
// Handles all states of a tool invocation: running, result, or HITL required.
function ToolInvocationDisplay({
  toolInvocation,
  onApprove,
  onDeny,
}: {
  toolInvocation: any;
  onApprove: (taskId: string) => void;
  onDeny: (taskId: string) => void;
}) {
  const toolName = toolInvocation.toolName;
  const args = toolInvocation.args || {};

  if (toolInvocation.state === "result") {
    // HITL approval gate for red-risk commands
    if (toolInvocation.result?.status === "hitl_required") {
      return (
        <AgentApprovalGate
          action={{
            taskId: toolInvocation.toolCallId,
            riskLevel: toolInvocation.result.risk_level,
            command: toolInvocation.result.command,
            justification: toolInvocation.result.justification,
          }}
          onApprove={onApprove}
          onDeny={onDeny}
        />
      );
    }

    // Completed tool result
    return <ToolResultDisplay toolInvocation={toolInvocation} />;
  }

  // Still running...
  const runningLabel = toolName === "execute_bash"
    ? args.command
    : toolName === "web_search"
    ? `Searching: ${args.query}`
    : toolName === "read_file"
    ? `Reading: ${args.path}`
    : toolName === "write_file"
    ? `Writing: ${args.path}`
    : toolName === "install_tool"
    ? `Installing: ${args.tool_name}`
    : toolName;

  return (
    <div className="p-3 bg-black/50 rounded border border-primary/30 font-mono text-xs text-green-400">
      <div className="flex items-center gap-2 mb-2">
        <TerminalSquare className="w-4 h-4" />
        <span>Executing: {runningLabel}</span>
      </div>
      <div className="mt-2 text-muted-foreground animate-pulse">Running in sandbox...</div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [input, setInput] = useState('');
  const [targetScope, setTargetScope] = useState('example.com');
  const [attackMode, setAttackMode] = useState<'standard' | 'ctf' | 'bug_bounty' | 'continuous'>('standard');
  const sessionIdRef = useRef<string | null>(null);

  const { messages, status, error, append, sendMessage, addToolResult, isLoading: chatIsLoading } = (useChat(({
    body: {
      targetScope,
      mode: attackMode
    },
    onResponse: (response: Response) => {
      // Track the session ID from the server for persistent sandbox
      const sid = response.headers.get("X-Session-Id");
      if (sid) {
        sessionIdRef.current = sid;
        console.log(`[Ultron] Session ID: ${sid}`);
      }
    },
    onError: (err: any) => console.error("useChat error:", err)
  } as any)) as any);

  const isLoading = chatIsLoading || status === 'streaming' || status === 'submitted';
  
  const handleInputChange = (e: any) => setInput(e.target.value);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const value = input;
    setInput('');
    
    // Inject scope and mode instruction in the first user message if scope is set
    const finalContent = messages.length === 0 
      ? `[Target Scope: ${targetScope}] [Mode: ${attackMode.toUpperCase()}] ${value}` 
      : value;

    if (append) {
      append({ role: 'user', content: finalContent });
    } else if (sendMessage) {
      sendMessage({ role: 'user', content: finalContent });
    }
  };

  // Shared handler for approving red-risk commands via HITL gate
  const handleApprove = useCallback((taskId: string) => {
    console.log('Approved task:', taskId);
    const matchedItem = messages
      .flatMap((m: any) => m.parts || m.toolInvocations || [])
      .find((p: any) =>
        (p.toolCallId === taskId || p.toolInvocation?.toolCallId === taskId)
      );
    const command = matchedItem
      ? (matchedItem.toolInvocation?.result?.command ?? matchedItem.result?.command ?? "")
      : "";

    fetch('/api/execute-approved', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        command,
        sessionId: sessionIdRef.current,
      })
    })
    .then(res => res.json())
    .then(data => {
      addToolResult({
        toolCallId: taskId,
        result: data.error ? { error: data.error } : { stdout: data.stdout, stderr: data.stderr }
      });
    })
    .catch(err => {
      addToolResult({
        toolCallId: taskId,
        result: { error: err.message || "Failed to execute" }
      });
    });
  }, [messages, addToolResult]);

  const handleDeny = useCallback((taskId: string) => {
    console.log('Denied task:', taskId);
    addToolResult({
      toolCallId: taskId,
      result: { error: "Execution denied by user." }
    });
  }, [addToolResult]);

  return (
    <div className="flex flex-col h-full bg-background/95">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-background shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            New Pentest Session
          </h1>
          <p className="text-sm text-muted-foreground">Ask Ultron to perform reconnaissance or exploit a target.</p>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <ScrollArea className="flex-1 p-6 h-full">
            <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full pb-10">
              
              {/* Welcome Message (Only show if no messages) */}
              {messages.length === 0 && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-muted/50 border p-5 rounded-lg rounded-tl-none flex-1 space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground mb-1">Welcome to Ultron v3.0</h3>
                      <p className="text-sm text-muted-foreground">
                        Configure your target scope and specialized attack mode below before initiating E2B sandbox execution.
                      </p>
                    </div>

                    {/* Settings Panel */}
                    <div className="space-y-4 bg-background/50 border border-muted p-4 rounded-lg">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Target Scope</label>
                        <Input 
                          value={targetScope} 
                          onChange={(e) => setTargetScope(e.target.value)} 
                          placeholder="e.g. target.com or 192.168.1.100" 
                          className="bg-background border-muted"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Specialized Mode</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {(['standard', 'ctf', 'bug_bounty', 'continuous'] as const).map((mode) => (
                            <Button 
                              key={mode} 
                              type="button"
                              variant={attackMode === mode ? 'default' : 'outline'}
                              onClick={() => setAttackMode(mode)}
                              className="text-xs capitalize h-9"
                            >
                              {mode.replace('_', ' ')}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Card className="bg-background/50 border-primary/20">
                        <CardHeader className="p-3 pb-1">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <TerminalSquare className="w-4 h-4" />
                            Reconnaissance
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-1 text-xs text-muted-foreground">
                          "Run an nmap scan on target.com"
                        </CardContent>
                      </Card>
                      <Card className="bg-background/50 border-primary/20">
                        <CardHeader className="p-3 pb-1">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <TerminalSquare className="w-4 h-4" />
                            Web Scanning
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-1 text-xs text-muted-foreground">
                          "Find hidden directories on example.com using gobuster"
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              {messages.map((m: any) => (
                <div key={m.id} className="flex gap-4">
                  {m.role === 'user' ? (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Shield className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  
                  <div className={`p-4 rounded-lg flex-1 overflow-x-auto ${
                    m.role === 'user' 
                      ? 'bg-secondary/50 rounded-tr-none' 
                      : 'bg-muted/50 border rounded-tl-none'
                  }`}>
                    {/* Render parts if available (AI SDK v6), otherwise fall back to content */}
                    {m.parts && m.parts.length > 0 ? (
                      m.parts.map((part: any, index: number) => {
                        if (part.type === 'text' && part.text) {
                          return (
                            <div key={`text-${index}`} className="text-sm prose prose-sm dark:prose-invert max-w-none">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {part.text}
                              </ReactMarkdown>
                            </div>
                          );
                        }
                        if (part.type === 'tool-invocation') {
                          return (
                            <div key={part.toolInvocation?.toolCallId || `tool-${index}`} className="mt-4">
                              <ToolInvocationDisplay
                                toolInvocation={part.toolInvocation}
                                onApprove={handleApprove}
                                onDeny={handleDeny}
                              />
                            </div>
                          );
                        }
                        return null;
                      })
                    ) : m.content ? (
                      <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    ) : null}

                    {/* Fallback for old toolInvocations array (AI SDK v4 compat) */}
                    {!m.parts && m.toolInvocations && m.toolInvocations.map((toolInvocation: any) => (
                      <div key={toolInvocation.toolCallId} className="mt-4">
                        <ToolInvocationDisplay
                          toolInvocation={toolInvocation}
                          onApprove={handleApprove}
                          onDeny={handleDeny}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4 text-primary animate-pulse" />
                  </div>
                  <div className="bg-muted/50 border p-4 rounded-lg rounded-tl-none flex-1">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              )}
              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm font-mono">
                  Error: {error.message || "Unknown error occurred"}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 bg-background border-t shrink-0">
            <form onSubmit={onSubmit} className="max-w-4xl mx-auto relative flex items-center">
              <Input 
                value={input}
                onChange={handleInputChange}
                placeholder="Ask Ultron to scan a target..." 
                className="pr-12 py-6 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/50 rounded-xl"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={isLoading || !input?.trim()}
                className="absolute right-2 rounded-lg bg-primary hover:bg-primary/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
            <div className="text-center mt-2 text-xs text-muted-foreground">
              Ultron can make mistakes. Always verify findings before reporting.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
