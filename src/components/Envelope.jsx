import { useEffect, useRef, useState } from 'react';
import left from '../assets/page1-left.webp';
import right from '../assets/page1-right.webp';
import seal from '../assets/page1-seal.webp';
import hint from '../assets/page1-hint.webp';
import { ENVELOPE_LAYOUT as L, SOURCE, rectStyle } from '../config/layout.js';
import { T } from '../lib/timings.js';

const pct = (v, total) => `${(v / total) * 100}%`;

/**
 * PÁGINA 1 — envelope.
 * Toque no selo: o selo pulsa, o texto some, as duas abas se abrem (3D) e a
 * página 2 aparece por trás. Dispara onOpening (quando as abas começam a abrir)
 * e onOpened (quando acabou e o envelope pode sair de cena).
 */
export default function Envelope({ onOpening, onOpened }) {
  const [phase, setPhase] = useState('idle'); // idle | opening
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const open = () => {
    if (phase !== 'idle') return;
    setPhase('opening');
    timers.current.push(setTimeout(onOpening, T.doorsDelay));
    timers.current.push(setTimeout(onOpened, T.doorsDelay + T.doors + 60));
  };

  const leftW = L.split + L.overlap;
  return (
    <div className={`layer layer--envelope is-${phase}`}>
      <div className="envelope__bg" aria-hidden="true" />
      <div className="frame envelope">
        <div
          className="door door--left"
          style={{ left: 0, width: pct(leftW, SOURCE.w), backgroundImage: `url("${left}")` }}
        />
        <div
          className="door door--right"
          style={{
            left: pct(L.split, SOURCE.w),
            width: pct(SOURCE.w - L.split, SOURCE.w),
            backgroundImage: `url("${right}")`,
          }}
        />
        <img
          className="envelope__hint"
          style={rectStyle(L.hint)}
          src={hint}
          alt=""
          draggable="false"
        />
        <button
          type="button"
          className="seal"
          style={rectStyle(L.seal)}
          onClick={open}
          aria-label="Toque para abrir o convite"
        >
          <img src={seal} alt="" draggable="false" />
        </button>
      </div>
    </div>
  );
}
