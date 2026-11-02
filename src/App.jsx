import { useCallback, useEffect, useRef, useState } from 'react';
import Envelope from './components/Envelope.jsx';
import PageLayer from './components/PageLayer.jsx';
import Invitation from './components/Invitation.jsx';
import EventDetails from './components/EventDetails.jsx';
import GiftSuggestions from './components/GiftSuggestions.jsx';
import DressCode from './components/DressCode.jsx';
import { T } from './lib/timings.js';
import page2 from './assets/page2.webp';
import page3 from './assets/page3.webp';
import page4 from './assets/page4.webp';
import dresscode from './assets/dresscode.webp';
import shimmer2 from './assets/shimmer2.webp';
import shimmer3 from './assets/shimmer3.webp';

/** Ordem: 1 envelope → 2 convite → 3 informações → 4 presentes  (5 = Dress code, aberta a partir da 3) */
const PAGES = {
  2: { bg: page2, label: 'Convite', render: (nav) => <Invitation onNext={() => nav.go(3, 'rise')} /> },
  3: {
    bg: page3,
    label: 'Informações do evento',
    render: (nav) => (
      <EventDetails
        onOpenGifts={() => nav.go(4, 'forward')}
        onOpenDressCode={() => nav.go(5, 'forward')}
        onBack={() => nav.go(2, 'fall')}
      />
    ),
  },
  4: {
    bg: page4,
    label: 'Sugestões de presentes',
    render: (nav) => <GiftSuggestions onBack={() => nav.go(3, 'back')} />,
  },
  5: {
    bg: dresscode,
    label: 'Dress code',
    render: (nav) => <DressCode onBack={() => nav.go(3, 'back')} />,
  },
};
const DURATION = { rise: T.rise, fall: T.rise, forward: T.slide, back: T.slide };

export default function App() {
  // envelope: 'closed' | 'opening' | 'gone'
  const [envelope, setEnvelope] = useState('closed');
  const [nav, setNav] = useState({ current: 2, leaving: null, kind: 'reveal' });
  const busy = useRef(false);
  const timer = useRef(null);

  // pré-carrega as próximas páginas enquanto a pessoa vê o envelope
  useEffect(() => {
    [page2, shimmer2, page3, shimmer3, page4, dresscode].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
    return () => clearTimeout(timer.current);
  }, []);

  const go = useCallback((to, kind) => {
    if (busy.current) return; // ignora toques durante uma transição
    busy.current = true;
    setNav((n) => ({ current: to, leaving: n.current, kind }));
    timer.current = setTimeout(() => {
      setNav((n) => ({ ...n, leaving: null }));
      busy.current = false;
    }, DURATION[kind]);
  }, []);

  const controls = { go };
  const pageIds = [nav.leaving, nav.current].filter(Boolean);

  return (
    <>
      {envelope !== 'closed' &&
        pageIds.map((id) => (
          <PageLayer
            key={id}
            bg={PAGES[id].bg}
            label={PAGES[id].label}
            mode={id === nav.current ? 'enter' : 'leave'}
            kind={nav.kind}
          >
            {PAGES[id].render(controls)}
          </PageLayer>
        ))}

      {envelope !== 'gone' && (
        <Envelope
          onOpening={() => setEnvelope('opening')}
          onOpened={() => setEnvelope('gone')}
        />
      )}
    </>
  );
}
