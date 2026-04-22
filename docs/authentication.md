# Authentication

← [Back to README](../README.md)

---

## Overview

atlassian-mcp supports two authentication methods:

| Method | When to use |
|--------|-------------|
| **Basic Auth** (email + API token) | Atlassian Cloud, or Server/DC with username + password |
| **PAT** (Personal Access Token) | Jira/Confluence Server or Data Center |

The auth method is **automatically detected** based on which env vars are present: if `JIRA_PERSONAL_TOKEN` is set, PAT is used; otherwise Basic Auth is assumed.

---

## Basic Auth — Atlassian Cloud

### Step 1: Create an API token

1. Go to [id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click **Create API token**
3. Give it a descriptive label (e.g. `atlassian-mcp`)
4. Copy the token — it won't be shown again

### Step 2: Configure env vars

```json
{
  "env": {
    "JIRA_URL": "https://your-company.atlassian.net",
    "JIRA_USERNAME": "your.email@company.com",
    "JIRA_API_TOKEN": "your_api_token"
  }
}
```

> **Note:** `JIRA_USERNAME` must be your **email address** for Atlassian Cloud, not your display name or username.

---

## Basic Auth — Jira/Confluence Server or Data Center

For older Server/DC instances that use username + password:

```json
{
  "env": {
    "JIRA_URL": "https://jira.your-company.com",
    "JIRA_USERNAME": "your_username",
    "JIRA_API_TOKEN": "your_password"
  }
}
```

> **Note:** Use your login password as `JIRA_API_TOKEN`. For better security, create a Personal Access Token instead (see below).

---

## PAT — Personal Access Token (Server/DC)

PATs are the recommended auth method for Jira/Confluence Server 8.14+ and Data Center.

### Step 1: Create a PAT

**Jira:**
1. Go to your profile → **Personal Access Tokens** (or navigate to `/secure/ViewProfile.jspa`)
2. Click **Create token**
3. Set a name and optional expiry
4. Copy the token

**Confluence:**
1. Go to your profile → **Personal Access Tokens**
2. Click **Create token**
3. Copy the token

### Step 2: Configure env vars

```json
{
  "env": {
    "JIRA_URL": "https://jira.your-company.com",
    "JIRA_PERSONAL_TOKEN": "your_pat_token",

    "CONFLUENCE_URL": "https://confluence.your-company.com",
    "CONFLUENCE_PERSONAL_TOKEN": "your_confluence_pat"
  }
}
```

> When `JIRA_PERSONAL_TOKEN` is set, `JIRA_USERNAME` and `JIRA_API_TOKEN` are ignored for Jira. Same for Confluence.

---

## Separate credentials per service

Jira and Confluence credentials are **independent**. You can use different tokens for each:

```json
{
  "env": {
    "JIRA_URL": "https://your-company.atlassian.net",
    "JIRA_USERNAME": "your.email@company.com",
    "JIRA_API_TOKEN": "jira_token",

    "CONFLUENCE_URL": "https://your-company.atlassian.net/wiki",
    "CONFLUENCE_USERNAME": "your.email@company.com",
    "CONFLUENCE_API_TOKEN": "confluence_token"
  }
}
```

Or PAT for Server/DC with different credentials:

```json
{
  "env": {
    "JIRA_URL": "https://jira.company.com",
    "JIRA_PERSONAL_TOKEN": "jira_pat",

    "CONFLUENCE_URL": "https://wiki.company.com",
    "CONFLUENCE_PERSONAL_TOKEN": "confluence_pat"
  }
}
```

---

## SSL verification

SSL verification is **enabled by default**. For internal instances with self-signed certificates:

```json
{
  "env": {
    "JIRA_URL": "https://jira.internal.company.com",
    "JIRA_USERNAME": "user",
    "JIRA_API_TOKEN": "token",
    "JIRA_SSL_VERIFY": "false"
  }
}
```

> **Warning:** Only disable SSL verification on trusted internal networks. Never disable it for public Atlassian Cloud instances.

---

## Troubleshooting auth errors

| Error | Likely cause | Solution |
|-------|-------------|----------|
| `Authentication failed` (401) | Wrong credentials | Double-check username and token |
| `Insufficient permissions` (403) | Token lacks access | Ensure the token has read access to the target project/space |
| `Resource not found` (404) | Wrong URL | Check `JIRA_URL` doesn't have a trailing path component |

See [Troubleshooting](troubleshooting.md) for more details.
