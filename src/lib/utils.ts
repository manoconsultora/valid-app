/**
 * Utilidades compartidas (ej: cn para clases, formateadores).
 */

export const cn = (...classes: (string | undefined | false)[]): string =>
  classes.filter(Boolean).join(' ')
