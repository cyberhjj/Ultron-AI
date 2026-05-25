export interface Finding {
  type: "open_port" | "service" | "vulnerability" | "credential" | "shell_access";
  severity: "info" | "low" | "medium" | "high" | "critical";
  description: string;
  raw_output: string;
  cve_ids: string[];
  cvss_score: number;
  epss_score: number;
  remediation: string;
  evidence: string;
}

export interface PTGNode {
  task_id: string; // UUID
  parent_ids: string[]; // dependency edges
  child_ids: string[]; // spawned sub-tasks
  phase: "recon" | "enum" | "vuln" | "exploit" | "post" | "report";
  title: string;
  status: "pending" | "running" | "success" | "failed" | "blocked" | "skipped";
  risk_level: "green" | "yellow" | "red";
  priority: 1 | 2 | 3 | 4 | 5; // 1 = highest
  assigned_agent: string | null;
  commands: string[];
  findings: Finding[];
  cvss_score: number | null;
  epss_score: number | null;
  mitre_technique: string | null;
  retry_count: number;
  max_retries: number;
  created_at: number;
  started_at: number | null;
  completed_at: number | null;
  hitl_approval: {
    required: boolean;
    approved_by: string | null;
    approved_at: number | null;
    denied_at: number | null;
    timeout_at: number;
  };
}

export class PenetrationTaskGraph {
  nodes: Map<string, PTGNode> = new Map();

  addNode(node: PTGNode) {
    this.nodes.set(node.task_id, node);
  }

  getNode(id: string): PTGNode | undefined {
    return this.nodes.get(id);
  }

  getExecutableTasks(): PTGNode[] {
    return Array.from(this.nodes.values()).filter((n) => 
      n.status === "pending" && 
      n.parent_ids.every(parentId => this.nodes.get(parentId)?.status === "success")
    ).sort((a, b) => a.priority - b.priority);
  }
}
