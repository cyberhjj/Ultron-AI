import neo4j from 'neo4j-driver';

// Initialize Neo4j driver
// In development, this will fail gracefully if keys aren't provided yet
const uri = process.env.MEMGRAPH_URI || 'bolt://localhost:7687';
const user = process.env.MEMGRAPH_USER || '';
const password = process.env.MEMGRAPH_PASSWORD || '';

export const kgClient = neo4j.driver(uri, neo4j.auth.basic(user, password));

export async function writeFindingToKG(sessionId: string, hostIp: string, vulnCve: string) {
  const session = kgClient.session();
  try {
    // Basic Cypher query to log an attack path
    await session.run(`
      MERGE (h:Host {ip: $hostIp})
      MERGE (v:Vulnerability {cve_id: $vulnCve})
      MERGE (h)-[:AFFECTED_BY]->(v)
      MERGE (s:Session {id: $sessionId})
      MERGE (v)-[:EXPLOITED_BY]->(s)
    `, { hostIp, vulnCve, sessionId });
  } finally {
    await session.close();
  }
}
