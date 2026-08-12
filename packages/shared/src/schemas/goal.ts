import { z } from 'zod';
import { dateOnlySchema, nonNegativeCentsSchema, positiveCentsSchema } from './common.js';

export const createGoalSchema = z.strictObject({
  name: z.string().trim().min(1).max(60),
  targetCents: positiveCentsSchema,
  savedCents: nonNegativeCentsSchema.optional(),
  deadline: dateOnlySchema.nullish(),
});

export const updateGoalSchema = z.strictObject({
  name: z.string().trim().min(1).max(60).optional(),
  targetCents: positiveCentsSchema.optional(),
  savedCents: nonNegativeCentsSchema.optional(),
  deadline: dateOnlySchema.nullish(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;

export interface GoalDTO {
  id: string;
  name: string;
  targetCents: string;
  savedCents: string;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
}
