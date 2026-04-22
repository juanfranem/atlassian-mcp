import { z } from 'zod';

export const JiraUserSchema = z.object({
  accountId: z.string(),
  displayName: z.string(),
  emailAddress: z.string().optional(),
  active: z.boolean().optional(),
});

export const JiraPrioritySchema = z.object({
  id: z.string(),
  name: z.string(),
  iconUrl: z.string().optional(),
});

export const JiraStatusSchema = z.object({
  id: z.string(),
  name: z.string(),
  statusCategory: z
    .object({ name: z.string(), colorName: z.string().optional() })
    .optional(),
});

export const JiraIssueTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  subtask: z.boolean().optional(),
});

export const JiraFieldsSchema = z.object({
  summary: z.string(),
  description: z.unknown().optional(),
  status: JiraStatusSchema.optional(),
  assignee: JiraUserSchema.nullable().optional(),
  reporter: JiraUserSchema.nullable().optional(),
  priority: JiraPrioritySchema.nullable().optional(),
  issuetype: JiraIssueTypeSchema.optional(),
  created: z.string().optional(),
  updated: z.string().optional(),
  duedate: z.string().nullable().optional(),
  labels: z.array(z.string()).optional(),
  fixVersions: z.array(z.object({ name: z.string() })).optional(),
  components: z.array(z.object({ name: z.string() })).optional(),
  comment: z
    .object({
      total: z.number(),
      comments: z.array(
        z.object({
          id: z.string(),
          author: JiraUserSchema,
          body: z.unknown(),
          created: z.string(),
          updated: z.string(),
        }),
      ),
    })
    .optional(),
});

export const JiraIssueSchema = z.object({
  id: z.string(),
  key: z.string(),
  self: z.string(),
  fields: JiraFieldsSchema,
});

export const JiraSearchResponseSchema = z.object({
  total: z.number(),
  maxResults: z.number(),
  startAt: z.number(),
  issues: z.array(JiraIssueSchema),
});

export const JiraProjectSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  projectTypeKey: z.string().optional(),
  lead: JiraUserSchema.optional(),
  description: z.string().optional(),
});

export const JiraProjectListSchema = z.object({
  values: z.array(JiraProjectSchema),
  total: z.number().optional(),
  isLast: z.boolean().optional(),
});

export const JiraFieldSchema = z.object({
  id: z.string(),
  name: z.string(),
  custom: z.boolean(),
  orderable: z.boolean().optional(),
  searchable: z.boolean().optional(),
  schema: z
    .object({ type: z.string(), custom: z.string().optional() })
    .optional(),
});

export type JiraIssue = z.infer<typeof JiraIssueSchema>;
export type JiraSearchResponse = z.infer<typeof JiraSearchResponseSchema>;
export type JiraProject = z.infer<typeof JiraProjectSchema>;
export type JiraField = z.infer<typeof JiraFieldSchema>;
