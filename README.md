# Convite interativo — 21st Birthday: Fantasy Edition (Linda)

Site React (Vite), mobile-first, com 4 páginas: **envelope → convite → informações → presentes**.

## Como executar
```bash
npm install
npm run dev        # desenvolvimento (abra o endereço mostrado, de preferência no modo celular do navegador)
npm run build      # gera a pasta dist/ (pode ser hospedada em qualquer lugar)
npm run preview    # testa o build
```
Requer Node 18+. Dependências: apenas React e, para desenvolvimento, Vite.

## Onde editar (tudo em `src/config/inviteConfig.js`)
| O quê | Campo |
|---|---|
| **Data/hora do cronômetro** (fica na página 2) | `countdown.date` e `countdown.time` (fuso `America/Sao_Paulo`). Hoje: 10/01/2027 00:00. A imagem da página 3 mostra **Sab. 23 Jan., 19hrs**: para alinhar use `'2027-01-23'` e `'19:00'`. |
| **Localização** | `location.name`, `location.address`, `location.mapsUrl` (já com o link do Google Maps do local). O botão "Ver localização" só funciona com link `http(s)` válido. |
| **Dress code** | É uma página com a imagem `src/assets/dresscode.webp` com um botão "Voltar" (igual ao das sugestões) que leva à página 3. Para trocar, substitua o arquivo (1080×1920). |
| **Evento no calendário** | `calendar` (data, hora, **duração** e título). Ao confirmar, baixa um arquivo `.ics` e o painel oferece Google Agenda. Hoje: 23/01/2027 às 19h (como na imagem), duração provisória de 4h. Código: `src/lib/calendar.js`. |
| **Confirmar presença (WhatsApp)** | `rsvp.whatsappNumber` (só dígitos, com 55 + DDD, ex.: `5541999999999`) e os textos `messageAlone` / `messageWithGuests`. A pessoa informa nome, se vai levar alguém, quem e quantas pessoas; o WhatsApp abre com a mensagem pronta. Sem número, o WhatsApp pede para escolher o contato. Código: `src/components/Rsvp.jsx` e `src/lib/whatsapp.js`. |

## Estrutura
```
src/App.jsx                 ordem das páginas e transições
src/components/
  Envelope.jsx              página 1 (abas, selo, texto "Toque para abrir")
  Invitation.jsx            página 2
  EventDetails.jsx          página 3 (+ Countdown, Location, Rsvp)
  DressCode.jsx             página de Dress code (imagem + botão Voltar)
  GiftSuggestions.jsx       página 4 + botão Voltar
  BottomSheet.jsx           janela usada por Localização / Dress code / Confirmar presença
src/config/layout.js        posição das áreas de toque sobre as imagens (px da imagem 1080×1920)
src/lib/timings.js          duração de todas as animações
src/styles/*.css            estilos (cores e tamanhos em base.css)
tools/prepare_assets.py     gera os arquivos de src/assets a partir dos PNGs originais
```

## Como substituir as imagens
- **Páginas 2, 3, 4 e Dress code:** substitua `src/assets/page2.webp`, `page3.webp`, `page4.webp`, `dresscode.webp` (mantenha 1080×1920, proporção 9:16).
  Se os ícones/botões da página 3 mudarem de posição, ajuste `src/config/layout.js`.
- **Página 1 (envelope):** o fundo é dividido em duas abas e o selo/texto são recortes separados. Coloque os 4 PNGs (`1.png`…`4.png`, e `5.png` para o Dress code) numa pasta e rode
  `python3 tools/prepare_assets.py <pasta>` (requer Pillow, numpy, scipy). Isso regenera tudo, inclusive o brilho da escrita dourada.
  Se o selo/dobra mudarem de lugar, atualize `ENVELOPE_LAYOUT` em `src/config/layout.js`.

## Observações
- As imagens originais (≈3 MB cada) foram convertidas para WebP (≈260 KB) sem perda visível.
- Respeita "reduzir movimento" do sistema (animações quase instantâneas).
- A fonte Playfair Display vem do Google Fonts (cronômetro e janelas); sem internet, usa uma serifada do sistema.
