import BottomSheet from './BottomSheet.jsx';
import { inviteConfig } from '../config/inviteConfig.js';
import { isValidHttpUrl } from '../lib/url.js';

/**
 * Localização do evento. Dados em src/config/inviteConfig.js (location).
 * O botão só abre o Google Maps quando mapsUrl é um link http(s) válido.
 */
export default function Location({ open, onClose }) {
  const { name, address, mapsUrl, placeholder } = inviteConfig.location;
  const hasInfo = Boolean(name?.trim() || address?.trim());
  const canOpenMap = isValidHttpUrl(mapsUrl);

  return (
    <BottomSheet open={open} onClose={onClose} title="Localização" id="sheet-location">
      {hasInfo ? (
        <>
          {name?.trim() && <p className="sheet__strong">{name}</p>}
          {address?.trim() && <p className="sheet__text">{address}</p>}
        </>
      ) : (
        <p className="sheet__muted">{placeholder}</p>
      )}

      {canOpenMap ? (
        <a className="pill-btn sheet__btn" href={mapsUrl.trim()} target="_blank" rel="noopener noreferrer">
          Ver localização
        </a>
      ) : (
        <button type="button" className="pill-btn sheet__btn" disabled>
          Ver localização
        </button>
      )}
    </BottomSheet>
  );
}
