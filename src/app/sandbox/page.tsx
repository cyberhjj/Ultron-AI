"use client";

import { Terminal, Server, ShieldAlert, Cpu } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";


export default function SandboxPage() {
  return (
    <div className="flex flex-col h-full bg-background/95">
      <header className="flex items-center justify-between px-6 py-4 border-b bg-background shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Terminal className="w-6 h-6 text-primary" />
            Agent Sandbox
          </h1>
          <p className="text-sm text-muted-foreground">Monitor and manage active E2B micro-VM instances.</p>
        </div>
      </header>

      <ScrollArea className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card/50 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Server className="w-4 h-4 text-blue-500" />
                  Active Instances
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">1</div>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-green-500" />
                  Compute Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">12%</div>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  Trigger.dev Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-muted">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Instance: e2b-pentest-vm-9x2a</CardTitle>
                  <CardDescription>Debian 12 (linux/amd64) - Ephemeral Container</CardDescription>
                </div>
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-green-500 border-green-500">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                  Running
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-black/90 border border-muted p-4 rounded-md font-mono text-sm text-green-400 overflow-x-auto">
                <p>root@e2b-sandbox:~# nmap -sV -p 80,443 target.com</p>
                <p>Starting Nmap 7.93 ( https://nmap.org )</p>
                <p>Nmap scan report for target.com (192.168.1.100)</p>
                <p>Host is up (0.015s latency).</p>
                <p className="mt-2 text-muted-foreground animate-pulse">Scanning...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
