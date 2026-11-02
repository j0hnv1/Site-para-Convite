import { inviteConfig } from '../config/inviteConfig.js';
import { isValidHttpUrl } from './url.js';
import { zonedTimeToEpoch } from './countdown.js';

const pad = (n) => String(n).padStart(2, '0');

/** ms -> "20270123T220000Z" (formato de calendário, em UTC) */
export function toCalendarUtc(ms) {
  const d = new Date(ms);
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

export function getEventTimes(cal = inviteConfig.calendar) {
  const start = zonedTimeToEpoch(cal.date, cal.time, cal.timeZone);
  return { start, end: start + cal.durationHours * 3600 * 1000 };
}

function locationText(loc = inviteConfig.location) {
  return [loc.name, loc.address].map((v) => String(v ?? '').trim()).filter(Boolean).join(' - ');
}

function detailsText(cal, loc) {
  const parts = [cal.description];
  if (isValidHttpUrl(loc.mapsUrl)) parts.push(`Mapa: ${loc.mapsUrl.trim()}`);
  return parts.filter(Boolean).join('\n');
}

const esc = (s) =>
  String(s ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');

/** Linhas de arquivo .ics têm no máximo 75 bytes; o excedente continua na linha seguinte iniciada por espaço. */
function fold(line) {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;
  const out = [];
  let cur = '';
  let bytes = 0;
  for (const ch of line) {
    const b = enc.encode(ch).length;
    if (bytes + b > 75) {
      out.push(cur);
      cur = ' ';
      bytes = 1;
    }
    cur += ch;
    bytes += b;
  }
  out.push(cur);
  return out.join('\r\n');
}

/** Conteúdo do arquivo .ics (funciona em iPhone, Android, Outlook e Google Agenda). */
export function buildIcs({ cal = inviteConfig.calendar, loc = inviteConfig.location, now = Date.now() } = {}) {
  const { start, end } = getEventTimes(cal);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Convite Linda 21//PT-BR//',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:convite-linda-21-${toCalendarUtc(start)}@convite`,
    `DTSTAMP:${toCalendarUtc(now)}`,
    `DTSTART:${toCalendarUtc(start)}`,
    `DTEND:${toCalendarUtc(end)}`,
    `SUMMARY:${esc(cal.title)}`,
  ];
  const where = locationText(loc);
  if (where) lines.push(`LOCATION:${esc(where)}`);
  const details = detailsText(cal, loc);
  if (details) lines.push(`DESCRIPTION:${esc(details)}`);
  if (isValidHttpUrl(loc.mapsUrl)) lines.push(`URL:${loc.mapsUrl.trim()}`);
  lines.push(
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${esc(cal.title)}`,
    'TRIGGER:-P1D',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  );
  return lines.map(fold).join('\r\n') + '\r\n';
}

/** Link que abre o Google Agenda já com o evento preenchido. */
export function googleCalendarUrl({ cal = inviteConfig.calendar, loc = inviteConfig.location } = {}) {
  const { start, end } = getEventTimes(cal);
  const q = [
    ['action', 'TEMPLATE'],
    ['text', cal.title],
    ['dates', `${toCalendarUtc(start)}/${toCalendarUtc(end)}`],
    ['details', detailsText(cal, loc)],
    ['location', locationText(loc)],
    ['ctz', cal.timeZone],
  ]
    .filter(([, v]) => v)
    .map(([k, v]) => (k === 'dates' ? `${k}=${v}` : `${k}=${encodeURIComponent(v)}`))
    .join('&');
  return `https://calendar.google.com/calendar/render?${q}`;
}

/** Baixa o arquivo .ics (o celular/computador oferece adicionar ao calendário). */
export function downloadIcs(opts) {
  const blob = new Blob([buildIcs(opts)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'aniversario-linda-21.ics';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** "sábado, 23 de janeiro às 19:00" (no fuso do evento) */
export function formatEventWhen(cal = inviteConfig.calendar) {
  const { start } = getEventTimes(cal);
  const date = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: cal.timeZone,
  }).format(new Date(start));
  const time = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: cal.timeZone,
  }).format(new Date(start));
  return `${date} às ${time}`;
}
