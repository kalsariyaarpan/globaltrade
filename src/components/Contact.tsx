import { useRef, useState } from 'react';
import { useScene, seg, lerp, setT } from '../lib/scroll';
import { DotMap } from './MapStage';
import { Cta, Eyebrow, Reveal } from './ui';
import { scrollToId } from '../lib/smooth';

const OFFICES = [
  { city: 'Mumbai', role: 'Head office', tz: 'GMT+5:30', line: 'Nariman Point, Mumbai 400021' },
  { city: 'Dubai', role: 'Gulf desk', tz: 'GMT+4', line: 'JLT Cluster F, Dubai' },
  { city: 'Rotterdam', role: 'EU operations', tz: 'GMT+1', line: 'Waalhaven Z.z., Rotterdam' },
  { city: 'Newark', role: 'US gateway', tz: 'GMT-5', line: 'Port Street, Newark NJ' },
];

export default function Contact() {
  const [sent, setSent] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const map = useRef<HTMLDivElement>(null);
  const doors = useRef<HTMLDivElement>(null);

  const sectionRef = useScene<HTMLElement>('through', (p) => {
    const a = seg(p, 0.1, 0.5);
    setT(panel.current, `translate3d(0,${lerp(50, 0, a)}px,0)`, a);
    setT(map.current, `translate3d(0,${lerp(40, -20, p)}px,0) scale(${lerp(1.06, 1.14, p)})`, lerp(0.05, 0.3, a));
    if (doors.current) doors.current.style.setProperty('--open', String(seg(p, 0.3, 0.62)));
  });

  return (
    <section
      ref={sectionRef as never}
      id="contact"
      data-nav-theme="dark"
      data-scene-name="Delivery"
      className="relative overflow-hidden bg-[#04060f] pt-[16vh]"
    >
      <div ref={map} className="pointer-events-none absolute inset-x-0 top-0 h-[70%]">
        <DotMap className="h-full w-full" color="#3b4f8c" accent="#2549f5" dotSize={1.1} opacity={0.35} />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(90%_60%_at_50%_0%,rgba(37,73,245,0.16),transparent_60%)]" />

      <div className="relative mx-auto max-w-[1480px] px-5 md:px-9">
        <div ref={panel} style={{ opacity: 0 }}>
          <Eyebrow index="09">Final mile</Eyebrow>
          <Reveal
            as="h2"
            text="Your cargo has arrived. Let’s plan the next voyage."
            className="mt-6 max-w-[900px] font-display text-[clamp(2.1rem,5.6vw,4.4rem)] font-light leading-[0.98] tracking-[-0.035em] text-white"
          />

          <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            {/* container that opens into the CTA */}
            <div
              ref={doors}
              className="relative overflow-hidden rounded-[4px] border border-white/10 bg-[#070c1e]/70 p-8 u-glass"
              style={{ ['--open' as string]: 0 }}
            >
              <div className="relative z-10">
                <div className="u-label text-[#3fd6e8]">Open a trade lane</div>
                <p className="mt-4 max-w-[440px] text-[15px] leading-relaxed text-white/60">
                  Tell us what you move, where it goes and when it must land. We reply with a routing plan,
                  landed-cost estimate and a named coordinator within one business day.
                </p>

                <form
                  className="mt-7 flex flex-col gap-3 sm:flex-row"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSent(true);
                  }}
                >
                  <input
                    required
                    type="email"
                    placeholder="you@company.com"
                    className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/[0.04] px-5 py-3.5 text-[13.5px] text-white placeholder:text-white/30 outline-none transition-colors focus:border-[#3fd6e8]"
                  />
                  <button
                    data-cursor="button"
                    type="submit"
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#2549f5] px-7 py-3.5 text-[13.5px] font-medium text-white transition-colors hover:bg-[#3557ff]"
                  >
                    {sent ? 'Request received' : 'Request routing plan'}
                    <svg viewBox="0 0 16 14" className="h-3.5 w-4 transition-transform duration-500 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M1 7h12M9 2.5 13.5 7 9 11.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </form>

                <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/10 pt-6">
                  <a
                    href="mailto:trade@meridiantradeworks.com"
                    data-cursor="button"
                    className="text-[13.5px] text-white/70 transition-colors hover:text-white"
                  >
                    trade@meridiantradeworks.com
                  </a>
                  <a
                    href="tel:+912266550000"
                    data-cursor="button"
                    className="font-mono text-[13px] text-white/70 transition-colors hover:text-white"
                  >
                    +91 22 6655 0000
                  </a>
                  <span className="u-label text-white/30">Response &lt; 24h</span>
                </div>
              </div>

              {/* container door overlay */}
              <div
                className="pointer-events-none absolute inset-y-0 right-0 w-1/2 origin-right border-l border-black/40 bg-gradient-to-b from-[#1d2f80] to-[#0d1740]"
                style={{
                  transform: 'perspective(1200px) rotateY(calc(var(--open) * -96deg))',
                  opacity: 'calc(1 - var(--open))',
                }}
              />
              <div
                className="pointer-events-none absolute inset-y-0 left-0 w-1/2 origin-left border-r border-black/40 bg-gradient-to-b from-[#1d2f80] to-[#0d1740]"
                style={{
                  transform: 'perspective(1200px) rotateY(calc(var(--open) * 96deg))',
                  opacity: 'calc(1 - var(--open))',
                }}
              />
            </div>

            {/* offices */}
            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[4px] border border-white/10 bg-white/[0.07] sm:grid-cols-2">
              {OFFICES.map((o) => (
                <div
                  key={o.city}
                  data-cursor="map"
                  className="group relative bg-[#05080f] p-6 transition-colors duration-500 hover:bg-[#0a1024]"
                >
                  <div className="flex items-start justify-between">
                    <span className="font-display text-xl font-light text-white">{o.city}</span>
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inset-0 rounded-full bg-[#3fd6e8] opacity-60 pulse-ring" />
                      <span className="relative h-2 w-2 rounded-full bg-[#3fd6e8]" />
                    </span>
                  </div>
                  <div className="u-label mt-2 text-white/35">{o.role}</div>
                  <div className="mt-6 text-[12.5px] leading-relaxed text-white/50">{o.line}</div>
                  <div className="mt-2 font-mono text-[10.5px] text-white/30">{o.tz}</div>
                  <span className="absolute inset-x-6 bottom-0 h-px origin-left scale-x-0 bg-[#3fd6e8]/60 transition-transform duration-500 group-hover:scale-x-100" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* footer */}
        <footer className="mt-24 border-t border-white/10 pb-10 pt-10">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-[320px]">
              <div className="flex items-center gap-3 text-white">
                <svg viewBox="0 0 32 32" className="h-7 w-7">
                  <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeOpacity="0.3" />
                  <path d="M2 16 H30" stroke="currentColor" strokeOpacity="0.25" />
                  <path d="M6 20 Q16 4 26 12" fill="none" stroke="#2549f5" strokeWidth="1.8" />
                  <circle cx="26" cy="12" r="2.4" fill="#3fd6e8" />
                </svg>
                <span className="font-display text-[15px] font-semibold tracking-[0.16em]">MERIDIAN</span>
              </div>
              <p className="mt-4 text-[12.5px] leading-relaxed text-white/40">
                Meridian Tradeworks Pvt. Ltd. — international import, export and freight forwarding.
                IEC 0399042215 · FIATA member.
              </p>
            </div>
            <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-3 lg:max-w-[600px]">
              {[
                { t: 'Company', l: ['About', 'Leadership', 'Careers', 'Newsroom'] },
                { t: 'Services', l: ['Import', 'Export', 'Customs', 'Warehousing'] },
                { t: 'Legal', l: ['Terms', 'Privacy', 'Compliance', 'Incoterms 2020'] },
              ].map((c) => (
                <div key={c.t}>
                  <div className="u-label text-white/35">{c.t}</div>
                  <ul className="mt-4 space-y-2.5">
                    {c.l.map((x) => (
                      <li key={x}>
                        <button
                          data-cursor="button"
                          onClick={() => scrollToId('contact')}
                          className="text-[13px] text-white/60 transition-colors hover:text-white"
                        >
                          {x}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <span className="u-label text-white/25">© {new Date().getFullYear()} Meridian Tradeworks</span>
            <div className="flex items-center gap-4">
              <span className="u-label text-white/25">Back to origin</span>
              <Cta variant="ghost" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                Top
              </Cta>
            </div>
          </div>
        </footer>
      </div>
    </section>
  );
}
