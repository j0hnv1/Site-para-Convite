/** Imagem de fundo da página, sempre preenchendo o quadro 9:16 sem distorcer. */
export default function Art({ src, alt }) {
  return <img className="art" src={src} alt={alt} draggable="false" decoding="async" />;
}
