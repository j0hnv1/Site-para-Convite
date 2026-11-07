/**
 * MODO DE TESTE (somente em `npm run dev`, sem backend configurado).
 * Guarda as confirmações no navegador para você ver o painel funcionando.
 * Este arquivo NÃO entra na versão final (`npm run build`).
 */
const KEY = 'convite-dev-rsvps';
const read = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? [];
  } catch {
    return [];
  }
};
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

export function save({ name, guests, guestNames }) {
  const rows = read().filter((r) => norm(r.name) !== norm(name));
  rows.push({ name, guests, guestNames, updatedAt: new Date().toISOString() });
  localStorage.setItem(KEY, JSON.stringify(rows));
}

export function list(user, password) {
  if (user !== 'linda123@' || password !== 'linda123@') throw new Error('auth');
  return read();
}

export function remove(user, password, name) {
  if (user !== 'linda123@' || password !== 'linda123@') throw new Error('auth');
  const rows = read();
  const left = rows.filter((r) => norm(r.name) !== norm(name));
  localStorage.setItem(KEY, JSON.stringify(left));
  return left.length !== rows.length;
}
