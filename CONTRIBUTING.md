# Contributing

## Development setup

**Requirements:** Node.js 20+

```bash
# Clone and install
git clone https://github.com/your-org/atlassian-mcp
cd atlassian-mcp
npm install

# Run in development mode (no build step)
npm run dev

# Run tests
npm test

# Type check
npm run typecheck

# Lint
npm run lint

# Format
npm run format
```

---

## Project structure

```
src/
  index.ts              CLI entry point
  server.ts             MCP server setup and transport wiring
  config/
    schema.ts           Zod validation schemas
    loader.ts           Environment variable loading
  http/
    client.ts           BaseHttpClient (auth, retry, error mapping)
    jira.client.ts      Jira-specific HTTP client
    confluence.client.ts Confluence-specific HTTP client
  modules/
    jira/
      issues/           jira_search, jira_get_issue
      projects/         jira_get_projects, jira_get_fields
    confluence/
      pages/            confluence_search, confluence_get_page, confluence_get_page_children
      spaces/           confluence_get_spaces
  shared/
    errors.ts           Typed error hierarchy
    logger.ts           Winston logger with secret redaction
    registry.ts         Tool registration and read-only filtering
tests/
  unit/                 Vitest unit tests (mocked HTTP)
```

---

## Adding a new tool

1. **Add types** — if new API response types are needed, add Zod schemas to the module's `types.ts`

2. **Add service method** — implement the API call in the module's `service.ts`:
   ```ts
   async myNewMethod(param: string): Promise<MyType> {
     const data = await this.client.get<unknown>(`/endpoint/${param}`);
     return MyTypeSchema.parse(data);
   }
   ```

3. **Add tool definition** — add a `ToolDefinition` to the module's `tools.ts`:
   ```ts
   const myTool: ToolDefinition = {
     name: 'jira_my_tool',
     description: 'Description of what this tool does.',
     inputSchema: {
       param: z.string().describe('Description of the parameter'),
     },
     readonly: true,
     async handler({ param }: { param: string }) {
       try {
         const result = await service.myNewMethod(param);
         return formatResult(result);
       } catch (err) {
         return `Error: ${toToolError(err)}`;
       }
     },
   };
   ```

4. **Export from factory** — include the new tool in the `create*Tools` return array

5. **Write tests** — add unit tests in `tests/unit/`

6. **Update docs** — add the tool to [docs/tools-reference.md](docs/tools-reference.md)

---

## Code style

- **TypeScript strict mode** — all code must pass `tsc --noEmit` with no errors
- **ESM imports** — always use `.js` extension for local imports: `import from './schema.js'`
- **Type imports** — use `import type` for type-only imports
- **No `any`** — avoid `any` except in the registry layer where it's intentional (marked with eslint comments)
- **Zod validation** — all external API responses must be parsed through a Zod schema before use
- **Error handling in tools** — tool handlers must never throw; catch errors and return a string message
- **No comments** — only add a comment when the *why* is non-obvious; well-named identifiers are self-documenting

---

## Commit messages

Use the conventional commits format:

```
feat: add jira_get_sprint_issues tool
fix: handle 429 rate limit on Confluence search
docs: add CQL guide examples
refactor: extract text formatter to shared utility
test: add unit tests for ConfluenceSpacesService
```

---

## Pull request checklist

- [ ] `npm run typecheck` passes with no errors
- [ ] `npm test` passes
- [ ] New tools are documented in `docs/tools-reference.md`
- [ ] The tool is read-only (or explicitly justified if write access is needed)
- [ ] No credentials or sensitive data in test fixtures
