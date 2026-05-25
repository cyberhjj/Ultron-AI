import { PTGNode, PenetrationTaskGraph } from '../ptg';

export async function decideNextTask(graph: PenetrationTaskGraph): Promise<PTGNode | null> {
  const executableTasks = graph.getExecutableTasks();
  
  if (executableTasks.length === 0) {
    return null; // No tasks ready
  }

  // Basic reasoning: return the highest priority task.
  // In a full implementation, this uses Claude Extended Thinking to analyze context.
  const nextTask = executableTasks[0];
  console.log(`[Module: Reasoning] Selected Task: ${nextTask.title} (Phase: ${nextTask.phase})`);
  
  return nextTask;
}
