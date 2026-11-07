import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { backendMode, deleteRsvp, listRsvps } from '../lib/backend.js';
import { filterRows, summarize } from '../lib/stats.js';

const ERRORS = {
  auth: 'Usuário ou senha incorretos.',
  off: 'O painel ainda não está conectado ao Google Planilhas (veja backend/LEIA-ME.md).',
  unreachable:
    'Não consegui falar com o Google. Confira: (1) a implantação está com acesso "Qualquer pessoa"; (2) o endereço em inviteConfig.js termina em /exec; (3) você rodou npm run build depois de colar o endereço.',
  html: 'O Google respondeu com erro. Confira se o script foi criado dentro da planilha (Extensões > Apps Script) e se a implantação está como "Executar como: Eu" e acesso "Qualquer pessoa".',
  outdated:
    'O script publicado no Google não conhece esta ação (falta a função de remover). Cole o código novo de backend/apps-script.gs no Apps Script e publique uma Nova versão. Abra o endereço /exec no navegador: deve aparecer "version":4.',
  network: 'Não foi possível carregar agora. Verifique a internet e tente de novo.',
};

const fmt = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(d);
};

/** Painel escondido: login simples + quantidade de pessoas e nomes (com acompanhantes ligados a quem os trouxe). */
export default function AdminPanel({ onClose }) {
  const [session, setSession] = useState(null); // { user, password } só na memória
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [term, setTerm] = useState('');
  const [confirming, setConfirming] = useState(null); // nome aguardando confirmação de remoção
  const userRef = useRef(null);
  const mode = backendMode();

  useEffect(() => {
    userRef.current?.focus();
  }, []);
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const load = useCallback(async (creds) => {
    setBusy(true);
    setError('');
    try {
      setRows(await listRsvps(creds.user, creds.password));
      setSession(creds);
    } catch (e) {
      setError(ERRORS[e.message] ?? ERRORS.network);
      if (e.message === 'auth') setSession(null);
    } finally {
      setBusy(false);
    }
  }, []);

  const remove = async (name) => {
    setBusy(true);
    setError('');
    try {
      await deleteRsvp(session.user, session.password, name);
      setConfirming(null);
      await load(session);
    } catch (e) {
      setError(ERRORS[e.message] ?? ERRORS.network);
      setBusy(false);
    }
  };

  const login = (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    load({ user: String(f.get('user')).trim(), password: String(f.get('password')) });
  };

  const summary = useMemo(() => summarize(rows ?? []), [rows]);
  const shown = useMemo(() => filterRows(summary.rows, term), [summary, term]);

  return (
    <div className="admin" role="dialog" aria-modal="true" aria-label="Painel de confirmações">
      <div className="admin__scroll">
        {!session ? (
          <form className="admin__card admin__login" onSubmit={login}>
            <h1 className="admin__title">Painel</h1>
            <label className="field">
              <span className="field__label">Usuário</span>
              <input className="field__input" name="user" autoComplete="username" autoCapitalize="none" spellCheck="false" ref={userRef} required />
            </label>
            <label className="field">
              <span className="field__label">Senha</span>
              <input className="field__input" name="password" type="password" autoComplete="current-password" required />
            </label>
            {error && (
              <p className="field__error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="pill-btn" disabled={busy}>
              {busy ? 'Entrando…' : 'Entrar'}
            </button>
            <button type="button" className="admin__link" onClick={onClose}>
              Fechar
            </button>
          </form>
        ) : (
          <div className="admin__dash">
            <header className="admin__head">
              <h1 className="admin__title">Confirmações</h1>
              <div className="admin__actions">
                <button type="button" className="admin__btn" onClick={() => load(session)} disabled={busy}>
                  {busy ? 'Atualizando…' : 'Atualizar'}
                </button>
                <button type="button" className="admin__btn" onClick={onClose}>
                  Sair
                </button>
              </div>
            </header>

            {mode === 'local' && (
              <p className="admin__banner">
                Modo de teste: mostra só as confirmações feitas neste navegador. Em produção os dados vêm do Google Planilhas.
              </p>
            )}
            {error && (
              <p className="field__error" role="alert">
                {error}
              </p>
            )}

            <div className="stats">
              <div className="stat">
                <span className="stat__num">{summary.people}</span>
                <span className="stat__label">pessoas no total</span>
              </div>
              <div className="stat">
                <span className="stat__num">{summary.confirmations}</span>
                <span className="stat__label">confirmações</span>
              </div>
              <div className="stat">
                <span className="stat__num">{summary.companions}</span>
                <span className="stat__label">acompanhantes</span>
              </div>
            </div>

            {summary.confirmations > 0 && (
              <input
                className="field__input admin__search"
                type="search"
                placeholder="Buscar por nome"
                aria-label="Buscar por nome"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
              />
            )}

            {summary.confirmations === 0 ? (
              <p className="admin__empty">Ainda não há confirmações.</p>
            ) : (
              <ul className="guests">
                {shown.map((r) => (
                  <li className="guest" key={r.name + r.updatedAt}>
                    <div className="guest__main">
                      <span className="guest__name">{r.name}</span>
                      <span className="guest__badge">{r.people === 1 ? '1 pessoa' : `${r.people} pessoas`}</span>
                    </div>
                    {r.guests > 0 && (
                      <p className="guest__with">
                        Leva {r.guests === 1 ? '1 pessoa' : `${r.guests} pessoas`}: {r.guestNames}
                      </p>
                    )}
                    <div className="guest__foot">
                      {fmt(r.updatedAt) && <p className="guest__time">Confirmou em {fmt(r.updatedAt)}</p>}
                      {confirming === r.name ? (
                        <span className="guest__confirm">
                          <button type="button" className="guest__danger" onClick={() => remove(r.name)} disabled={busy}>
                            Sim, remover
                          </button>
                          <button type="button" className="guest__cancel" onClick={() => setConfirming(null)}>
                            Cancelar
                          </button>
                        </span>
                      ) : (
                        <button type="button" className="guest__remove" onClick={() => setConfirming(r.name)} aria-label={`Remover ${r.name}`}>
                          Remover
                        </button>
                      )}
                    </div>
                  </li>
                ))}
                {shown.length === 0 && <li className="admin__empty">Nenhum resultado.</li>}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
