import { z } from 'zod';
import { hexColorSchema, uuidSchema } from './common.js';

export const categoryKinds = ['expense', 'income'] as const;
export const categoryKindSchema = z.enum(categoryKinds);
export type CategoryKind = z.infer<typeof categoryKindSchema>;

export const createCategorySchema = z.strictObject({
  name: z.string().trim().min(1, 'dê um nome à categoria').max(40),
  /** Nome do ícone lucide, ex.: `shopping-cart`. */
  icon: z.string().trim().min(1).max(40),
  color: hexColorSchema,
  kind: categoryKindSchema,
  parentId: uuidSchema.nullish(),
});

export const updateCategorySchema = z.strictObject({
  name: z.string().trim().min(1).max(40).optional(),
  icon: z.string().trim().min(1).max(40).optional(),
  color: hexColorSchema.optional(),
  kind: categoryKindSchema.optional(),
  parentId: uuidSchema.nullish(),
});

export const listCategoriesQuerySchema = z.strictObject({
  kind: categoryKindSchema.optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export interface CategoryDTO {
  id: string;
  name: string;
  icon: string;
  color: string;
  kind: CategoryKind;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Semeadas na criação do usuário. Ícones são nomes do lucide; a cor sai da
 * `accentPalette` para o extrato não virar arco-íris.
 */
export const defaultCategories: ReadonlyArray<{
  name: string;
  icon: string;
  color: string;
  kind: CategoryKind;
}> = [
  { name: 'Mercado', icon: 'shopping-cart', color: '#00A868', kind: 'expense' },
  { name: 'Restaurante', icon: 'utensils', color: '#F5A623', kind: 'expense' },
  { name: 'Transporte', icon: 'car-front', color: '#0A84D1', kind: 'expense' },
  { name: 'Moradia', icon: 'house', color: '#8E6B3F', kind: 'expense' },
  { name: 'Saúde', icon: 'heart-pulse', color: '#E24141', kind: 'expense' },
  { name: 'Educação', icon: 'graduation-cap', color: '#4A4A9E', kind: 'expense' },
  { name: 'Lazer', icon: 'party-popper', color: '#D10A8E', kind: 'expense' },
  { name: 'Assinaturas', icon: 'repeat', color: '#8A6D3B', kind: 'expense' },
  { name: 'Compras', icon: 'shopping-bag', color: '#0AB5B5', kind: 'expense' },
  { name: 'Contas', icon: 'file-text', color: '#5A4A1F', kind: 'expense' },
  { name: 'Outros', icon: 'circle-ellipsis', color: '#71717A', kind: 'expense' },
  { name: 'Salário', icon: 'wallet', color: '#00A868', kind: 'income' },
  { name: 'Freelance', icon: 'laptop', color: '#0A84D1', kind: 'income' },
  { name: 'Rendimentos', icon: 'trending-up', color: '#B8860B', kind: 'income' },
  { name: 'Reembolso', icon: 'undo-2', color: '#71717A', kind: 'income' },
];
