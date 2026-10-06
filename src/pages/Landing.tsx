import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { lazy, Suspense } from 'react';
import Reveal from '@/components/ui/Reveal';
import ButtonLink from '@/components/ui/ButtonLink';
import { SIGNS, getSign } from '@/data/signs';

const SignHandViewer = lazy(() => import('@/components/3d/SignHandViewer'));

const FLOATERS = ['hello', 'thank-you', 'help', 'yes', 'no'];

const FLOATER_POS = [
  { top: '8%', left: '2%' },
  { top: '30%', right: '-2%' },
  { top: '60%', left: '-4%' },
  { bottom: '16%', right: '4%' },
  { bottom: '-2%', left: '22%' },
];

const HOW_IT_WORKS = [
  { n: '1', title: 'Select a sign', desc: 'Browse the dictionary or follow the guided beginner path.' },
  { n: '2', title: 'See the 3D hand', desc: 'Rotate, zoom and inspect the handshape from any angle.' },
  { n: '3', title: 'Watch the animation', desc: 'Play it slow, step through it keyframe by keyframe.' },
  { n: '4', title: 'Hear and read it', desc: 'Spoken word plus plain-language written instructions.' },
  { n: '5', title: 'Practice & quiz', desc: 'Rate yourself, then prove it with a quiz.' },
  { n: '6', title: 'Track progress', desc: 'Streaks, XP and a clear picture of what to revisit.' },
];

const FEATURES = [
  {
    id: 'learn-3d',
    icon: '🖐',
    title: 'Learn With 3D',
    desc: 'Every sign is a real 3D hand you can orbit, pause and step through — not a flat photo.',
    to: '/signs',
    cta: 'Explore signs',
  },
  {
    id: 'practice',
    icon: '🎯',
    title: 'Practice Your Signs',
    desc: 'Observe, then rate each sign easy, okay or difficult. The app adapts what it shows you next.',
    to: '/practice',
    cta: 'Start practice',
  },
  {
    id: 'communicate',
    icon: '🌉',
    title: 'Communicate With Confidence',
    desc: 'Type or speak a sentence and watch it break down into a sequence of signs you can open.',
    to: '/communicate',
    cta: 'Open the bridge',
  },
  {
    id: 'accessibility',
    icon: '♿',
    title: 'Accessibility First',
    desc: 'Text, voice, captions, high contrast, larger type and reduced motion — everything is optional and everything is available.',
    to: '/settings',
    cta: 'See settings',
  },
  {
    id: 'progress',
    icon: '📈',
    title: 'Progress Tracking',
    desc: 'Weekly activity, streaks, quiz accuracy and a honest list of signs you should revisit.',
    to: '/progress',
    cta: 'View progress',
  },
];

export function Landing() {
  const reduced = useReducedMotion();

  return (
    <>
      {/* ---------------------------------------------------------------- HERO */}
      <section className="relative overflow-hidden border-b border-line bg-surface dark:border-slate-800 dark:bg-[#0b1220]">
        <div className="sb-surface-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden />
        <div
          className="pointer-events-none absolute -left-32 -top-40 h-[26rem] w-[26rem] rounded-full bg-brand-300/25 blur-3xl dark:bg-brand-600/20"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-24 top-24 h-[22rem] w-[22rem] rounded-full bg-accent-300/25 blur-3xl dark:bg-accent-600/15"
          aria-hidden
        />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-6 lg:py-20">
          <div>
            <span className="sb-chip">
              <span className="h-2 w-2 rounded-full bg-accent-500" aria-hidden />
              Learn · Sign · Speak · Connect
            </span>

            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl dark:text-slate-50">
              Learn Sign Language.
              <br />
              <span className="text-brand-700 dark:text-accent-400">One Sign at a Time.</span>
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-2 dark:text-slate-400">
              An interactive way to learn, practice and communicate using 3D visual demonstrations,
              text and voice.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to="/learn" className="px-7 py-3.5 text-lg">
                Start Learning
              </ButtonLink>
              <ButtonLink to="/signs" variant="secondary" className="px-7 py-3.5 text-lg">
                Explore Signs
              </ButtonLink>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4">
              {[
                { k: `${SIGNS.length}`, v: 'Signs' },
                { k: '7', v: 'Categories' },
                { k: '100%', v: 'Offline demo' },
              ].map((s) => (
                <div key={s.v} className="rounded-2xl border border-line bg-surface-2 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-ink-3 dark:text-slate-500">
                    {s.v}
                  </dt>
                  <dd className="text-xl font-extrabold text-ink dark:text-slate-100">{s.k}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* 3D hero */}
          <div className="relative mx-auto w-full max-w-xl">
            <div className="relative">
              <Suspense
                fallback={
                  <div
                    className="sb-card grid place-items-center bg-slate-100 dark:bg-slate-900"
                    style={{ height: 440 }}
                    role="status"
                  >
                    <span className="text-sm text-ink-3">Loading 3D viewer…</span>
                  </div>
                }
              >
                <SignHandViewer
                  animationId="showcase"
                  height={440}
                  showControls={false}
                  autoPlay={!reduced}
                  label="Rotating 3D hand demonstrating sign language handshapes"
                />
              </Suspense>

              {FLOATERS.map((id, i) => {
                const s = getSign(id);
                if (!s) return null;
                return (
                  <motion.div
                    key={id}
                    style={FLOATER_POS[i]}
                    className="absolute z-10"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.45 }}
                  >
                    <motion.div
                      animate={reduced ? {} : { y: [0, -10, 0] }}
                      transition={{ duration: 5 + i * 0.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
                    >
                      <Link
                        to={`/sign/${s.id}`}
                        className="block rounded-2xl border border-line bg-surface/95 px-4 py-2.5 text-sm font-extrabold uppercase tracking-wide text-ink shadow-pop backdrop-blur transition hover:-translate-y-0.5 hover:border-brand-400 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-100"
                        title={`Learn the sign for ${s.word}`}
                      >
                        {s.word}
                        <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-normal text-ink-3 dark:text-slate-500">
                          {s.category}
                        </span>
                      </Link>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
            <p className="mt-4 text-center text-xs text-ink-3 dark:text-slate-500">
              Drag to rotate · every card opens a full lesson
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20" aria-labelledby="how-title">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-brand-600 dark:text-accent-400">
            How it works
          </p>
          <h2 id="how-title" className="sb-section-title mt-2">
            One clear path from seeing a sign to owning it
          </h2>
          <p className="sb-muted mt-3">
            No prior knowledge needed. Each sign follows the same six steps so you always know what
            comes next.
          </p>
        </Reveal>

        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HOW_IT_WORKS.map((h, i) => (
            <Reveal key={h.n} delay={i * 0.05} as="li">
              <div className="sb-card h-full p-5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-700 text-sm font-bold text-white dark:bg-brand-500">
                  {h.n}
                </span>
                <h3 className="mt-3 font-bold">{h.title}</h3>
                <p className="sb-muted mt-1 text-sm leading-relaxed">{h.desc}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* ------------------------------------------------------------ FEATURES */}
      <section className="border-y border-line bg-surface-2 dark:border-slate-800 dark:bg-[#0e1626]" aria-labelledby="features-title">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <Reveal className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-widest text-brand-600 dark:text-accent-400">
              Everything you need
            </p>
            <h2 id="features-title" className="sb-section-title mt-2">
              Built like a real product, not a demo
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.id} delay={i * 0.06} as="article">
                <div className={`sb-card flex h-full flex-col p-6 ${i === 0 ? 'lg:col-span-2' : ''}`}>
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-xl dark:bg-slate-800" aria-hidden>
                    {f.icon}
                  </span>
                  <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
                  <p className="sb-muted mt-2 flex-1 text-sm leading-relaxed">{f.desc}</p>
                  <Link
                    to={f.to}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:underline dark:text-accent-400"
                  >
                    {f.cta} <span aria-hidden>→</span>
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- ACCESSIBILITY */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20" aria-labelledby="a11y-title">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-widest text-brand-600 dark:text-accent-400">
              Accessibility first
            </p>
            <h2 id="a11y-title" className="sb-section-title mt-2">
              Designed for every learner
            </h2>
            <p className="sb-muted mt-3 leading-relaxed">
              Hearing, Deaf, hard-of-hearing, children, elderly learners and people with low vision
              all learn differently. Nothing in SignBridge depends on a single sense — every audio
              cue has text, every animation has written steps, and every control is keyboard
              reachable with a visible focus ring.
            </p>
            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {[
                'Text-to-speech on every sign',
                'Captions and written steps',
                'High contrast mode',
                '4 font sizes',
                'Reduced motion support',
                'Full keyboard navigation',
                'Dark & light themes',
                'Speech-to-text fallback input',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm font-medium">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-[11px] text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300" aria-hidden>
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-7">
              <ButtonLink to="/settings" variant="secondary">
                Open accessibility settings
              </ButtonLink>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="sb-card p-6">
              <h3 className="font-bold">Try it right now</h3>
              <p className="sb-muted mt-1 text-sm">
                Press <kbd className="rounded border border-line px-1.5 py-0.5 text-xs font-bold dark:border-slate-700">Ctrl</kbd> +{' '}
                <kbd className="rounded border border-line px-1.5 py-0.5 text-xs font-bold dark:border-slate-700">K</kbd> to search
                any sign, or <kbd className="rounded border border-line px-1.5 py-0.5 text-xs font-bold dark:border-slate-700">M</kbd> to
                toggle spoken audio.
              </p>
              <div className="mt-5 grid gap-3">
                {['thank-you', 'water', 'help'].map((id) => {
                  const s = getSign(id);
                  if (!s) return null;
                  return (
                    <Link
                      key={id}
                      to={`/sign/${id}`}
                      className="group flex items-center justify-between rounded-2xl border border-line px-4 py-3 transition hover:border-brand-400 hover:bg-brand-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      <span>
                        <span className="block font-bold">{s.word}</span>
                        <span className="sb-muted block text-xs">
                          {s.category} · {s.difficulty}
                        </span>
                      </span>
                      <span className="text-sm font-bold text-brand-700 group-hover:translate-x-0.5 dark:text-accent-400" aria-hidden>
                        →
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* --------------------------------------------------------------- CTA */}
      <section className="border-t border-line bg-brand-700 text-white dark:border-slate-800 dark:bg-brand-800">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            “I can actually learn sign language using this.”
          </h2>
          <p className="max-w-2xl text-lg text-brand-100">
            Start with one sign today. The whole beginner curriculum works offline, needs no account
            and no API key.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/learn"
              className="sb-btn bg-white px-8 py-3.5 text-lg text-brand-800 hover:bg-brand-50"
            >
              Start Learning
            </Link>
            <Link
              to="/signs"
              className="sb-btn border border-white/50 px-8 py-3.5 text-lg text-white hover:bg-white/10"
            >
              Explore Signs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default Landing;
