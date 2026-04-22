import { z } from 'zod';

export const ConfluenceUserSchema = z.object({
  accountId: z.string(),
  displayName: z.string(),
  email: z.string().optional(),
});

export const ConfluenceSpaceSchema = z.object({
  id: z.union([z.string(), z.number()]),
  key: z.string(),
  name: z.string(),
  type: z.string().optional(),
  status: z.string().optional(),
  description: z
    .object({ plain: z.object({ value: z.string() }).optional() })
    .optional(),
});

export const ConfluencePageSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  space: z.object({ key: z.string(), name: z.string().optional() }).optional(),
  version: z.object({ number: z.number(), when: z.string().optional() }).optional(),
  body: z
    .object({
      storage: z.object({ value: z.string(), representation: z.string() }).optional(),
      view: z.object({ value: z.string() }).optional(),
    })
    .optional(),
  ancestors: z
    .array(z.object({ id: z.string(), title: z.string() }))
    .optional(),
  _links: z.object({ webui: z.string().optional() }).optional(),
});

export const ConfluenceSearchResultSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  space: z.object({ key: z.string(), name: z.string().optional() }).optional(),
  excerpt: z.string().optional(),
  _links: z.object({ webui: z.string().optional() }).optional(),
});

export const ConfluenceSearchResponseSchema = z.object({
  results: z.array(ConfluenceSearchResultSchema),
  totalSize: z.number(),
  start: z.number().optional(),
  limit: z.number().optional(),
});

export const ConfluenceSpaceListSchema = z.object({
  results: z.array(ConfluenceSpaceSchema),
  size: z.number().optional(),
  start: z.number().optional(),
  limit: z.number().optional(),
});

export const ConfluencePageListSchema = z.object({
  results: z.array(ConfluencePageSchema),
  size: z.number().optional(),
  start: z.number().optional(),
  limit: z.number().optional(),
});

export type ConfluencePage = z.infer<typeof ConfluencePageSchema>;
export type ConfluenceSpace = z.infer<typeof ConfluenceSpaceSchema>;
export type ConfluenceSearchResponse = z.infer<typeof ConfluenceSearchResponseSchema>;
