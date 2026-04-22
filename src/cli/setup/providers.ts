import type { Provider, Scope, EnvBlock } from './types.js';
import { buildMcpEntry } from './config-writer.js';
import * as claudeDesktop from './providers/claude-desktop.js';
import * as claudeCode from './providers/claude-code.js';
import * as cursor from './providers/cursor.js';
import * as vscode from './providers/vscode.js';
import * as windsurf from './providers/windsurf.js';
import * as opencode from './providers/opencode.js';
import * as codex from './providers/codex.js';
import * as manual from './providers/manual.js';

export async function configureProvider(
  provider: Provider,
  scope: Scope,
  envBlock: EnvBlock,
): Promise<string | null> {
  const entry = buildMcpEntry(envBlock);

  switch (provider) {
    case 'claude-desktop':
      return claudeDesktop.configure(entry);
    case 'claude-code':
      return claudeCode.configure(entry, scope);
    case 'cursor':
      return cursor.configure(entry, scope);
    case 'vscode':
      return vscode.configure(entry);
    case 'windsurf':
      return windsurf.configure(entry);
    case 'opencode':
      return opencode.configure(entry, scope);
    case 'codex':
      return codex.configure(entry, scope);
    case 'manual':
      manual.printConfig(entry);
      return null;
  }
}
