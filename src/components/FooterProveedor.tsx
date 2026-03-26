'use client'

import Image from 'next/image'

export const FooterProveedor = ({ onLogout }: { onLogout: () => void }) => (
  <div className="footer">
    <div className="footer-logo">
      <Image alt="CREW Logo" height={48} src="/logo.png" unoptimized width={48} />
    </div>
    <div className="footer-text">
      CREW
      <br />
      <span style={{ fontSize: 10, opacity: 0.6 }}>powered by MANOBOT</span>
    </div>
    <button className="logout-btn" onClick={onLogout} type="button">
      Cerrar Sesión
    </button>
  </div>
)
