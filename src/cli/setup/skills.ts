import type { Provider, Scope } from './types.js';
import * as claudeCodeSkill from './skills/claude-code.js';
import * as cursorSkill from './skills/cursor.js';
import * as windsurfSkill from './skills/windsurf.js';
import * as agentsMd from './skills/agents-md.js';

export async function generateSkills(provider: Provider, scope: Scope): Promise<string | null> {
  switch (provider) {
    case 'claude-code':
      return claudeCodeSkill.generate(scope);
    case 'cursor':
      return cursorSkill.generate(scope);
    case 'windsurf':
      return windsurfSkill.generate(scope);
    default:
      return agentsMd.generate(scope);
  }
}
