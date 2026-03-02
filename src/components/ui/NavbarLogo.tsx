import Image from 'next/image'
import Link from 'next/link'

interface NavbarLogoProps {
  href: string
  label?: string
}

/**
 * Logo reutilizable para el navbar (usa /public/logo.png).
 */
export function NavbarLogo({
  href,
  label = 'VALID - Sistema de Validación Documental',
}: NavbarLogoProps) {
  return (
    <Link href={href} className="flex items-center gap-2" aria-label={label}>
      <Image
        src="/logo.png"
        alt={label}
        width={96}
        height={24}
        priority
        style={{ height: '24px', width: 'auto' }}
      />
    </Link>
  )
}

