import { z } from 'zod'

import { isValidCuit } from '@/lib/utils/cuit'

const cuilRegex = /^\d{2}-\d{8}-\d{1}$/

const cuilSchema = z
  .string()
  .min(1, 'CUIL requerido')
  .regex(cuilRegex, 'Formato inválido. Ej: 20-12345678-9')
  .refine(isValidCuit, 'CUIL con dígito verificador inválido')

/* eslint-disable camelcase -- Zod schema mirrors DB snake_case column names */
export const createEmployeeSchema = z.object({
  company_id: z.string().uuid('Seleccione una empresa'),
  cuil: cuilSchema,
  email: z.string().email('Email inválido').trim(),
  has_dashboard_access: z.boolean().default(false),
  name: z.string().min(2, 'Mínimo 2 caracteres').max(200).trim(),
  phone: z.string().max(50).optional().or(z.literal('')),
  position: z.string().min(1, 'Puesto requerido').max(200).trim(),
  status: z.enum(['Activo', 'Inactivo']).default('Activo'),
})

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>

export const updateEmployeeSchema = createEmployeeSchema
  .omit({ has_dashboard_access: true })
  .partial()
/* eslint-enable camelcase */

export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>
