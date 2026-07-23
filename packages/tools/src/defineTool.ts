import type { Tool, ToolContext } from '@ourai/agent-core';
import type { ToolDefinition } from '@ourai/model-gateway';

export interface ToolSpec<Args, Result> {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (args: Args, ctx: ToolContext) => Promise<Result>;
}

/** Builds a Tool, deriving the OpenAI-compatible `toDefinition()` for you. */
export function defineTool<Args = unknown, Result = unknown>(
  spec: ToolSpec<Args, Result>,
): Tool<Args, Result> {
  return {
    name: spec.name,
    description: spec.description,
    parameters: spec.parameters,
    toDefinition(): ToolDefinition {
      return {
        type: 'function',
        function: { name: spec.name, description: spec.description, parameters: spec.parameters },
      };
    },
    execute: spec.execute,
  };
}

/** Placeholder body shared by scaffold tool stubs. */
export function notImplemented(tool: string, phase: string): never {
  throw new Error(`${tool}: not implemented (${phase})`);
}
