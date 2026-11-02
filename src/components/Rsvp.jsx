import { useEffect, useState } from 'react';
import BottomSheet from './BottomSheet.jsx';
import { inviteConfig } from '../config/inviteConfig.js';
import { buildWhatsAppUrl, pessoas } from '../lib/whatsapp.js';
import { downloadIcs, formatEventWhen, googleCalendarUrl } from '../lib/calendar.js';

/**
 * CONFIRMAÇÃO DE PRESENÇA por WhatsApp + evento no calendário.
 * Não há servidor nem banco de dados: ao confirmar, baixa o evento (.ics) e abre
 * o WhatsApp com a mensagem pronta; depois oferece também o Google Agenda. Número e textos da mensagem: src/config/inviteConfig.js (rsvp).
 */
export default function Rsvp({ open, onClose }) {
  const cfg = inviteConfig.rsvp;
  const [name, setName] = useState('');
  const [withGuests, setWithGuests] = useState(false);
  const [count, setCount] = useState(1);
  const [names, setNames] = useState('');
  const [tried, setTried] = useState(false);
  const [waUrl, setWaUrl] = useState(null); // preenchido depois de confirmar

  // sempre abre limpo
  useEffect(() => {
    if (open) {
      setName('');
      setWithGuests(false);
      setCount(1);
      setNames('');
      setTried(false);
      setWaUrl(null);
    }
  }, [open]);

  const nameErr = !name.trim();
  const guestErr = withGuests && !names.trim();

  const send = (e) => {
    e.preventDefault();
    setTried(true);
    if (nameErr || guestErr) return;
    const url = buildWhatsAppUrl({ name, guests: withGuests ? { count, names } : null }, cfg);
    downloadIcs(); // marca a data no calendário
    window.open(url, '_blank', 'noopener,noreferrer'); // abre o WhatsApp com a mensagem
    setWaUrl(url);
  };

  if (waUrl) {
    return (
      <BottomSheet open={open} onClose={onClose} title={cfg.title} id="sheet-rsvp">
        <p className="sheet__strong">Tudo pronto!</p>
        <p className="sheet__text">
          A mensagem está pronta no WhatsApp: é só enviar. O evento ({formatEventWhen()}) foi enviado
          ao seu calendário. Se ele não abriu sozinho, use um dos botões:
        </p>
        <div className="sheet__actions">
          <a className="pill-btn" href={googleCalendarUrl()} target="_blank" rel="noopener noreferrer">
            Google Agenda
          </a>
          <button type="button" className="pill-btn" onClick={() => downloadIcs()}>
            Outro calendário (.ics)
          </button>
          <button type="button" className="pill-btn" onClick={() => window.open(waUrl, '_blank', 'noopener,noreferrer')}>
            Abrir o WhatsApp de novo
          </button>
        </div>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={cfg.title} id="sheet-rsvp">
      <form className="rsvp" onSubmit={send} noValidate>
        <label className="field">
          <span className="field__label">Seu nome</span>
          <input
            className="field__input"
            type="text"
            name="nome"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={tried && nameErr}
          />
          {tried && nameErr && <span className="field__error">Informe seu nome.</span>}
        </label>

        <div className="seg" role="group" aria-label="Você vai levar alguém?">
          <button type="button" className={`seg__opt${!withGuests ? ' is-on' : ''}`} aria-pressed={!withGuests} onClick={() => setWithGuests(false)}>
            Vou sozinho(a)
          </button>
          <button type="button" className={`seg__opt${withGuests ? ' is-on' : ''}`} aria-pressed={withGuests} onClick={() => setWithGuests(true)}>
            Vou levar alguém
          </button>
        </div>

        {withGuests && (
          <>
            <label className="field">
              <span className="field__label">Nome de quem você vai levar</span>
              <input
                className="field__input"
                type="text"
                name="acompanhantes"
                value={names}
                onChange={(e) => setNames(e.target.value)}
                aria-invalid={tried && guestErr}
              />
              {tried && guestErr && <span className="field__error">Informe o nome de quem você vai levar.</span>}
            </label>

            <div className="field">
              <span className="field__label">Quantas pessoas você vai levar?</span>
              <div className="stepper">
                <button type="button" className="stepper__btn" aria-label="Diminuir" disabled={count <= 1} onClick={() => setCount((c) => Math.max(1, c - 1))}>
                  −
                </button>
                <span className="stepper__value" aria-live="polite">
                  {pessoas(count)}
                </span>
                <button type="button" className="stepper__btn" aria-label="Aumentar" disabled={count >= cfg.maxGuests} onClick={() => setCount((c) => Math.min(cfg.maxGuests, c + 1))}>
                  +
                </button>
              </div>
            </div>
          </>
        )}

        <button type="submit" className="pill-btn sheet__btn">
          Confirmar pelo WhatsApp
        </button>
        <p className="rsvp__note">Ao confirmar, a data também é salva no seu calendário.</p>
      </form>
    </BottomSheet>
  );
}
