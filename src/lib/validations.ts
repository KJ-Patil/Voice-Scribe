import { z } from 'zod';

export const SUPPORTED_LANGUAGES = [
  'Hinglish',
  'Hindi',
  'English',
  'Marathi',
  'Tamil',
  'Telugu',
  'Bengali',
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const transcriptionCreateSchema = z.object({
  text: z.string().trim().min(1, 'Transcript text cannot be empty'),
  language: z.string().default('Hinglish'),
  duration_s: z.number().min(0).default(0),
});

export const transcriptionUpdateSchema = z.object({
  text: z.string().trim().min(1, 'Transcript text cannot be empty'),
});

export const transcriptionQuerySchema = z.object({
  search: z.string().optional(),
  language: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type TranscriptionCreateInput = z.infer<typeof transcriptionCreateSchema>;
export type TranscriptionUpdateInput = z.infer<typeof transcriptionUpdateSchema>;
export type TranscriptionQueryInput = z.infer<typeof transcriptionQuerySchema>;
