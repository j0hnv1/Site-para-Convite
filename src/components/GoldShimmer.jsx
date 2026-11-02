/**
 * Brilho sutil que passa apenas sobre a escrita dourada do fundo.
 * A imagem inteira NÃO se move: o brilho é uma camada separada, recortada pela
 * máscara da escrita (shimmer2.webp / shimmer3.webp).
 */
export default function GoldShimmer({ mask }) {
  return <div className="shimmer" style={{ '--mask': `url("${mask}")` }} aria-hidden="true" />;
}
