import { z } from 'zod'

import { isValidCuit } from '@/lib/utils/cuit'

const cuitRegex = /^\d{2}-\d{8}-\d{1}$/

const cuitSchema = z
  .string()
  .min(1, 'CUIT requerido')
  .regex(cuitRegex, 'Formato inválido. Ej: 30-12345678-9')
  .refine(isValidCuit, 'CUIT con dígito verificador inválido')

export const providerCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
})

/* eslint-disable camelcase -- Zod schema mirrors DB snake_case column names */
export const createProviderSchema = z.object({
  category_id: z.string().uuid('Seleccione una categoría'),
  contact_name: z.string().max(200).optional().or(z.literal('')),
  contact_role: z.string().max(200).optional().or(z.literal('')),
  cuit: cuitSchema,
  email: z.string().email('Email corporativo inválido').trim(),
  phone: z.string().max(50).optional().or(z.literal('')),
  razon_social: z.string().min(2, 'Mínimo 2 caracteres').max(200).trim(),
})

export type CreateProviderInput = z.infer<typeof createProviderSchema>

export const updateProviderSchema = createProviderSchema.partial().extend({
  category_id: z.string().uuid().optional(),
  cuit: cuitSchema.optional(),
  email: z.string().email().trim().optional(),
  razon_social: z.string().min(2).max(200).trim().optional(),
})
/* eslint-enable camelcase */

export type UpdateProviderInput = z.infer<typeof updateProviderSchema>
