import { inviteConfig } from '../config/inviteConfig.js';

const url = () => (inviteConfig.backend?.url ?? '').trim();

/** 'remote' = Google Planilhas | 'local' = teste no navegador (só em dev) | 'off' = não configurado */
export function backendMode() {
  if (url()) return 'remote';
  if (import.meta.env.DEV) return 'local';
  return 'off';
}

// Em produção `import.meta.env.DEV` vira false e este import sai do pacote.
async function devStore() {
  if (import.meta.env.DEV) return import('./devStore.js');
  return null;
}

async function post(payload, extra = {}) {
  // text/plain evita "preflight" CORS (o Apps Script não responde a OPTIONS)
  let res;
  try {
    res = await fetch(url(), {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      ...extra,
    });
  } catch {
    throw new Error('unreachable'); // sem internet, endereço errado ou implantação não pública (bloqueio CORS)
  }
  try {
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    throw new Error('html'); // o Google devolveu uma página de erro/login em vez de dados
  }
}

/** Converte a resposta de erro do servidor em um erro que o painel sabe explicar. */
function serverError(data) {
  if (data.error === 'auth') return new Error('auth');
  if (data.error === 'unknown_action' || data.error === 'bad_request') return new Error('outdated');
  return new Error('network');
}

/** Registra a confirmação. Devolve 'ok' | 'fail' | 'off' (nunca lança erro). */
export async function saveRsvp({ name, guests, guestNames }) {
  const mode = backendMode();
  if (mode === 'off') return 'off';
  try {
    if (mode === 'local') {
      (await devStore()).save({ name, guests, guestNames });
      return 'ok';
    }
    const data = await post({ action: 'rsvp', name, guests, guestNames }, { keepalive: true });
    return data.ok ? 'ok' : 'fail';
  } catch {
    return 'fail';
  }
}

/** Lista as confirmações. Lança Error('auth' | 'network' | 'off'). */
export async function listRsvps(user, password) {
  const mode = backendMode();
  if (mode === 'off') throw new Error('off');
  if (mode === 'local') return (await devStore()).list(user, password);
  const data = await post({ action: 'list', user, password });
  if (!data.ok) throw serverError(data);
  return data.rows;
}

/** Remove a confirmação de uma pessoa. Lança Error('auth' | 'network' | 'off'). */
export async function deleteRsvp(user, password, name) {
  const mode = backendMode();
  if (mode === 'off') throw new Error('off');
  if (mode === 'local') return (await devStore()).remove(user, password, name);
  const data = await post({ action: 'delete', user, password, name });
  if (!data.ok) throw serverError(data);
  return data.deleted;
}
