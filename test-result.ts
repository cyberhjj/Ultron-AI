import { createOpenAI } from "@ai-sdk/openai";
import { streamText, tool } from "ai";

const nvidia = createOpenAI({
  baseURL: process.env.LLM_BASE_URL ?? "https://integrate.api.nvidia.com/v1",
  apiKey: "dummy",
});

async function run() {
  const result = streamText({
    model: nvidia("meta/llama-3.1-70b-instruct"),
    messages: [{ role: "user", content: "hi" }]
  });
  console.log("Methods on result:", Object.keys(result));
}
run();
