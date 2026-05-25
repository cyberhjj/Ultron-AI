import { QdrantClient } from '@qdrant/js-client-rest';

const qdrantUrl = process.env.QDRANT_URL || 'http://localhost:6333';
const qdrantApiKey = process.env.QDRANT_API_KEY || '';

export const qdrant = new QdrantClient({
  url: qdrantUrl,
  apiKey: qdrantApiKey,
});

export async function searchCVEs(queryVector: number[], collection = 'cve_exploits', topK = 5) {
  try {
    return await qdrant.search(collection, {
      vector: queryVector,
      limit: topK,
    });
  } catch (error) {
    console.error('[Qdrant Search Error]', error);
    return [];
  }
}
