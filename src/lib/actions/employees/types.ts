export type EmployeeRow = {
  id: string
  name: string
  cuil: string
  company_id: string
  position: string
  email: string
  phone: string | null
  status: 'Activo' | 'Inactivo'
  user_id: string | null
  created_at: string
  updated_at: string
}

/** EmployeeRow + auth status for employees with dashboard access. */
export type EmployeeRowWithStatus = EmployeeRow & { last_sign_in_at: string | null }
