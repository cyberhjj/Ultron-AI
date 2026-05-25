import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  console.log("BASE_URL", process.env.NEXT_PUBLIC_LLM_BASE_URL);
  const nvidia = createOpenAI({
    baseURL: process.env.NEXT_PUBLIC_LLM_BASE_URL,
    apiKey: process.env.NEXT_PUBLIC_LLM_API_KEY,
  });

  try {
    const { text } = await generateText({
      model: nvidia.chat('meta/llama-3.1-70b-instruct'),
      prompt: 'Hello',
    });
    console.log(text);
  } catch (e) {
    console.error("ERROR:");
    console.error(e);
  }
}
main();
