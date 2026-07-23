import type { Tool } from './types.js';
import type { ToolDefinition } from '@ourai/model-gateway';

/** Holds the tools available to an agent and exposes them as model tool defs. */
export class ToolRegistry {
  private tools = new Map<string, Tool>();

  register(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  list(): Tool[] {
    return [...this.tools.values()];
  }

  definitions(): ToolDefinition[] {
    return this.list().map((tool) => tool.toDefinition());
  }
}
