import Art from './Art.jsx';
import dresscode from '../assets/dresscode.webp';

// Texto idêntico ao da imagem (para leitores de tela).
const ALT =
  'Dress code. Solte a criatividade e escolha sua versão para essa noite. ' +
  'Vale personagem, filme, série, época, profissão ou qualquer ideia que saia do comum. ' +
  'Personagens de filmes e séries; Vilões e heróis; Anos 80, 90 ou 2000; Contos de fadas e desenhos; ' +
  'Fantasias engraçadas e inusitadas; Famosos memes da internet; Profissões fora do comum; ' +
  'Looks extravagantes e personagens da cultura pop';

/** PÁGINA DE DRESS CODE (imagem) + botão Voltar, igual ao das sugestões de presentes (volta à página 3). */
export default function DressCode({ onBack }) {
  return (
    <div className="page">
      <Art src={dresscode} alt={ALT} />
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
