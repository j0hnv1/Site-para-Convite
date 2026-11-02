import Art from './Art.jsx';
import GoldShimmer from './GoldShimmer.jsx';
import Countdown from './Countdown.jsx';
import { INVITE_LAYOUT } from '../config/layout.js';
import page2 from '../assets/page2.webp';
import shimmer2 from '../assets/shimmer2.webp';

/**
 * PÁGINA 2 — convite principal (2.png).
 * Todo o texto (21, Linda, etc.) já está na imagem. O cronômetro e a seta de navegação são novos.
 * Tocar em qualquer lugar ou na seta leva à página 3.
 */
export default function Invitation({ onNext }) {
  return (
    <div className="page page--tap" onClick={onNext}>
      <Art src={page2} alt="21st Birthday: Fantasy Edition. The 21st Fantasy. Linda." />
      <GoldShimmer mask={shimmer2} />
      <Countdown rect={INVITE_LAYOUT.countdown} />
      <div className="bottom-center">
        <button
          type="button"
          className="next-btn"
          onClick={onNext}
          aria-label="Ver informações do evento"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
