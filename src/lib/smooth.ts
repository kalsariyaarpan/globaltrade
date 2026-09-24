import Lenis from 'lenis';

let lenis: Lenis | null = null;

export function setLenis(l: Lenis | null) {
  lenis = l;
}

export function scrollToId(id: string, offset = 0) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset, duration: 1.6 });
  else {
    const top = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

export function scrollBy(amount: number) {
  if (lenis) lenis.scrollTo(window.scrollY + amount, { duration: 1.4 });
  else window.scrollTo({ top: window.scrollY + amount, behavior: 'smooth' });
}
