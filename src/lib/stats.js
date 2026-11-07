/** Normaliza as linhas vindas do servidor e calcula os totais do painel. */
export function summarize(rawRows = []) {
  const rows = rawRows
    .map((r) => {
      const guests = Math.max(0, Number(r.guests) || 0);
      return {
        name: String(r.name ?? '').trim(),
        guests,
        guestNames: guests > 0 ? String(r.guestNames ?? '').trim() : '',
        people: 1 + guests, // quem confirmou + acompanhantes
        updatedAt: r.updatedAt || '',
      };
    })
    .filter((r) => r.name)
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));

  const companions = rows.reduce((sum, r) => sum + r.guests, 0);
  return {
    rows,
    confirmations: rows.length,
    companions,
    people: rows.length + companions,
  };
}

/** Filtro por nome de quem confirmou ou de acompanhante. */
export function filterRows(rows, term) {
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const t = norm(term.trim());
  if (!t) return rows;
  return rows.filter((r) => norm(r.name).includes(t) || norm(r.guestNames).includes(t));
}
