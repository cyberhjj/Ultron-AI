import { createOpenAI } from '@ai-sdk/openai';
import { generateText, tool } from 'ai';
import { z } from 'zod';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const nvidia = createOpenAI({
    baseURL: process.env.NEXT_PUBLIC_LLM_BASE_URL,
    apiKey: process.env.NEXT_PUBLIC_LLM_API_KEY,
  });

  try {
    const { text, toolCalls } = await generateText({
      model: nvidia.chat('meta/llama-3.1-70b-instruct'),
      prompt: 'hi',
      tools: {
        execute_bash: tool({
          description: 'Execute a bash command',
          parameters: z.object({
            command: z.string(),
          }),
          // @ts-ignore
          execute: async ({ command }) => 'hello',
        }),
      }
    });
    console.log("TEXT:", text);
    console.log("TOOL CALLS:", toolCalls);
  } catch (e) {
    console.error("ERROR:");
    console.error(e);
  }
}
main();
