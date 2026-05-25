import { Finding, PTGNode } from '../ptg';
import { writeFindingToKG } from '../../neo4j';

export async function storeMemory(sessionId: string, task: PTGNode, findings: Finding[]) {
  console.log(`[Module: Memory] Storing ${findings.length} findings for session ${sessionId}`);
  
  for (const finding of findings) {
    if (finding.type === 'vulnerability' && finding.cve_ids.length > 0) {
      await writeFindingToKG(sessionId, "192.168.1.1", finding.cve_ids[0]);
    }
  }
  
  // Here we would also call Convex mutations to save the PTG state and messages
}
