/**
 * Durações (ms) de todas as animações. São enviadas ao CSS como variáveis
 * (--t-<nome>) para que JavaScript e CSS usem sempre os mesmos números.
 * Para quem pede "reduzir movimento" no sistema, tudo fica quase instantâneo.
 */
const reduced =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const T = reduced
  ? { seal: 1, doorsDelay: 1, doors: 220, reveal: 220, rise: 220, slide: 220 }
  : {
      seal: 560, // selo "pulsa" ao toque
      doorsDelay: 430, // espera antes das abas começarem a abrir
      doors: 1250, // abertura das abas do envelope
      reveal: 1250, // página 2 surge por trás do envelope
      rise: 900, // página 2 -> 3
      slide: 720, // página 3 <-> 4
    };

export function applyTimingVars() {
  const style = document.documentElement.style;
  Object.entries(T).forEach(([name, ms]) => style.setProperty(`--t-${name}`, `${ms}ms`));
}
