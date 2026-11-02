/**
 * Coordenadas (em pixels da imagem original 1080×1920) das áreas interativas
 * sobrepostas às imagens. Se trocar uma imagem por outra com elementos em
 * posições diferentes, ajuste os números aqui — o resto se adapta sozinho.
 */
export const SOURCE = { w: 1080, h: 1920 };

/** Converte um retângulo em pixels da imagem para porcentagens do quadro. */
export const rectStyle = ({ x, y, w, h }) => ({
  left: `${(x / SOURCE.w) * 100}%`,
  top: `${(y / SOURCE.h) * 100}%`,
  width: `${(w / SOURCE.w) * 100}%`,
  height: `${(h / SOURCE.h) * 100}%`,
});

/** Página 3 (3.png) */
export const EVENT_LAYOUT = {
  // ícone + rótulo de cada coluna (círculos em y≈1203–1428, rótulos até y≈1569)
  location: { x: 86, y: 1195, w: 250, h: 392 },
  rsvp: { x: 401, y: 1195, w: 250, h: 392 },
  gifts: { x: 715, y: 1195, w: 250, h: 392 },
  // pílula "Dress code" (exata; a área de toque é ampliada via CSS)
  dressCode: { x: 276, y: 1616, w: 529, h: 111 },
};

/** Página 2 (2.png): cronômetro no espaço livre entre "Linda" (termina em y≈1332) e a seta (começa em y≈1742) */
export const INVITE_LAYOUT = {
  countdown: { x: 64, y: 1440, w: 952, h: 134 },
};

/** Página 1 (1.png) — caixas dos recortes gerados por tools/prepare_assets.py */
export const ENVELOPE_LAYOUT = {
  seal: { x: 379, y: 794, w: 324, h: 331 },
  hint: { x: 284, y: 729, w: 206, h: 475 },
  // posição da dobra (aresta nítida) e px de sobreposição entre as abas
  split: 518,
  overlap: 2,
};
