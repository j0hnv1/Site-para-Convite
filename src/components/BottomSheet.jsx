import { useEffect, useRef, useState } from 'react';

const EXIT_MS = 260;

/**
 * Janela que sobe de baixo (usada por Localização, Dress code e Confirmar
 * presença). Fecha com ×, toque fora ou Esc; devolve o foco a quem a abriu.
 */
export default function BottomSheet({ open, title, onClose, children, id }) {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  const sheet = useRef(null);
  const closeBtn = useRef(null);
  const opener = useRef(null);

  useEffect(() => {
    if (open) {
      opener.current = document.activeElement;
      setClosing(false);
      setMounted(true);
      return undefined;
    }
    if (!mounted) return undefined;
    setClosing(true);
    const t = setTimeout(() => {
      setMounted(false);
      setClosing(false);
      opener.current?.focus?.({ preventScroll: true });
    }, EXIT_MS);
    return () => clearTimeout(t);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open && mounted) closeBtn.current?.focus({ preventScroll: true });
  }, [open, mounted]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && sheet.current) {
        const items = sheet.current.querySelectorAll('a[href], button:not([disabled]), input, select, textarea');
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!mounted) return null;
  return (
    <div className={`sheet-root${closing ? ' is-closing' : ''}`}>
      <div className="sheet-backdrop" onClick={onClose} />
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        ref={sheet}
      >
        <div className="sheet__head">
          <h2 className="sheet__title" id={`${id}-title`}>
            {title}
          </h2>
          <button
            type="button"
            className="sheet__close"
            onClick={onClose}
            aria-label="Fechar"
            ref={closeBtn}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="sheet__body">{children}</div>
      </div>
    </div>
  );
}
