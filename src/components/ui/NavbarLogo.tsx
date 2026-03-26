import Image from 'next/image'
import Link from 'next/link'

interface NavbarLogoProps {
  href: string
  label?: string
}

/**
 * Logo reutilizable para el navbar (usa /public/logo.png).
 */
export const NavbarLogo = ({
  href,
  label = 'VALID - Sistema de Validación Documental',
}: NavbarLogoProps) => (
  <Link aria-label={label} className="flex items-center gap-2" href={href}>
    <Image
      alt={label}
      height={24}
      priority
      src="/logo.png"
      style={{ height: '24px', width: 'auto' }}
      unoptimized
      width={96}
    />
  </Link>
)
