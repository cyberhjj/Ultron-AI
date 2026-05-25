const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env.local') });

async function main() {
  const apiKey = process.env.NEXT_PUBLIC_LLM_API_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_LLM_BASE_URL;
  console.log("Base URL:", baseUrl);
  
  try {
    const res = await fetch(`${baseUrl}/models`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status} - ${await res.text()}`);
    }
    const data = await res.json();
    const models = data.data.map(m => m.id);
    console.log("All llama/meta models:");
    const filtered = models.filter(m => m.includes('llama') || m.includes('meta'));
    console.log(JSON.stringify(filtered, null, 2));
  } catch (e) {
    console.error("Error fetching models:", e);
  }
}
main();
