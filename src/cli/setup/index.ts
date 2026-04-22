import * as p from '@clack/prompts';
import { runWizard } from './wizard.js';
import { configureProvider } from './providers.js';
import { generateSkills } from './skills.js';
import { buildEnvBlock } from './config-writer.js';
import { SetupError } from './types.js';

export async function runSetup(): Promise<void> {
  try {
    const result = await runWizard();
    const envBlock = buildEnvBlock(result.services);

    const configPath = await configureProvider(result.provider, result.scope, envBlock);
    if (configPath) {
      p.note(`Written to ${configPath}`, 'MCP config');
    }

    if (result.generateSkills) {
      const skillPath = await generateSkills(result.provider, result.skillScope);
      if (skillPath) {
        p.note(`Written to ${skillPath}`, 'Skill file');
      }
    }

    p.outro('Done! Restart your AI client to pick up the new configuration.');
  } catch (err) {
    if (err instanceof SetupError) {
      p.cancel(err.message);
      process.exit(1);
    }
    throw err;
  }
}
