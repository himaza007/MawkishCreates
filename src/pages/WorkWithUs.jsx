import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGsapReveal } from '../hooks/useAnimations'
import {
  IconTarget, IconSmartphone, IconCalendar, IconArrowRight,
  IconZap, IconGlobe, IconBarChart, IconUsers
} from '../components/Icons'
import '../styles/workwithus.css'

/* ── Data ─────────────────────────────────────────────────── */
const services = [
  /* ── LEADGEN — commented out ────────────────────────────────
  {
    index: '01',
    Icon: IconTarget,
    label: 'Lead Generation',
    tagline: 'Fill your pipeline.',
    desc: 'Precision-engineered campaigns that deliver high-quality, conversion-ready leads directly into your pipeline — consistently, every month.',
    highlights: ['Targeted social ad campaigns', 'Lead qualification & scoring', 'CRM integration & nurture', 'Up to 150+ leads/month'],
    metric: '150+',
    metricLabel: 'Leads / Month',
    accentColor: '#7b2ff7',
    to: '/work-with-us/lead-generation',
  },
  ── END LEADGEN ─────────────────────────────────────────────── */

  {
    index: '02',
    Icon: IconSmartphone,
    label: 'Social Media',
    tagline: 'Own the feed.',
    desc: 'End-to-end social media management or expert coaching — choose the approach that fits how you want to work.',
    highlights: ['Off the shelf', 'Tailor made', 'Growth Accelerator'],
    metric: '5×',
    metricLabel: 'Avg Engagement Lift',
    accentColor: '#c9a84c',
    to: '/work-with-us/social-media-management',
  },
  {
    index: '03',
    Icon: IconCalendar,
    label: 'Event Management',
    tagline: 'Build the moment.',
    desc: 'Strategic event marketing that builds buzz before, amplifies your brand during, and creates lasting content after every event.',
    highlights: ['Pre & post-event campaigns', 'Live social media coverage', 'Event graphics & content', 'Ticketing & attendance growth'],
    metric: '3×',
    metricLabel: 'Attendance Growth',
    accentColor: '#e879b0',
    to: '/work-with-us/events',
  },
  {
    index: '04',
    Icon: IconGlobe,
    label: 'Web Development',
    tagline: 'Make it unforgettable.',
    desc: 'High-performance websites and landing pages crafted to convert — every pixel purposeful, every interaction intentional.',
    highlights: ['Custom design & development', 'Conversion-optimised UX', 'CMS & e-commerce ready', 'SEO-first architecture'],
    metric: '98',
    metricLabel: 'Avg Lighthouse Score',
    accentColor: '#5eead4',
    to: '/work-with-us/web-development',
  },
]

const stats = [
  { Icon: IconUsers,    value: '200+', label: 'Brands Scaled' },
  { Icon: IconBarChart, value: '4.8×', label: 'Avg ROI' },
  { Icon: IconZap,      value: '48h',  label: 'Avg Onboarding' },
  { Icon: IconTarget,   value: '97%',  label: 'Client Retention' },
]

/* ── Animated counter ─────────────────────────────────────── */
function CountUp({ value }) {
  const ref  = useRef(null)
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const num = parseFloat(value.replace(/[^0-9.]/g, ''))
    const suffix = value.replace(/[0-9.]/g, '')
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      obs.disconnect()
      const start = performance.now()
      const dur   = 1600
      const tick  = (now) => {
        const p = Math.min((now - start) / dur, 1)
        const easedP = 1 - Math.pow(1 - p, 3)
        const cur = num % 1 === 0
          ? Math.floor(easedP * num)
          : (easedP * num).toFixed(1)
        setDisplay(`${cur}${suffix}`)
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [value])

  return <span ref={ref}>{display}</span>
}

/* ── Service Row (horizontal editorial layout) ────────────── */
function ServiceRow({ s, i }) {
  const rowRef = useRef(null)
  const [hovered, setHovered] = useState(false)

  return (
    <div
      ref={rowRef}
      className={`wwu-row gsap-reveal`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ '--row-accent': s.accentColor }}
    >
      {/* Left: index + icon */}
      <div className="wwu-row-index">
        <span className="wwu-row-num">{s.index}</span>

      </div>

      {/* Centre-left: label + tagline + desc */}
      <div className="wwu-row-main">
        <div className="wwu-row-heading-wrap">
    <div className="wwu-row-heading-text">
      <div className="wwu-row-label">{s.label}</div>
      <h2 className="wwu-row-tagline">{s.tagline}</h2>
    </div>

    <div className="wwu-row-metric wwu-row-metric--mobile">
      <div className="wwu-row-metric-num">
        <CountUp value={s.metric} />
      </div>
      <div className="wwu-row-metric-label">{s.metricLabel}</div>
    </div>
  </div>

  <p className="wwu-row-desc">{s.desc}</p>
      </div>

      {/* Centre-right: feature list */}
      <div className="wwu-row-features">
        {s.highlights.map(h => (
          <div key={h} className="wwu-row-feature">
            <span className="wwu-row-dot" />
            {h}
          </div>
        ))}
      </div>

      {/* Right: metric + CTA */}
      <div className="wwu-row-right">
        <div className="wwu-row-metric">
          <div className="wwu-row-metric-num">
            <CountUp value={s.metric} />
          </div>
          <div className="wwu-row-metric-label">{s.metricLabel}</div>
        </div>
        <Link to={s.to} className="wwu-row-cta">
          <span>Explore</span>
          <IconArrowRight size={16} strokeWidth={2} />
        </Link>
      </div>

      {/* Hover accent line */}
      <div className="wwu-row-accent-line" />
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────── */
export default function WorkWithUs() {
  const statsRef   = useGsapReveal({ stagger: 0.1, y: 40, start: 'top 85%' })
  const rowsRef    = useGsapReveal({ stagger: 0.12, y: 60, start: 'top 82%' })
  const ctaRef     = useGsapReveal({ stagger: 0.14, y: 40, start: 'top 88%' })

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="wwu-hero page-hero" aria-label="Work With Us hero">
        <div className="noise-overlay" aria-hidden="true" />
        <div className="wwu-hero-glow" aria-hidden="true" />

        <div className="container wwu-hero-container">

          {/* Main title block */}
          <div className="wwu-hero-title-block">
            <h1 className="wwu-hero-title">
              <span className="wwu-hero-title-line wwu-hero-title-line--outlined">WORK</span>
              <span className="wwu-hero-title-line wwu-hero-title-line--filled">WITH</span>
              <span className="wwu-hero-title-line wwu-hero-title-line--italic">Us.</span>
            </h1>
          </div>

          {/* Bottom info row */}
          <div className="wwu-hero-bottombar">

            {/* Scroll hint */}
            <div className="wwu-hero-scroll">
              <div className="wwu-hero-scroll-track">
                <div className="wwu-hero-scroll-thumb" />
              </div>
              <span>Scroll</span>
            </div>
          </div>

        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────── */}
      <section className="wwu-stats-bar" aria-label="Key stats" ref={statsRef}>
        <div className="container">
          <div className="wwu-stats-inner">
            {stats.map(({ Icon, value, label }) => (
              <div key={label} className="wwu-stat gsap-reveal">
                <div className="wwu-stat-icon"><Icon size={18} strokeWidth={1.5} /></div>
                <div className="wwu-stat-value"><CountUp value={value} /></div>
                <div className="wwu-stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services — editorial rows ─────────────────────────── */}
      <section className="wwu-services" aria-label="Services" ref={rowsRef}>
        <div className="container">

          {/* Section header */}
          <div className="wwu-services-header">
            <div className="section-label">Our Services</div>
            <h2 className="wwu-services-heading">
              Three ways to <span className="highlight">grow.</span>
            </h2>
          </div>

          {/* Rows */}
          <div className="wwu-rows">
            {services.map((s, i) => (
              <ServiceRow key={s.index} s={s} i={i} />
            ))}
          </div>

        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────── */}
      <section className="wwu-end-cta" aria-label="Discovery call CTA" ref={ctaRef}>
        <div className="noise-overlay" aria-hidden="true" />
        <div className="wwu-end-cta-orb" aria-hidden="true" />
        <div className="container">
          <div className="wwu-end-cta-inner">
            <div className="wwu-end-cta-label gsap-reveal">Not sure where to start?</div>
            <h2 className="wwu-end-cta-title gsap-reveal">
              Let's figure it<br /><em>out together.</em>
            </h2>
            <p className="wwu-end-cta-desc gsap-reveal">
              Book a free 30-minute discovery call and we'll map out exactly
              what your business needs to grow — no pressure, no pitch.
            </p>
            <a
              href="mailto:hello@mawkishcreates.com"
              className="wwu-end-cta-btn gsap-reveal"
            >
              Book a Free Discovery Call
              <IconArrowRight size={18} strokeWidth={2} />
            </a>
            <p className="wwu-end-cta-fine gsap-reveal">
              Free · No commitment · 30 minutes
            </p>
          </div>
        </div>
      </section>
    </>
  )  
}
