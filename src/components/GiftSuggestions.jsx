import Art from './Art.jsx';
import page4 from '../assets/page4.webp';

// Texto idêntico ao da imagem (para leitores de tela). Não alterar a grafia.
const ALT =
  'Sugestão de presentes. Para quem quiser me presentear, preparei algumas sugestões com carinho. ' +
  'Mas fique à vontade para escolher algo que lembre você de mim! ' +
  'Perfumes (preferência doce); Roupas tam. M; Calçados (36/37); Acessórios (aço cirurgico/ prata)';

/** PÁGINA 4 — sugestões de presentes (4.png) + botão Voltar (volta à página 3). */
export default function GiftSuggestions({ onBack }) {
  return (
    <div className="page">
      <Art src={page4} alt={ALT} />
      <div className="bottom-center">
        <button type="button" className="pill-btn back-btn" onClick={onBack}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
          Voltar
        </button>
      </div>
    </div>
  );
}
