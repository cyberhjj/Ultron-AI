import { getOrCreateSandbox, addSandboxLog } from "@/lib/sandbox-manager";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { command, sessionId } = await req.json();

    if (!command) {
      return NextResponse.json({ error: "Command is required" }, { status: 400 });
    }

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required to reuse the persistent sandbox" }, { status: 400 });
    }

    console.log(`[execute-approved] Executing human-approved command in session ${sessionId}: ${command}`);

    try {
      // Reuse the persistent sandbox from the chat session
      const sandbox = await getOrCreateSandbox(sessionId);
      const result = await sandbox.commands.run(command, { timeoutMs: 55000 });
      
      // Store log
      addSandboxLog(sessionId, command, result.stdout + (result.stderr ? "\n" + result.stderr : ""));

      console.log(`[execute-approved] Execution completed: exit code ${result.exitCode}`);
      return NextResponse.json({ stdout: result.stdout, stderr: result.stderr });
    } catch (err: any) {
      console.error(`[execute-approved] E2B execution error:`, err);
      // Store failed log
      addSandboxLog(sessionId, command, `ERROR: ${err.message}`);
      return NextResponse.json({ error: err.message || "Failed to execute in sandbox" }, { status: 500 });
    }
    // NOTE: We do NOT kill the sandbox here — it's persistent and shared with the chat route
  } catch (err: any) {
    console.error(`[execute-approved] Request parsing error:`, err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
