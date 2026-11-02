import { rectStyle } from '../config/layout.js';

/**
 * Área de toque invisível posicionada sobre um elemento já desenhado na imagem
 * (ícone, rótulo ou botão). Mostra um brilho dourado discreto ao tocar/focar.
 * shape: 'circle' (ícones) | 'pill' (botão Dress code)
 */
export default function Hotspot({ rect, label, onClick, shape = 'circle', popup }) {
  return (
    <button
      type="button"
      className={`hotspot hotspot--${shape}`}
      style={rectStyle(rect)}
      aria-label={label}
      aria-haspopup={popup}
      onClick={onClick}
    >
      <span className="hotspot__glow" aria-hidden="true" />
    </button>
  );
}
