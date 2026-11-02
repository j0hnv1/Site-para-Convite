/** Diferença (ms) entre o horário "de parede" de um fuso e UTC naquele instante. */
function tzOffsetMs(ts, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }).formatToParts(new Date(ts));
  const get = (type) => Number(parts.find((p) => p.type === type).value);
  const asUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour') % 24,
    get('minute'),
    get('second'),
  );
  return asUtc - Math.floor(ts / 1000) * 1000;
}

/**
 * Converte "data + hora no fuso X" em milissegundos desde 1970 (UTC).
 * Ex.: ('2027-01-10', '00:00', 'America/Sao_Paulo') -> 2027-01-10T03:00:00Z
 */
export function zonedTimeToEpoch(date, time, timeZone) {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  const naiveUtc = Date.UTC(y, m - 1, d, hh, mm, 0);
  const first = naiveUtc - tzOffsetMs(naiveUtc, timeZone);
  return naiveUtc - tzOffsetMs(first, timeZone); // 2ª passada cobre mudanças de horário de verão
}

/** Tempo restante até `target`. Nunca devolve valores negativos. */
export function getTimeLeft(target, now = Date.now()) {
  if (!Number.isFinite(target)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, finished: true };
  }
  const totalSeconds = Math.max(0, Math.floor((target - now) / 1000));
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    finished: totalSeconds === 0,
  };
}
