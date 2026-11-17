import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const MOTION_OK = '(prefers-reduced-motion: no-preference)';
let lenis: Lenis | null = null;
let mm: gsap.MatchMedia | null = null;

// Always start a fresh load at the top (unless a #hash was requested).
// Astro's router otherwise restores the previous scroll position on reload.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
let firstLoad = true;

document.addEventListener('contact:toggle', (e) => {
  if ((e as CustomEvent<boolean>).detail) lenis?.stop();
  else lenis?.start();
});

function startLenis() {
  if (lenis || !matchMedia(MOTION_OK).matches) return;
  lenis = new Lenis({ autoRaf: false, anchors: true, lerp: 0.18, wheelMultiplier: 1.15 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis?.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ---------- Hero ---------- */
function hero() {
  const el = document.querySelector<HTMLElement>('[data-hero]');
  if (!el) return;
  const [ray, lai] = gsap.utils.toArray<HTMLElement>('[data-hero-word]', el);
  const portrait = el.querySelector<HTMLElement>('[data-hero-portrait]');
  const fades = gsap.utils.toArray<HTMLElement>('[data-hero-fade]', el);

  // Entrance: portrait rises, name scales down out of a blur.
  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .from(portrait, { yPercent: 8, opacity: 0, duration: 1.2 })
    .from([ray, lai], { scale: 1.35, filter: 'blur(24px)', opacity: 0, duration: 1.1, stagger: 0.12, clearProps: 'filter' }, 0.15)
    .from(fades, { opacity: 0, duration: 0.6 }, 0.6);

  // Scroll-out: name splits apart, portrait shrinks and fades.
  gsap.timeline({
    scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
    defaults: { ease: 'none' },
  })
    // fromTo with immediateRender:false so the scroll-out never captures the
    // entrance tween's starting opacity (0) as its own start value.
    .fromTo(ray, { xPercent: 0 }, { xPercent: -80, immediateRender: false }, 0)
    .fromTo(lai, { xPercent: 0 }, { xPercent: 80, immediateRender: false }, 0)
    .fromTo(portrait, { scale: 1, opacity: 1 }, { scale: 0.8, opacity: 0.2, immediateRender: false }, 0)
    .fromTo(fades, { opacity: 1 }, { opacity: 0, immediateRender: false }, 0);
}

/* ---------- Generic reveal ---------- */
function reveals() {
  const items = gsap.utils.toArray<HTMLElement>('[data-reveal]');
  if (!items.length) return;
  gsap.set(items, { y: 32, opacity: 0 });
  ScrollTrigger.batch(items, {
    start: 'top 88%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.08, overwrite: true }),
  });
}

/* ---------- Spotlight rows: media slides in from its side ---------- */
function spotlights() {
  gsap.utils.toArray<HTMLElement>('[data-spot-media]').forEach((m) => {
    const body = m.parentElement!.querySelector('[data-spot-body]');
    const dir = m.dataset.from === 'right' ? 1 : -1;
    gsap.timeline({ scrollTrigger: { trigger: m, start: 'top 80%', once: true }, defaults: { ease: 'expo.out', duration: 1.1 } })
      .from(m, { xPercent: 12 * dir, opacity: 0 })
      .from(body ? body.children : [], { y: 24, opacity: 0, stagger: 0.07, duration: 0.8 }, 0.15);
  });
}

/* ---------- Marquees: scroll velocity nudges playback rate ---------- */
function marqueeVelocity() {
  const tracks = gsap.utils.toArray<HTMLElement>('[data-marquee] .marquee__track');
  if (!tracks.length) return;
  const state = { rate: 1 };
  const apply = () =>
    tracks.forEach((t) => t.getAnimations().forEach((a) => (a.playbackRate = state.rate)));
  ScrollTrigger.create({
    trigger: document.body,
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 800, 3);
      gsap.to(state, { rate: boost, duration: 0.2, overwrite: true, onUpdate: apply, onComplete: () => {
        gsap.to(state, { rate: 1, duration: 1.2, ease: 'power2.out', onUpdate: apply });
      } });
    },
  });
}

document.addEventListener('astro:page-load', () => {
  startLenis();
  if (firstLoad) {
    firstLoad = false;
    if (!location.hash) {
      window.scrollTo(0, 0);
      lenis?.scrollTo(0, { immediate: true, force: true });
    }
  }
  mm = gsap.matchMedia();
  mm.add(MOTION_OK, () => {
    hero();
    reveals();
    spotlights();
    marqueeVelocity();
  });
  lenis?.resize();
  ScrollTrigger.refresh();
});

document.addEventListener('astro:before-swap', () => {
  mm?.revert();
  mm = null;
});
