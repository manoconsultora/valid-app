/**
 * Validación de CUIT argentino (formato XX-XXXXXXXX-X y dígito verificador).
 * Algoritmo: módulo 11 con multiplicadores 5, 4, 3, 2, 7, 6, 5, 4, 3, 2.
 */

const CUIT_FORMAT = /^\d{2}-\d{8}-\d{1}$/
const MULTIPLIERS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]

/**
 * Valida formato XX-XXXXXXXX-X y dígito verificador.
 * @param cuit - CUIT con o sin guiones (se normaliza a 11 dígitos)
 * @returns true si el formato es correcto y el dígito verificador coincide
 */
export function isValidCuit(cuit: string): boolean {
  if (!cuit || typeof cuit !== 'string') return false
  const normalized = cuit.replace(/\D/g, '')
  if (normalized.length !== 11) return false

  let sum = 0
  for (let i = 0; i < 10; i++) {
    const d = parseInt(normalized[i], 10)
    if (Number.isNaN(d)) return false
    sum += d * MULTIPLIERS[i]
  }

  let verifier = 11 - (sum % 11)
  if (verifier === 11) verifier = 0
  else if (verifier === 10) verifier = 9

  const lastDigit = parseInt(normalized[10], 10)
  return !Number.isNaN(lastDigit) && lastDigit === verifier
}

/**
 * Comprueba solo el formato XX-XXXXXXXX-X (sin validar dígito verificador).
 */
export function hasCuitFormat(cuit: string): boolean {
  return CUIT_FORMAT.test((cuit || '').trim())
}
