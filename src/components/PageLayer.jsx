import { useEffect, useRef } from 'react';

/**
 * Uma "camada de página": fundo desfocado (preenche as sobras da tela sem
 * esticar a imagem) + quadro 9:16 onde a página é desenhada.
 *
 * mode: 'enter' | 'leave' | 'idle'   kind: reveal | rise | forward | back
 */
export default function PageLayer({ bg, label, mode = 'idle', kind, children }) {
  const frame = useRef(null);

  useEffect(() => {
    if (mode === 'enter') frame.current?.focus({ preventScroll: true });
  }, [mode]);

  const cls = mode === 'idle' ? '' : ` layer--${mode}-${kind}`;
  return (
    <div className={`layer${cls}`}>
      <div className="layer__bg" style={{ backgroundImage: `url("${bg}")` }} aria-hidden="true" />
      <section className="frame" aria-label={label} tabIndex={-1} ref={frame}>
        {children}
      </section>
    </div>
  );
}
