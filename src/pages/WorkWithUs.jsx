import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGsapReveal } from '../hooks/useAnimations'
import {
  IconTarget, IconSmartphone, IconCalendar, IconArrowRight,
  IconZap, IconGlobe, IconBarChart, IconUsers
} from '../components/Icons'
import '../styles/workwithus.css'

/* ── Services data — synced to subpages ───────────────────── */
const services = [
  {
    index: '01',
    Icon: IconTarget,
    label: 'Lead Generation',
    tagline: 'Fill your pipeline.',
    desc: 'Precision-engineered systems that attract and deliver high-quality leads directly into your pipeline — consistently, month after month.',
    // Reflects the 3 plans: Launch / Accelerate / Dominate
    highlights: [
      'Up to 150+ leads/month (Accelerate plan)',
      'Multi-platform ad campaigns',
      'Full lead qualification & CRM integration',
      'Nurture sequences & A/B testing',
    ],
    metric: '150+',
    metricLabel: 'Leads / Month',
    accentColor: '#7b2ff7',
    to: '/work-with-us/lead-generation',
    plans: ['Launch', 'Accelerate', 'Dominate'],
  },
  {
    index: '02',
    Icon: IconSmartphone,
    label: 'Social Media',
    tagline: 'Own the feed.',
    // Two paths: Done For You + Coaching
    desc: 'Two ways to work with us — fully managed social media or expert coaching to build your own in-house capability.',
    highlights: [
    ['Off the Shelf: strategy, editing, posting & growth', 
    'Tailor Made: on-site filming & high-production content',
    'Growth Accelerator: frameworks, systems & live sessions',]    ],
    metric: '5×',
    metricLabel: 'Avg Engagement Lift',
    accentColor: '#e879b0',
    to: '/work-with-us/social-media-management',
    plans: ['Off the Shelf', 'Tailor Made', 'Growth Accelerator'],
  },
  {
    index: '03',
    Icon: IconCalendar,
    label: 'Intelligent Events',
    tagline: 'Build the moment.',
    desc: 'Strategic event marketing that drives attendance, amplifies your brand, and creates content that lives on long after the event ends.',
    // Reflects: Single Event / Event Series / Annual Partner
    highlights: [
      'Pre & post-event campaign management',
      'Live social media coverage & graphics',
      'Influencer outreach & ticketing promotion',
      'From single events to annual partnerships',
    ],
    metric: '3×',
    metricLabel: 'Attendance Growth',
    accentColor: '#c9a84c',
    to: '/work-with-us/events',
    plans: ['Single Event', 'Event Series', 'Annual Partner'],
  },
  {
    index: '04',
    Icon: IconGlobe,
    label: 'Digital Solutions',
    tagline: 'Make it unforgettable.',
    desc: 'We design and develop high-performance digital solutions that don\'t just look good; engineered to convert, perform, and grow with your business.',
    // Reflects: Starter Websites / Business Websites / E-Commerce Solutions
    highlights: [
      'Starter to fully custom builds',
      'Advanced SEO & CMS integration',
      'E-commerce & payment gateway setup',
      'Performance optimised & secure',
    ],
    metric: '98',
    metricLabel: 'Avg Lighthouse Score',
    accentColor: '#5eead4',
    to: '/work-with-us/web-development',
    plans: ['Starter', 'Business', 'E-Commerce'],
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
    const num    = parseFloat(value.replace(/[^0-9.]/g, ''))
    const suffix = value.replace(/[0-9.]/g, '')
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      obs.disconnect()
      const start = performance.now()
      const dur   = 1600
      const tick  = (now) => {
        const p      = Math.min((now - start) / dur, 1)
        const easedP = 1 - Math.pow(1 - p, 3)
        const cur    = num % 1 === 0
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

/* ── Service Row ──────────────────────────────────────────── */
function ServiceRow({ s }) {
  return (
    <div
      className="wwu-row gsap-reveal"
      style={{ '--row-accent': s.accentColor }}
    >
      {/* Index */}
      <div className="wwu-row-index">
        <span className="wwu-row-num">{s.index}</span>
      </div>

      {/* Label + tagline + desc */}
      <div className="wwu-row-main">
        <div className="wwu-row-label">{s.label}</div>
        <h2 className="wwu-row-tagline">{s.tagline}</h2>
        <p className="wwu-row-desc">{s.desc}</p>

        {/* Plan tier pills */}
        <div className="wwu-row-plans">
          {s.plans.map(p => (
            <span key={p} className="wwu-row-plan-pill">{p}</span>
          ))}
        </div>
      </div>

      {/* Feature list */}
      <div className="wwu-row-features">
        {s.highlights.map(h => (
          <div key={h} className="wwu-row-feature">
            <span className="wwu-row-dot" />
            {h}
          </div>
        ))}
      </div>

      {/* Metric + CTA */}
      <div className="wwu-row-right">
        <div className="wwu-row-metric">
          <div className="wwu-row-metric-num">
            <CountUp value={s.metric} />
          </div>
          <div className="wwu-row-metric-label">{s.metricLabel}</div>
        </div>
        <Link to={s.to} className="wwu-row-cta" style={{ position: 'relative', zIndex: 2 }}>
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
  const statsRef = useGsapReveal({ stagger: 0.1,  y: 40, start: 'top 85%' })
  const rowsRef  = useGsapReveal({ stagger: 0.12, y: 60, start: 'top 82%' })
  const ctaRef   = useGsapReveal({ stagger: 0.14, y: 40, start: 'top 88%' })

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="wwu-hero" aria-label="Work With Us hero">
        <div className="noise-overlay" aria-hidden="true" />
        <div className="wwu-hero-glow" aria-hidden="true" />

        <div className="container wwu-hero-container">

          <div className="wwu-hero-title-block">
            <h1 className="wwu-hero-title">
              <span className="wwu-hero-title-line wwu-hero-title-line--outlined">WORK</span>
              <span className="wwu-hero-title-line wwu-hero-title-line--filled">WITH</span>
              <span className="wwu-hero-title-line wwu-hero-title-line--italic">Us.</span>
            </h1>
          </div>

          <div className="wwu-hero-bottombar">
            <p className="wwu-hero-sub">
              Select the service that aligns with your goals.<br />
              Each path has its own plans, pricing, and inquiry form.
            </p>
            <div className="wwu-hero-pills" aria-hidden="true">
              <span className="wwu-hero-pill">Lead Generation</span>
              <span className="wwu-hero-pill wwu-hero-pill--accent">Social Media</span>
              <span className="wwu-hero-pill">Intelligent Events</span>
              <span className="wwu-hero-pill wwu-hero-pill--outline">Web Development</span>
            </div>
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
          <div className="wwu-services-header">
            <div className="section-label">Our Services</div>
            <h2 className="wwu-services-heading">
              Four ways to <span className="highlight">grow.</span>
            </h2>
          </div>
          <div className="wwu-rows">
            {services.map((s) => (
              <ServiceRow key={s.index} s={s} />
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