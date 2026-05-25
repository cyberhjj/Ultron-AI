import { PTGNode } from '../ptg';

const TOOL_RISK: Record<string, "green" | "yellow" | "red"> = {
  "nmap -sn": "green",
  "nmap -sV": "green",
  "subfinder": "green",
  "sqlmap": "yellow",
  "nikto": "yellow",
  "metasploit": "red",
  "nc -e": "red",
  "bash -i": "red"
};

export async function generateCommand(task: PTGNode, intelligenceContext: any) {
  // In production, this calls the LLM to generate the command based on context
  const command = task.title.includes('nmap') ? 'nmap -sV target.com' : 'echo "test"';
  
  let riskLevel: "green" | "yellow" | "red" = "green";
  for (const [key, risk] of Object.entries(TOOL_RISK)) {
    if (command.includes(key)) {
      riskLevel = risk;
      break;
    }
  }

  console.log(`[Module: Generation] Generated Command: ${command} [Risk: ${riskLevel.toUpperCase()}]`);
  
  return {
    command,
    riskLevel
  };
}
