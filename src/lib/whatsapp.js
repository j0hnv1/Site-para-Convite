import { inviteConfig } from '../config/inviteConfig.js';

const clean = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();

/** "1 pessoa" / "3 pessoas" */
export const pessoas = (n) => `${n} ${n === 1 ? 'pessoa' : 'pessoas'}`;

/**
 * Monta a mensagem pronta de confirmação.
 * guests: { count, names } — omita (ou count 0) se a pessoa vai sozinha.
 */
export function buildMessage({ name, guests }, cfg = inviteConfig.rsvp) {
  const fill = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
  const nome = clean(name);
  if (guests && guests.count > 0) {
    return fill(cfg.messageWithGuests, {
      nome,
      pessoas: pessoas(guests.count),
      acompanhantes: clean(guests.names),
    });
  }
  return fill(cfg.messageAlone, { nome });
}

/** Link do WhatsApp (wa.me) com a mensagem já preenchida. */
export function buildWhatsAppUrl(input, cfg = inviteConfig.rsvp) {
  const number = String(cfg.whatsappNumber ?? '').replace(/\D/g, '');
  const text = encodeURIComponent(buildMessage(input, cfg));
  return `https://wa.me/${number}?text=${text}`;
}
