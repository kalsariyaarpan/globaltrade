import { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { startEngine } from './lib/scroll';
import { setLenis } from './lib/smooth';
import Cursor from './components/Cursor';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Journey from './components/Journey';
import WorldMap from './components/WorldMap';
import Flow from './components/Flow';
import Capabilities from './components/Capabilities';
import Stats from './components/Stats';
import Cargo from './components/Cargo';
import Contact from './components/Contact';

export default function App() {
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let lenis: Lenis | null = null;

    if (!reduced) {
      lenis = new Lenis({
        duration: 1.15,
        lerp: 0.1,
        wheelMultiplier: 1,
        smoothWheel: true,
        syncTouch: false,
        touchMultiplier: 1.6,
      });
      setLenis(lenis);
    }

    const stop = startEngine((t) => lenis?.raf(t));
    const timer = window.setTimeout(() => setBooted(true), 900);

    return () => {
      window.clearTimeout(timer);
      stop();
      lenis?.destroy();
      setLenis(null);
    };
  }, []);

  return (
    <div className="relative w-full overflow-x-clip bg-[#04060f]">
      <Cursor />
      <Nav />

      <main>
        <Hero />
        <Journey />
        <WorldMap />
        <Flow />
        <Capabilities />
        <Stats />
        <Cargo />
        <Contact />
      </main>

      {/* cinematic vignette + film grain tying every scene together */}
      <div
        className="pointer-events-none fixed inset-0 z-[150]"
        style={{ boxShadow: 'inset 0 0 22vw rgba(2,4,10,0.55)' }}
        aria-hidden
      />

      {/* boot / preloader — dissolves into the hero */}
      <div
        className="pointer-events-none fixed inset-0 z-[500] flex items-center justify-center bg-[#04060f]"
        style={{
          opacity: booted ? 0 : 1,
          transition: 'opacity 900ms cubic-bezier(.65,0,.35,1)',
          visibility: booted ? 'hidden' : 'visible',
          transitionProperty: 'opacity, visibility',
          transitionDelay: booted ? '0ms, 900ms' : '0ms',
        }}
      >
        <div className="flex flex-col items-center gap-6">
          <svg viewBox="0 0 32 32" className="h-10 w-10 text-white">
            <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeOpacity="0.2" />
            <path d="M2 16 H30" stroke="currentColor" strokeOpacity="0.2" />
            <path
              d="M6 20 Q16 4 26 12"
              fill="none"
              stroke="#2549f5"
              strokeWidth="1.8"
              pathLength={1}
              strokeDasharray="1"
              style={{
                strokeDashoffset: booted ? 0 : 1,
                transition: 'stroke-dashoffset 1100ms cubic-bezier(.65,0,.35,1)',
              }}
            />
            <circle cx="26" cy="12" r="2.4" fill="#3fd6e8" opacity={booted ? 1 : 0} style={{ transition: 'opacity 500ms 700ms' }} />
          </svg>
          <div className="u-label text-white/45">Meridian Tradeworks</div>
          <div className="h-px w-40 overflow-hidden bg-white/10">
            <div
              className="h-px bg-gradient-to-r from-[#2549f5] to-[#3fd6e8]"
              style={{ width: booted ? '100%' : '12%', transition: 'width 900ms cubic-bezier(.65,0,.35,1)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
