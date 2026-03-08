export const FooterAdmin = ({ className = '' }: { className?: string }) => (
    <footer
      className={`py-8 text-center text-[13px] ${className}`.trim()}
      style={{ color: 'var(--text-secondary)' }}
    >
      <div>CREW • Sistema de Validación Documental</div>
      <div className="mt-1 text-[11px] opacity-60">powered by MANOBOT</div>
    </footer>
  );
