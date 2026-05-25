'use client';

import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface PendingAction {
  taskId: string;
  riskLevel: "yellow" | "red";
  command: string;
  justification: string;
}

interface AgentApprovalGateProps {
  action: PendingAction;
  onApprove: (taskId: string) => void;
  onDeny: (taskId: string) => void;
}

export function AgentApprovalGate({ action, onApprove, onDeny }: AgentApprovalGateProps) {
  const [decided, setDecided] = useState(false);

  const handleApprove = () => {
    setDecided(true);
    onApprove(action.taskId);
  };

  const handleDeny = () => {
    setDecided(true);
    onDeny(action.taskId);
  };

  if (decided) {
    return (
      <div className="mt-4 p-3 bg-muted/50 rounded border border-border text-sm text-muted-foreground flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-green-500" />
        Action resolved.
      </div>
    );
  }

  return (
    <div className={`mt-4 p-4 rounded border ${action.riskLevel === 'red' ? 'bg-red-950/20 border-red-900/50' : 'bg-yellow-950/20 border-yellow-900/50'}`}>
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className={`w-5 h-5 ${action.riskLevel === 'red' ? 'text-red-500' : 'text-yellow-500'}`} />
        <h4 className="font-semibold text-foreground">
          Approval Required: {action.riskLevel.toUpperCase()} Risk Action
        </h4>
      </div>
      
      <div className="bg-black/50 p-3 rounded font-mono text-xs text-green-400 mb-3 overflow-x-auto">
        $ {action.command}
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        <span className="font-semibold text-foreground">AI Justification:</span> {action.justification}
      </p>

      <div className="flex gap-3">
        <button 
          onClick={handleApprove}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-4 rounded text-sm font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <CheckCircle className="w-4 h-4" /> Approve Execution
        </button>
        <button 
          onClick={handleDeny}
          className="flex-1 bg-destructive/20 hover:bg-destructive/30 text-destructive py-2 px-4 rounded text-sm font-medium flex items-center justify-center gap-2 transition-colors border border-destructive/50"
        >
          <XCircle className="w-4 h-4" /> Deny Action
        </button>
      </div>
    </div>
  );
}
