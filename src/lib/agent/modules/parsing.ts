import { Finding } from '../ptg';

export async function parseOutput(command: string, stdout: string, stderr: string): Promise<Finding[]> {
  console.log(`[Module: Parsing] Parsing output for: ${command}`);
  
  // In production, this uses an LLM to parse raw stdout into structured Findings
  const findings: Finding[] = [];
  
  if (stdout.includes("open") || stdout.includes("80/tcp")) {
    findings.push({
      type: "open_port",
      severity: "info",
      description: "Found open port 80",
      raw_output: stdout,
      cve_ids: [],
      cvss_score: 0,
      epss_score: 0,
      remediation: "None",
      evidence: "Port 80/tcp open"
    });
  }
  
  return findings;
}
