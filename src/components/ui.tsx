import React, { useEffect, useRef } from 'react';
import { subscribeFrame, reducedMotion } from '../lib/scroll';

/* ---------------- magnetic button ---------------- */
export function Magnetic({
  children,
  className = '',
  strength = 0.34,
  as = 'button',
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  as?: 'button' | 'a' | 'div';
} & Record<string, unknown>) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;
    if (!window.matchMedia('(pointer:fine)').matches) return;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let inside = false;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - (r.left + r.width / 2)) * strength;
      ty = (e.clientY - (r.top + r.height / 2)) * strength;
    };
    const enter = () => {
      inside = true;
      window.addEventListener('mousemove', onMove);
    };
    const leave = () => {
      inside = false;
      tx = 0;
      ty = 0;
      window.removeEventListener('mousemove', onMove);
    };
    el.addEventListener('mouseenter', enter);
    el.addEventListener('mouseleave', leave);
    const un = subscribeFrame(() => {
      cx += (tx - cx) * 0.16;
      cy += (ty - cy) * 0.16;
      if (Math.abs(cx) < 0.01 && Math.abs(cy) < 0.01 && !inside) return;
      el.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
    });
    return () => {
      un();
      el.removeEventListener('mouseenter', enter);
      el.removeEventListener('mouseleave', leave);
      window.removeEventListener('mousemove', onMove);
    };
  }, [strength]);
  const Tag = as as React.ElementType;
  return (
    <Tag ref={ref as never} className={className} data-cursor="button" {...rest}>
      {children}
    </Tag>
  );
}

/* ---------------- primary / ghost CTA ---------------- */
export function Cta({
  children,
  onClick,
  variant = 'primary',
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'dark';
  className?: string;
}) {
  const base =
    'group relative inline-flex items-center gap-3 overflow-hidden rounded-full px-7 py-3.5 text-[13.5px] font-medium tracking-wide transition-colors duration-500';
  const styles =
    variant === 'primary'
      ? 'bg-[#2549f5] text-white hover:bg-[#3557ff]'
      : variant === 'dark'
        ? 'bg-[#0b1430] text-white hover:bg-[#122150]'
        : 'border border-white/25 text-white hover:border-white/60';
  return (
    <Magnetic className={`${base} ${styles} ${className}`} onClick={onClick}>
      <span className="relative z-10">{children}</span>
      <span className="relative z-10 block h-3.5 w-4 overflow-hidden">
        <svg
          viewBox="0 0 16 14"
          className="absolute h-3.5 w-4 transition-transform duration-500 group-hover:translate-x-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <path d="M1 7h12M9 2.5 13.5 7 9 11.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <svg
          viewBox="0 0 16 14"
          className="absolute h-3.5 w-4 -translate-x-5 transition-transform duration-500 group-hover:translate-x-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <path d="M1 7h12M9 2.5 13.5 7 9 11.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-[900ms] group-hover:translate-x-full" />
    </Magnetic>
  );
}

/* ---------------- section eyebrow ---------------- */
export function Eyebrow({
  index,
  children,
  tone = 'light',
  className = '',
}: {
  index?: string;
  children: React.ReactNode;
  tone?: 'light' | 'dark';
  className?: string;
}) {
  const c = tone === 'light' ? 'text-white/45' : 'text-[#0b1430]/50';
  const line = tone === 'light' ? 'bg-white/25' : 'bg-[#0b1430]/20';
  return (
    <div className={`flex items-center gap-3 ${c} ${className}`}>
      {index && <span className="u-label">{index}</span>}
      <span className={`h-px w-8 ${line}`} />
      <span className="u-label">{children}</span>
    </div>
  );
}

/* ---------------- per-word reveal on enter ---------------- */
export function Reveal({
  text,
  className = '',
  delay = 0,
  as: Tag = 'h2',
}: {
  text: string;
  className?: string;
  delay?: number;
  as?: React.ElementType;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add('is-in');
            io.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const words = text.split(' ');
  return (
    <Tag ref={ref as never} className={`reveal-root ${className}`}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <span
            className="inline-block will-change-transform"
            style={{
              transform: 'translateY(105%)',
              transition: `transform 900ms cubic-bezier(.19,1,.22,1) ${delay + i * 55}ms`,
            }}
          >
            {w}
            {i < words.length - 1 ? '\u00A0' : ''}
          </span>
        </span>
      ))}
    </Tag>
  );
}

/* ---------------- tiny data chip ---------------- */
export function Chip({ k, v, tone = 'light' }: { k: string; v: string; tone?: 'light' | 'dark' }) {
  return (
    <div
      className={`flex flex-col gap-1 border-l px-3 ${
        tone === 'light' ? 'border-white/15 text-white' : 'border-[#0b1430]/15 text-[#0b1430]'
      }`}
    >
      <span className="u-label opacity-45">{k}</span>
      <span className="font-mono text-[13px]">{v}</span>
    </div>
  );
}
