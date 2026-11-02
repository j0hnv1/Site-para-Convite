import { useCallback, useState } from 'react';
import Art from './Art.jsx';
import GoldShimmer from './GoldShimmer.jsx';
import Hotspot from './Hotspot.jsx';
import Location from './Location.jsx';
import Rsvp from './Rsvp.jsx';
import page3 from '../assets/page3.webp';
import shimmer3 from '../assets/shimmer3.webp';
import { EVENT_LAYOUT as L } from '../config/layout.js';

/**
 * PÁGINA 3 — informações do evento (3.png).
 * Data/hora, ícones e rótulos já estão na imagem; aqui ficam por cima o
 * cronômetro e as áreas de toque (Localização, Confirmar presença,
 * Sugestão de presente e Dress code). Dress code e presentes abrem páginas próprias.
 */
export default function EventDetails({ onOpenGifts, onOpenDressCode, onBack }) {
  const [sheet, setSheet] = useState(null); // null | 'location' | 'rsvp'
  const close = useCallback(() => setSheet(null), []);

  return (
    <div className="page">
      <Art src={page3} alt="Sab. 23 Jan. As 19hrs" />
      <GoldShimmer mask={shimmer3} />
      <button type="button" className="back-circle" onClick={onBack} aria-label="Voltar para o convite">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 5l-7 7 7 7" />
        </svg>
      </button>

      <Hotspot rect={L.location} label="Localização" popup="dialog" onClick={() => setSheet('location')} />
      <Hotspot rect={L.rsvp} label="Confirmar presença" popup="dialog" onClick={() => setSheet('rsvp')} />
      <Hotspot rect={L.gifts} label="Sugestão de presente" onClick={onOpenGifts} />
      <Hotspot
        rect={L.dressCode}
        shape="pill"
        label="Dress code"
        onClick={onOpenDressCode}
      />

      <Location open={sheet === 'location'} onClose={close} />
      <Rsvp open={sheet === 'rsvp'} onClose={close} />
    </div>
  );
}
