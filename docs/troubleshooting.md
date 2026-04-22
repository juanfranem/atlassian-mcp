# Troubleshooting

← [Back to README](../README.md)

---

## Server doesn't start

### "No service configured" error

**Symptom:** Server exits immediately with `No service configured. Set JIRA_URL and/or CONFLUENCE_URL environment variables.`

**Cause:** Neither `JIRA_URL` nor `CONFLUENCE_URL` is set.

**Fix:** Ensure at least one URL is present in your env config:

```json
{
  "env": {
    "JIRA_URL": "https://your-company.atlassian.net",
    "JIRA_USERNAME": "your.email@company.com",
    "JIRA_API_TOKEN": "your_token"
  }
}
```

---

### "Invalid auth config" error

**Symptom:** Zod validation error mentioning `Invalid auth config`.

**Cause:** Auth credentials don't match the expected combination for the detected auth type.

**Fix:** Ensure you provide either:
- `username` + `apiToken` for basic auth, or
- `personalToken` for PAT

If `JIRA_PERSONAL_TOKEN` is set, `JIRA_USERNAME` and `JIRA_API_TOKEN` are not required and will be ignored.

---

### Tools not appearing in the MCP client

**Symptom:** The MCP server starts but no tools show up.

**Cause:** The MCP client has not been restarted after adding the config, or there is a config file syntax error.

**Fix:**
1. Validate your JSON config is syntactically correct (use a JSON linter)
2. Fully restart the MCP client (not just reload)
3. Check the client's MCP server logs for startup errors
4. Enable debug logging: add `"LOG_LEVEL": "debug"` to the `env` block and check stderr output

---

## Authentication errors

### 401 — Authentication failed

**Cause:** Wrong username or token.

**Fix:**
- **Cloud:** The `JIRA_USERNAME` must be your **email address**, not your display name
- **Cloud:** Regenerate the API token at [id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
- **Server/DC:** Check that the username and password (or PAT) are correct
- Ensure there are no trailing spaces or newlines in the token value

---

### 403 — Insufficient permissions

**Cause:** The token is valid but the user doesn't have access to the requested resource.

**Fix:**
- Ensure the user account has **Browse Projects** permission in Jira
- Ensure the user has **View** access to the Confluence space
- For Data Center, check that the PAT has not been restricted to specific resources

---

### 404 on correct URL

**Cause:** The URL path is wrong or the resource doesn't exist.

**Fix:**
- **Jira Cloud:** URL should be `https://company.atlassian.net` (no trailing slash, no `/jira`)
- **Confluence Cloud:** URL should be `https://company.atlassian.net/wiki`
- **Server/DC:** URL should be the root of the application, e.g. `https://jira.company.com`
- Verify the issue key or page ID exists and is accessible to your user

---

## Connection errors

### SSL certificate error

**Symptom:** Error containing `UNABLE_TO_VERIFY_LEAF_SIGNATURE` or `certificate verify failed`.

**Cause:** The Atlassian instance uses a self-signed or internally-signed certificate.

**Fix:**

```json
{
  "env": {
    "JIRA_URL": "https://jira.internal.company.com",
    "JIRA_SSL_VERIFY": "false"
  }
}
```

> Only disable SSL verification on trusted internal networks.

---

### Connection timeout

**Symptom:** Requests fail with a timeout error.

**Cause:** The Atlassian instance is slow, unreachable, or behind a proxy.

**Fix:**
- Increase the timeout: `"JIRA_TIMEOUT_MS": "60000"` (60 seconds)
- If behind a proxy: `"HTTPS_PROXY": "https://proxy.company.com:8443"`
- Check that the URL is reachable from the machine running the MCP server

---

### Proxy issues

**Symptom:** Requests fail with `ECONNREFUSED` or similar network errors.

**Fix:**
- Add `"HTTPS_PROXY"` or `"HTTP_PROXY"` to the env config
- `HTTPS_PROXY` takes precedence over `HTTP_PROXY`
- Proxy URL format: `https://proxy.host:port`

---

## Rate limiting

**Symptom:** Requests fail with `Rate limit exceeded`.

**Cause:** Too many requests to the Atlassian API in a short period.

**Fix:** The server automatically retries up to 3 times with exponential backoff. If rate limiting persists:
- Reduce the frequency of queries
- Avoid running many large searches in parallel
- Atlassian Cloud has a rate limit of approximately 10 requests per second per user

---

## Jira-specific issues

### Custom fields not appearing

**Symptom:** Custom fields are missing from issue details.

**Cause:** The default field list doesn't include all custom fields.

**Fix:** Use `jira_get_fields` to find the custom field ID, then reference it in JQL:

```json
{
  "tool": "jira_get_fields",
  "args": {}
}
```

Look for your field in the output (format: `customfield_10XXX`).

---

### JQL query returns no results

**Cause:** Wrong project key, status value, or date format.

**Fix:**
- Use `jira_get_projects` to confirm the exact project key
- Status values are case-sensitive in some Jira configurations
- Wrap values with spaces in double quotes: `status = "In Progress"`
- See the [JQL Guide](guides/jql-guide.md) for correct syntax

---

## Confluence-specific issues

### Page content is truncated

**Cause:** Very long pages are truncated to 2000 characters in the response to keep answers manageable.

**Fix:** Use the page ID to navigate to child pages, or ask follow-up questions to explore specific sections.

---

### Space key not found

**Cause:** Wrong space key or the user doesn't have access to the space.

**Fix:** Use `confluence_get_spaces` to see all accessible spaces and their keys:

```json
{
  "tool": "confluence_get_spaces",
  "args": { "limit": 100 }
}
```

---

## Enabling debug logs

Add `"LOG_LEVEL": "debug"` to your env config to see detailed request/response information. Logs go to `stderr` and can be inspected in the MCP client's server log output.

> Authorization headers are always redacted — tokens are never logged regardless of log level.

---

## Still stuck?

1. Enable debug logging and look for specific error messages
2. Test your credentials directly with the Atlassian REST API:
   ```bash
   curl -u "your.email@company.com:your_api_token" \
     "https://your-company.atlassian.net/rest/api/3/myself"
   ```
3. Check that the Atlassian instance is reachable from your machine:
   ```bash
   curl -I "https://your-company.atlassian.net"
   ```
