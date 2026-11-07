import { useEffect, useState } from 'react';
import BottomSheet from './BottomSheet.jsx';
import { inviteConfig } from '../config/inviteConfig.js';
import { buildWhatsAppUrl, joinNames, pessoas } from '../lib/whatsapp.js';
import { saveRsvp } from '../lib/backend.js';
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
  const [guestList, setGuestList] = useState(['']); // um nome completo por pessoa levada
  const [tried, setTried] = useState(false);
  const [waUrl, setWaUrl] = useState(null); // preenchido depois de confirmar
  const [saved, setSaved] = useState('off'); // saving | ok | fail | off

  // sempre abre limpo
  useEffect(() => {
    if (open) {
      setName('');
      setWithGuests(false);
      setGuestList(['']);
      setTried(false);
      setWaUrl(null);
      setSaved('off');
    }
  }, [open]);

  const count = guestList.length;
  const nameErr = !name.trim();
  const guestErrs = guestList.map((g) => !g.trim());
  const anyGuestErr = withGuests && guestErrs.some(Boolean);

  const changeCount = (next) =>
    setGuestList((list) => {
      const n = Math.max(1, Math.min(cfg.maxGuests, next));
      return Array.from({ length: n }, (_, i) => list[i] ?? ''); // mantém o que já foi digitado
    });
  const setGuest = (i, value) => setGuestList((list) => list.map((g, j) => (j === i ? value : g)));

  const send = (e) => {
    e.preventDefault();
    setTried(true);
    if (nameErr || anyGuestErr) return;
    const guestNames = withGuests ? joinNames(guestList) : '';
    const url = buildWhatsAppUrl({ name, guests: withGuests ? { count, names: guestNames } : null }, cfg);
    // registra para o painel (não bloqueia o WhatsApp se falhar)
    setSaved('saving');
    saveRsvp({ name: name.trim(), guests: withGuests ? count : 0, guestNames }).then(setSaved);
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
        {saved === 'saving' && <p className="rsvp__status" aria-live="polite">Registrando sua confirmação…</p>}
        {saved === 'ok' && <p className="rsvp__status" aria-live="polite">Presença registrada para a Linda. ✓</p>}
        {saved === 'fail' && (
          <p className="rsvp__status" aria-live="polite">
            Não consegui registrar agora, mas a mensagem do WhatsApp já vale como confirmação.
          </p>
        )}
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
          <span className="field__label">Nome completo</span>
          <input
            className="field__input"
            type="text"
            name="nome"
            autoComplete="name"
            placeholder="Nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={tried && nameErr}
          />
          {tried && nameErr && <span className="field__error">Informe seu nome completo.</span>}
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
            <div className="field">
              <span className="field__label">Quantas pessoas você vai levar?</span>
              <div className="stepper">
                <button type="button" className="stepper__btn" aria-label="Diminuir" disabled={count <= 1} onClick={() => changeCount(count - 1)}>
                  −
                </button>
                <span className="stepper__value" aria-live="polite">
                  {pessoas(count)}
                </span>
                <button type="button" className="stepper__btn" aria-label="Aumentar" disabled={count >= cfg.maxGuests} onClick={() => changeCount(count + 1)}>
                  +
                </button>
              </div>
            </div>

            {guestList.map((g, i) => (
              <label className="field" key={i}>
                <span className="field__label">
                  {count === 1 ? 'Nome completo de quem você vai levar' : `Nome completo da pessoa ${i + 1}`}
                </span>
                <input
                  className="field__input"
                  type="text"
                  name={`acompanhante-${i + 1}`}
                  placeholder="Nome completo"
                  value={g}
                  onChange={(e) => setGuest(i, e.target.value)}
                  aria-invalid={tried && guestErrs[i]}
                />
                {tried && guestErrs[i] && <span className="field__error">Informe o nome completo.</span>}
              </label>
            ))}
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
