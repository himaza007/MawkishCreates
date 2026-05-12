import { useState, useEffect, useRef } from 'react'
import { IconClock, IconUsers, IconTrendingUp } from '../../components/Icons'
import { api } from '../../utils/api'
import '../../styles/service-page.css'

/* ─── Data ──────────────────────────────────────────────────── */
const plans = [
  {
    tier: 'TIER 01',
    name: 'Off the shelf',
    desc: "You hand us your socials and we take it from there. We handle everything — strategy, editing, posting, and growing your audience — so you don't have to think about it.",
    features: [
      'Niche & competitor analysis',
      'Content strategy & positioning',
      'Profile optimisation',
      'Scriptwriting (short-form content)',
      'Weekly content calendar',
      'Video editing',
      'Posting & scheduling',
      'Caption writing & CTA optimisation',
      'Community engagement',
      'Performance tracking & reporting',
      'Automation implementation (Manychat)',
      'Monetisation roadmap',
    ],
  },
  {
    tier: 'TIER 02',
    name: 'Tailor made',
    desc: 'You get everything in Off the shelf, plus we come to you. We film, direct, and produce content on-site so what your audience sees actually looks and feels like your brand.',
    features: [
      'Everything in Off the shelf, plus:',
      'On-site filming',
      'Creative direction',
      'Shot planning & execution',
      'High-production content',
      'Brand storytelling visuals',
    ],
    featured: true,
  },
  {
    tier: 'TIER 03',
    name: 'Growth Accelerator',
    desc: 'You want to build your own brand but you need the right tools to do it. We give you the strategy, the systems, and weekly live sessions to make it happen on your own terms.',
    features: [
      'Personal brand positioning',
      'Content strategy frameworks',
      'Viral content systems',
      'Hook writing & storytelling',
      'Monetisation strategy',
      'Offer creation',
      'Weekly live sessions',
      'Templates & frameworks',
    ],
  },
]

/* Comparison table data */
const tableGroups = [
  {
    group: 'Strategy & Planning',
    rows: [
      { label: 'Niche & competitor analysis',    t1: true,  t2: true,  t3: true  },
      { label: 'Content strategy & positioning', t1: true,  t2: true,  t3: true  },
      { label: 'Profile optimisation',           t1: true,  t2: true,  t3: false },
      { label: 'Weekly content calendar',        t1: true,  t2: true,  t3: false },
    ],
  },
  {
    group: 'Content Production',
    rows: [
      { label: 'Scriptwriting (short-form)',     t1: true,  t2: true,  t3: false },
      { label: 'Video editing',                  t1: true,  t2: true,  t3: false },
      { label: 'On-site filming',                t1: false, t2: true,  t3: false },
      { label: 'Creative direction',             t1: false, t2: true,  t3: false },
      { label: 'High-production content',        t1: false, t2: true,  t3: false },
      { label: 'Brand storytelling visuals',     t1: false, t2: true,  t3: false },
    ],
  },
  {
    group: 'Distribution & Growth',
    rows: [
      { label: 'Posting & scheduling',           t1: true,  t2: true,  t3: false },
      { label: 'Caption writing & CTA optimisation', t1: true, t2: true, t3: false },
      { label: 'Community engagement',           t1: true,  t2: true,  t3: false },
      { label: 'Automation (Manychat)',          t1: true,  t2: true,  t3: false },
    ],
  },
  {
    group: 'Monetisation & Education',
    rows: [
      { label: 'Performance tracking & reporting', t1: true, t2: true, t3: false },
      { label: 'Monetisation roadmap',           t1: true,  t2: true,  t3: true  },
      { label: 'Offer creation',                 t1: false, t2: false, t3: true  },
      { label: 'Viral content systems',          t1: false, t2: false, t3: true  },
      { label: 'Hook writing & storytelling',    t1: false, t2: false, t3: true  },
      { label: 'Weekly live sessions',           t1: false, t2: false, t3: true  },
      { label: 'Templates & frameworks',         t1: false, t2: false, t3: true  },
    ],
  },
]

const processSteps = [
  { n: '01', title: 'Discovery Call',  desc: 'We learn about your business, goals, and current challenges in a free 30-min call.' },
  { n: '02', title: 'Strategy Build',  desc: 'Our team crafts a custom marketing strategy tailored to your goals and budget.' },
  { n: '03', title: 'Proposal Review', desc: 'We present your plan with clear pricing, timelines, and expected outcomes.' },
  { n: '04', title: 'Campaign Launch', desc: 'Onboarding, setup, and your first campaign goes live within 7 business days.' },
]

const promises = [
  { Icon: IconClock,       title: 'Response within 24 hours',  desc: 'Our team will be in touch quickly to schedule your discovery call.' },
  { Icon: IconUsers,       title: 'Dedicated strategy session', desc: 'A free 30-minute call to understand your business and goals.' },
  { Icon: IconTrendingUp,  title: 'Custom proposal',            desc: 'We will build a tailored plan specific to your industry and budget.' },
]

/* ─── Helpers ───────────────────────────────────────────────── */
function Check({ featured }) {
  return (
    <span className="smm-check">✓</span>
  )
}

function Dash() {
  return <span className="smm-dash" />
}

function useScrollReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.12 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

/* ─── Component ─────────────────────────────────────────────── */
export default function SocialMediaMgmtWwU() {
  const [processRef, processVisible] = useScrollReveal()

  const [form, setForm] = useState({
    name: '', company: '', email: '', phone: '',
    industry: '', budget: '', socialHandles: '', description: '',
  })
  const [submitted,   setSubmitted]   = useState(false)
  const [submitting,  setSubmitting]  = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)
    try {
      await api.post('/leads', { ...form, service: 'Social Media Management' })
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="page-hero" aria-label="Social Media Management hero">
        <div className="container">
          <div className="page-hero-label">Work With Us</div>
          <h1 className="page-hero-title">
            Social Media<br />
            <em style={{ fontStyle: 'italic', color: 'var(--purple-300)' }}>Management</em>
          </h1>
          <p className="page-hero-desc">
            Choose the level of support that's right for you — from fully managed
            to in-person production to building your brand independently.
          </p>
        </div>
      </section>

      {/* ── Tier Cards ──────────────────────────────────────────── */}
      <section className="smm-plans-section">
        <div className="container">
          <div className="plans-header">
            <p className="section-label">Our Services</p>
            <h2 className="section-title">
              Choose Your <span className="highlight">Level of Support</span>
            </h2>
            <p className="section-subtitle" style={{ marginTop: 'var(--space-3)', color: 'rgba(255,255,255,0.5)' }}>
              Three tiers designed around how involved you want to be.
            </p>
          </div>

          <div className="smm-tiers-grid">
            {plans.map(plan => (
              <div
                key={plan.name}
                className={`smm-tier-card${plan.featured ? ' smm-tier-featured' : ''}`}
              >
                {plan.featured && <div className="smm-tier-badge">Most Popular</div>}

                <div className="smm-tier-head">
                  <div className="smm-tier-label">{plan.tier}</div>
                  <div className="smm-tier-name">{plan.name}</div>
                  <p className="smm-tier-desc">{plan.desc}</p>
                </div>

                <div className="smm-tier-body">
                  {plan.features.map(f => (
                    <div key={f} className="smm-tier-feature">
                      <div className="smm-tier-feature-icon">✓</div>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing Comparison Chart ─────────────────────────────── */}
      <section className="smm-compare-section">
        <div className="container">
          <div className="smm-compare-header">
            <p className="smm-compare-label">Side by Side</p>
            <h2 className="smm-compare-title">
              What's Included in <span className="highlight">Each Tier</span>
            </h2>
          </div>

          <div className="smm-pricing-chart">
            {/* Sticky column headers — tier cards */}
            <div className="smm-chart-head">
              <div className="smm-chart-head-spacer" />
              {plans.map(plan => (
                <div
                  key={plan.name}
                  className={`smm-chart-col-head${plan.featured ? ' smm-chart-col-featured' : ''}`}
                >
                  {plan.featured && <div className="smm-chart-popular">Most Popular</div>}
                  <div className="smm-chart-tier">{plan.tier}</div>
                  <div className="smm-chart-name">{plan.name}</div>
                </div>
              ))}
            </div>

            {/* Feature rows grouped by category */}
            {tableGroups.map(({ group, rows }) => (
              <div key={group} className="smm-chart-group">
                <div className="smm-chart-group-label">
                  <span>{group}</span>
                </div>
                {rows.map(({ label, t1, t2, t3 }, i) => (
                  <div key={label} className={`smm-chart-row${i % 2 === 0 ? ' smm-chart-row-alt' : ''}`}>
                    <div className="smm-chart-feature-label">{label}</div>
                    <div className="smm-chart-cell">{t1 ? <Check /> : <Dash />}</div>
                    <div className="smm-chart-cell smm-chart-cell-featured">{t2 ? <Check featured /> : <Dash />}</div>
                    <div className="smm-chart-cell">{t3 ? <Check /> : <Dash />}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process ─────────────────────────────────────────────── */}
      <section className="smm-process-section">
        <div className="container">
          <p className="smm-process-label">How It Works</p>
          <h2 className="smm-process-title">
            From Inquiry to <span className="highlight">Live Campaign</span>
          </h2>
          <div className="smm-process-steps" ref={processRef}>
            {processSteps.map(({ n, title, desc }) => (
              <div key={n} className={`smm-process-step${processVisible ? ' revealed' : ''}`}>
                <div className="smm-step-num">{n}</div>
                <div className="smm-step-title">{title}</div>
                <div className="smm-step-desc">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Form ────────────────────────────────────────────────── */}
      <section className="smm-form-section">
        <div className="container">
          <div className="smm-form-inner">

            {/* Left info */}
            <div>
              <p className="smm-form-info-label">Get Started</p>
              <h2 className="smm-form-heading">
                Let's Grow Your <span className="highlight">Social Presence</span>
              </h2>
              <p className="smm-form-subtext">
                Tell us about your business and current social media situation.
                We'll put together a custom management proposal within 24 hours.
              </p>
              <div className="smm-promises">
                {promises.map(({ Icon, title, desc }) => (
                  <div key={title} className="smm-promise">
                    <div className="smm-promise-icon">
                      <Icon size={20} strokeWidth={1.5} color="var(--purple-300)" />
                    </div>
                    <div>
                      <strong className="smm-promise-title">{title}</strong>
                      <span className="smm-promise-desc">{desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right form */}
            <div className="smm-form-card">
              {submitted ? (
                <div className="smm-success">
                  <div className="smm-success-icon">✓</div>
                  <h3>Inquiry Received!</h3>
                  <p>Thank you for reaching out. We'll be in touch within 24 hours to schedule your discovery call.</p>
                </div>
              ) : (
                <div className="smm-form-fields">
                  <div className="smm-form-row">
                    <div className="smm-form-group">
                      <label htmlFor="name">Full Name *</label>
                      <input id="name" name="name" type="text" required placeholder="Jane Smith"
                        value={form.name} onChange={handleChange} />
                    </div>
                    <div className="smm-form-group">
                      <label htmlFor="company">Company Name *</label>
                      <input id="company" name="company" type="text" required placeholder="Your Company"
                        value={form.company} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="smm-form-row">
                    <div className="smm-form-group">
                      <label htmlFor="email">Email Address *</label>
                      <input id="email" name="email" type="email" required placeholder="jane@company.com"
                        value={form.email} onChange={handleChange} />
                    </div>
                    <div className="smm-form-group">
                      <label htmlFor="phone">Phone Number</label>
                      <input id="phone" name="phone" type="tel" placeholder="+1 (555) 000-0000"
                        value={form.phone} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="smm-form-group">
                    <label htmlFor="socialHandles">Social Media Handles</label>
                    <input id="socialHandles" name="socialHandles" type="text"
                      placeholder="@yourhandle on Instagram, TikTok, etc."
                      value={form.socialHandles} onChange={handleChange} />
                  </div>
                  <div className="smm-form-row">
                    <div className="smm-form-group">
                      <label htmlFor="industry">Business Industry *</label>
                      <select id="industry" name="industry" required value={form.industry} onChange={handleChange}>
                        <option value="">Select industry</option>
                        {['E-Commerce','Hospitality','Technology','Real Estate','Healthcare',
                          'Food & Beverage','Education','Finance','Retail','Other'].map(i => (
                          <option key={i} value={i}>{i}</option>
                        ))}
                      </select>
                    </div>
                    <div className="smm-form-group">
                      <label htmlFor="budget">Monthly Budget</label>
                      <select id="budget" name="budget" value={form.budget} onChange={handleChange}>
                        <option value="">Select budget</option>
                        {['Under $1,000/mo','$1,000–$3,000/mo','$3,000–$5,000/mo',
                          '$5,000–$10,000/mo','$10,000+/mo'].map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="smm-form-group">
                    <label htmlFor="description">Tell Us About Your Goals</label>
                    <textarea id="description" name="description" rows={4}
                      placeholder="What are you hoping to achieve? Any context about your business or current challenges..."
                      value={form.description} onChange={handleChange} />
                  </div>

                  {submitError && <p className="smm-form-error" role="alert">{submitError}</p>}

                  <button className="smm-form-submit" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? 'Sending…' : "Submit Inquiry — Let's Talk →"}
                  </button>
                  <p className="smm-form-disclaimer">
                    By submitting, you agree to our Privacy Policy. We'll never share your information.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>
    </>
  )
}