import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  IconTarget, IconEye,
  IconZap, IconSearch, IconUsers, IconBarChart, IconGlobe, IconAward,
  IconHeart,
} from '../components/Icons'
import {
  useScrollReveal,
  useGsapReveal,
} from '../hooks/useAnimations'
import '../styles/about.css'

const pillars = [
  { title: 'Results First',      desc: 'Every strategy, every campaign, every decision is evaluated by one standard: does it generate measurable results for our clients?' },
  { title: 'Data-Driven',        desc: 'We let data guide our creative decisions. Every campaign is backed by research, tested, and continuously optimised.' },
  { title: 'Creative Depth',     desc: 'Beyond metrics, we craft stories that resonate. Great marketing speaks to both the mind and the heart.' },
  { title: 'Long-Term Thinking', desc: "We don't chase vanity metrics. We build sustainable marketing systems that compound over time." },
]

const missionCards = [
  {
    Icon: IconTarget,
    title: 'Our Mission',
    text: 'To design structured systems that drive measurable growth for startups and established brands.',
  },
  {
    Icon: IconEye,
    title: 'Our Vision',
    text: 'To replace fragmented brand positioning with integrated growth systems.',
  },
]

const whyCards = [
  { Icon: IconZap,      title: 'Speed to Results',      desc: 'Our streamlined approach gets campaigns live and generating results faster than traditional agency timelines.' },
  { Icon: IconSearch,   title: 'Precision Targeting',   desc: 'Advanced audience segmentation ensures your message reaches the exact people most likely to convert.' },
  { Icon: IconUsers,    title: 'True Partnership',       desc: "We embed ourselves in your business goals, acting as a dedicated marketing partner rather than a vendor." },
  { Icon: IconBarChart, title: 'Transparent Reporting', desc: 'Clear, honest reporting with no vanity metrics. You always know exactly what your investment is doing.' },
  { Icon: IconGlobe,    title: 'Full-Stack Marketing',  desc: 'From strategy to execution, creative to analytics — one team handles everything seamlessly.' },
  { Icon: IconAward,    title: 'Proven Track Record',   desc: 'Over 200 businesses scaled. Our portfolio speaks for itself with real, verifiable results.' },
]

const tributes = [
  { name: 'Harith Malick',    role: 'Brother',  note: 'For inspiring the name behind this vision.' },
  { name: 'M J M Malick',    role: 'Father',   note: 'For the sacrifices that made this journey possible.' },
  { name: 'Our Mother',       role: 'Mother',   note: 'For the resilience and possibility she brought into our lives.' },
]

/* ── Pinned Storytelling Block ──────────────────────────────
   GSAP pins the founder story section while the 4 narrative
   blocks appear one by one as the user scrolls through them.
   Falls back gracefully to staggered reveal if GSAP is absent.
─────────────────────────────────────────────────────────────── */
function PinnedFounderStory({ narrativeRef }) {
  const pinnedRef = useRef(null)

  useEffect(() => {
    const el = pinnedRef.current
    if (!el) return

    let ctx
    import('gsap').then(({ gsap }) => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger)

        const blocks = el.querySelectorAll('.founder-block')
        if (!blocks.length) return

        ctx = gsap.context(() => {
          // Fade each block in as the user scrolls
          blocks.forEach((block, i) => {
            gsap.fromTo(block,
              { opacity: 0, x: -40 },
              {
                opacity: 1,
                x: 0,
                duration: 0.85,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: block,
                  start: 'top 78%',
                  toggleActions: 'play none none reverse',
                },
              }
            )
          })

          // Subtle parallax on the quote card
          const quoteCard = el.querySelector('.founder-quote-card')
          if (quoteCard) {
            gsap.fromTo(quoteCard,
              { opacity: 0, y: 60, scale: 0.96 },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1,
                ease: 'expo.out',
                scrollTrigger: {
                  trigger: quoteCard,
                  start: 'top 80%',
                  toggleActions: 'play none none none',
                },
              }
            )
          }

          // Tribute items stagger in
          const tributeItems = el.querySelectorAll('.tribute-item')
          if (tributeItems.length) {
            gsap.fromTo(tributeItems,
              { opacity: 0, y: 30 },
              {
                opacity: 1,
                y: 0,
                duration: 0.7,
                ease: 'power2.out',
                stagger: 0.15,
                scrollTrigger: {
                  trigger: tributeItems[0],
                  start: 'top 82%',
                  toggleActions: 'play none none none',
                },
              }
            )
          }

          // Badge row
          const badges = el.querySelectorAll('.founder-badge')
          if (badges.length) {
            gsap.fromTo(badges,
              { opacity: 0, scale: 0.8, y: 20 },
              {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 0.6,
                ease: 'back.out(1.7)',
                stagger: 0.12,
                scrollTrigger: {
                  trigger: badges[0],
                  start: 'top 85%',
                  toggleActions: 'play none none none',
                },
              }
            )
          }
        }, el)
      })
    }).catch(() => {
      // Fallback: simple class-based reveal
      const obs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          el.querySelectorAll('.founder-block').forEach((b, i) => {
            setTimeout(() => b.classList.add('revealed'), i * 150)
          })
          obs.disconnect()
        }
      }, { threshold: 0.1 })
      obs.observe(el)
    })

    return () => ctx?.revert()
  }, [])

  return pinnedRef
}

export default function About() {
  const missionRef  = useGsapReveal({ stagger: 0.18, y: 50 })
  const whyRef      = useGsapReveal({ stagger: 0.12, y: 45 })
  const philosophyRef = useGsapReveal({ stagger: 0.14, y: 40 })
  const heroRevealRef = useGsapReveal({ stagger: 0.15, y: 60, start: 'top 90%' })

  // (no word-split on the hero h1 — it has styled <em> children we must preserve)

  // Founder story GSAP (blocks + quote + tributes)
  const founderRef = useRef(null)
  const pinnedRefCallback = PinnedFounderStory({ narrativeRef: founderRef })

  // Attach both refs to the same element
  const founderSectionRef = useRef(null)
  useEffect(() => {
    if (founderSectionRef.current) {
      founderRef.current = founderSectionRef.current
      if (pinnedRefCallback) {
        pinnedRefCallback.current = founderSectionRef.current
      }
    }
  }, [])

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="about-hero page-hero" aria-label="About page hero" ref={heroRevealRef}>
        <div className="noise-overlay" aria-hidden="true" />
        <div className="container">
          <p className="page-hero-label gsap-reveal">Our Story</p>
          <h1 className="page-hero-title gsap-reveal">
            From a Childhood Memory<br />
            <em style={{ fontStyle: 'italic', color: 'var(--purple-300)' }}>to a Global Vision</em>
          </h1>
          <p className="page-hero-desc gsap-reveal">
            Mawkish Creates is more than a business. It is a tribute, a legacy, and a promise.
          </p>
        </div>
      </section>

      {/* ── Founder Story ─────────────────────────────────────── */}
      {/*
        founderSectionRef → GSAP animates each .founder-block,
        the quote card, tribute items, and badges separately with
        individual ScrollTriggers for a layered storytelling feel.
      */}
      <section
        className="founder-story section"
        aria-labelledby="founder-heading"
        ref={founderSectionRef}
      >
        <div className="container">
          <div className="founder-inner">

            {/* Timeline narrative */}
            <div className="founder-content">
              <p className="section-label">The Name Behind the Brand</p>
              <h2 id="founder-heading" className="section-title">
                Where <span className="highlight">Mawkish</span> Began
              </h2>
              <div className="divider" />

              <div className="founder-narrative" ref={founderRef}>
                {/* Each block has its own ScrollTrigger in PinnedFounderStory */}
                <div className="founder-block">
                  <div className="founder-block-year"></div>
                  <p>
                    Our story begins at home 
                    — where family was everything. While our
                    father, <strong>M J M Malick</strong>, worked for SriLankan Airlines in Al Khobar,
                    Saudi Arabia, he quietly collected reward points with every ticket he sold. Not for
                    himself, but for us.
                  </p>
                </div>

                <div className="founder-block">
                  <div className="founder-block-year"></div>
                  <p>
                    When our brother <strong>Harith Malick</strong> excelled in the Grade 5 Scholarship
                    Exam, our father redeemed those hard-earned points to bring home our very first{' '}
                    <strong>PlayStation One</strong>. That moment sparked our earliest love for
                    technology — and introduced the name that would stay with us through every game,
                    every memory, every late-night session.
                  </p>
                </div>

                <div className="founder-block founder-block-highlight">
                  <div className="founder-block-year"></div>
                  <p>
                    <strong className="name-highlight">Mawkish</strong> — my brother's gaming name.
                    As brothers, we grew up driven by healthy competition — on the football field, the
                    cricket pitch, and in front of a screen. That drive shaped who I am and ultimately
                    inspired the identity of the company founded.
                  </p>
                </div>

                <div className="founder-block">
                  <div className="founder-block-year"></div>
                  <p>
                    Mawkish was founded in 2020 and we began actively building it from
                    October 2025. As we enter our next chapter, we move forward with renewed purpose —
                    carrying every family memory, every sacrifice, and every lesson into everything we
                    create for our clients.
                  </p>
                </div>
              </div>
            </div>

            {/* Right — Quote + Tribute */}
            <div className="founder-visual">
              <div className="founder-quote-card">
                <div className="founder-quote-mark" aria-hidden="true">"</div>
                <p className="founder-quote-text">
                  Mawkish is more than a company. It is a tribute, a legacy, and a promise.
                </p>
                <div className="founder-quote-sub">
                  From Sri Lanka to the world — our journey continues.
                </div>
              </div>

              {/* Tribute block */}
              <div className="founder-tribute">
                <div className="founder-tribute-header">
                  <IconHeart size={16} strokeWidth={1.75} color="var(--purple-400)" />
                  <span>With Gratitude</span>
                </div>
                {tributes.map(({ name, role, note }) => (
                  <div key={name} className="tribute-item">
                    <div className="tribute-avatar" aria-hidden="true">
                      {name.charAt(0)}
                    </div>
                    <div className="tribute-body">
                      <div className="tribute-name">{name}</div>
                      <div className="tribute-role">{role}</div>
                      <div className="tribute-note">{note}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Founded badge */}
              <div className="founder-badge-row">
                <div className="founder-badge">
                  <div className="founder-badge-num">2020</div>
                  <div className="founder-badge-text">Founded</div>
                </div>
                <div className="founder-badge">
                  <div className="founder-badge-num">SL</div>
                  <div className="founder-badge-text">Sri Lanka</div>
                </div>
                <div className="founder-badge">
                  <div className="founder-badge-num">∞</div>
                  <div className="founder-badge-text">Global Vision</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Mission & Vision ──────────────────────────────────── */}
      <section className="mission-section section" aria-labelledby="mission-heading" ref={missionRef}>
        <div className="container">
          <p className="section-label gsap-reveal">Our Direction</p>
          <h2 id="mission-heading" className="section-title gsap-reveal">
            Mission & <span className="highlight">Vision</span>
          </h2>
          <div className="mission-grid">
            {missionCards.map(({ Icon, title, text }) => (
              <div key={title} className="mission-card gsap-reveal">
                <Icon size={36} strokeWidth={1.4} color="var(--purple-600)" className="mission-card-icon" />
                <h3 className="mission-card-title">{title}</h3>
                <p className="mission-card-text">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Philosophy ────────────────────────────────────────── */}
      <section className="philosophy-section section" aria-labelledby="philosophy-heading" ref={philosophyRef}>
        <div className="container">
          <div className="philosophy-inner">
            <div>
              <p className="section-label gsap-reveal">How We Think</p>
              <h2 id="philosophy-heading" className="section-title gsap-reveal">
                Our Company <span className="highlight">Philosophy</span>
              </h2>
              <div className="divider gsap-reveal" />
              <div className="philosophy-pillars">
                {pillars.map(({ title, desc }, i) => (
                  <div key={title} className="pillar-item gsap-reveal">
                    <div className="pillar-number">0{i + 1}</div>
                    <div className="pillar-content">
                      <div className="pillar-title">{title}</div>
                      <div className="pillar-desc">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="philosophy-visual gsap-reveal">
              <div className="philosophy-quote-block">
                <p className="philosophy-quote-text">
                  "Marketing is no longer about the stuff that you make, but about the stories you tell — and the results they create."
                </p>
                <div className="philosophy-quote-author">— The Mawkish Creates Ethos</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ─────────────────────────────────────── */}
      <section className="why-section section" aria-labelledby="why-heading" ref={whyRef}>
        <div className="container">
          <div className="why-header">
            <p className="section-label gsap-reveal">Our Advantage</p>
            <h2 id="why-heading" className="section-title gsap-reveal">
              Why Businesses Choose <span className="highlight">Mawkish Creates</span>
            </h2>
            <p className="section-subtitle gsap-reveal">
              Beyond campaigns and content, we bring a strategic partnership that compounds over time.
            </p>
          </div>
          <div className="why-grid">
            {whyCards.map(({ Icon, title, desc }) => (
              <div key={title} className="why-card gsap-reveal">
                <Icon size={32} strokeWidth={1.4} color="var(--purple-300)" className="why-card-icon" />
                <h3 className="why-card-title">{title}</h3>
                <p className="why-card-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}