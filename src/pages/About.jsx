import { useScrollReveal } from '../hooks/useAnimations'
import {
  IconTarget, IconEye,
  IconZap, IconSearch, IconUsers, IconBarChart, IconGlobe, IconAward,
  IconMail, IconPhone,
} from '../components/Icons'
import '../styles/about.css'

/* ── Data ──────────────────────────────────────────────────── */
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
    text: 'To replace fragmented brand positioning with integrated growth systems that compound over time.',
  },
]

const whyCards = [
  { Icon: IconZap,      title: 'Speed to Results',      desc: 'Our streamlined approach gets campaigns live and generating results faster than traditional agency timelines.' },
  { Icon: IconSearch,   title: 'Precision Targeting',   desc: 'Advanced audience segmentation ensures your message reaches the exact people most likely to convert.' },
  { Icon: IconUsers,    title: 'True Partnership',       desc: 'We embed ourselves in your business goals, acting as a dedicated marketing partner rather than a vendor.' },
  { Icon: IconBarChart, title: 'Transparent Reporting', desc: 'Clear, honest reporting with no vanity metrics. You always know exactly what your investment is doing.' },
  { Icon: IconGlobe,    title: 'Full-Stack Marketing',  desc: 'From strategy to execution, creative to analytics — one team handles everything seamlessly.' },
  { Icon: IconAward,    title: 'Proven Track Record',   desc: 'Over 200 businesses scaled. Our portfolio speaks for itself with real, verifiable results.' },
]

const divisionHeads = [
  
  {
    name: 'Himaza Zahara',
    role: 'Head of Digital Solutions',
    division: 'Lead Gen & Digital Solutions',
    email: 'himaza@mawkishcreates.com',
    phone: '+94 77 734 0082',
    desc: 'Driving precision lead pipelines and end-to-end digital solutions for brands that demand measurable growth.',
    photo: '/HZ_1.webp',
    initial: 'H',
  },
  {
    name: 'Bianca Mahadevan',
    role: 'Head of Social Media Management',
    division: 'Social Media',
    email: 'bianca@mawkishcreates.com',
    phone: '+94 77 734 7715',
    desc: 'Building brand presence and community through strategy-led social content, engagement, and storytelling.',
    photo: '/Bianca.webp',
    initial: 'B',
  },
  {
    name: 'Faraz',
    role: 'Head of Event Intelligence Solutions',
    division: 'Events',
    email: 'faraz@mawkishcreates.com',
    phone: '+94 77 734 7795',
    desc: 'Crafting immersive event experiences backed by data-driven intelligence and flawless production.',
    photo: '/Faraz.webp',
    initial: 'F',
  },
]

/* ── Component ─────────────────────────────────────────────── */
export default function About() {
  const missionRef    = useScrollReveal()
  const whyRef        = useScrollReveal()
  const philosophyRef = useScrollReveal()
  const ceoRef        = useScrollReveal()
  const teamRef       = useScrollReveal()

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="about-hero page-hero" aria-label="About page hero">
        <div className="noise-overlay" aria-hidden="true" />
        <div className="container">
          <div className="page-hero-label">Who We Are</div>
          <h1 className="page-hero-title">
            Built Different.<br />
            <em style={{ fontStyle: 'italic', color: 'var(--purple-300)' }}>Driven by Purpose.</em>
          </h1>
          <p className="page-hero-desc">
            Mawkish Creates is not just an agency — it is a growth partner built from a lifetime of
            creative ambition, real-world grit, and the belief that every brand deserves a story worth telling.
          </p>
        </div>
      </section>

      {/* ── CEO / Founder Story ───────────────────────────────── */}
      <section className="ceo-section section" aria-labelledby="ceo-heading" ref={ceoRef}>
        <div className="container">
          <div className="ceo-inner">

            {/* Left — story */}
            <div className="ceo-content">
              <p className="section-label  ">The Founder</p>
              <h2 id="ceo-heading" className="section-title  ">
                From Journalism to <span className="highlight">Creative Vision</span>
              </h2>
              <div className="divider  " />

              <div className="ceo-body">
                <p className=" ">
                  The path to Mawkish Creates was never a straight line. It began in journalism — learning
                  how to find the story in the noise. That led to communications, where the craft of shaping
                  narratives for organisations took shape. Then came tech, where systems thinking and digital
                  infrastructure opened a new world of possibility.
                </p>
                <p className=" ">
                  But it was in the <strong>creative space</strong> that everything finally clicked. The
                  intersection of storytelling, strategy, and technology — that was the footing. And from
                  that vantage point, a pattern became impossible to ignore: agencies were everywhere, but
                  true <strong>growth partners</strong> were nowhere to be found.
                </p>
                <p className=" ">
                  Most agencies sold services. Few sold outcomes. Fewer still embedded themselves deep
                  enough into a client's world to actually drive transformation. That gap — between a
                  vendor and a partner — is exactly the space <strong>Mawkish Creates</strong> was built
                  to occupy.
                </p>
                <p className=" ">
                  Today, Mawkish Creates operates across three divisions — each led by a specialist — unified
                  by a single obsession: <em>growth that compounds</em>.
                </p>
              </div>

              {/* Mawkish Tech callout */}
             {/* <div className="ceo-tech-callout  ">
                <div className="ceo-tech-label">Also Part of the Ecosystem</div>
               <a href="https://mawkishtechnologies.com/" target="_blank" rel="noopener noreferrer" className="ceo-tech-name ceo-tech-link">Mawkish Technologies</a>
                
                <p className="ceo-tech-desc">
                  Our technology arm — building the digital infrastructure, automation systems, and
                  proprietary tools that power the Mawkish Creates ecosystem and beyond.
                </p>
              </div> */}
            </div>

            {/* Right — CEO photo */}
            <div className="ceo-visual  ">
              <div className="ceo-photo-frame">
                <img
                  src="/AB_1.webp"
                  alt="Founder & CEO, Mawkish Creates"
                  className="ceo-photo"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
                <div className="ceo-photo-placeholder" aria-hidden="true">MC</div>
              </div>
              <div className="ceo-name-card">
                <div className="ceo-name">Founder &amp; CEO</div>
                <div className="ceo-title">Mawkish Creates</div>
                <div className="ceo-location">Sri Lanka → Global</div>
              </div>
              <div className="ceo-stat-row">
                <div className="ceo-stat">
                  <div className="ceo-stat-num">2020</div>
                  <div className="ceo-stat-text">Founded</div>
                </div>
                <div className="ceo-stat">
                  <div className="ceo-stat-num">3</div>
                  <div className="ceo-stat-text">Divisions</div>
                </div>
                <div className="ceo-stat">
                  <div className="ceo-stat-num">∞</div>
                  <div className="ceo-stat-text">Global Vision</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Division Heads ────────────────────────────────────── */}
      <section className="team-section section" aria-labelledby="team-heading" ref={teamRef}>
        <div className="container">
          <p className="section-label  ">The Leadership</p>
          <h2 id="team-heading" className="section-title  ">
            Heads of <span className="highlight">Division</span>
          </h2>
          <p className="section-subtitle">
            Three divisions. Three specialists. One unified growth mission.
          </p>
          <div className="team-grid">
            {divisionHeads.map(({ name, role, division, email, phone, desc, photo, initial }) => (
              <div key={name} className="team-card">
                <div className="team-card-photo-wrap">
                  <img
                    src={photo}
                    alt={name}
                    className="team-card-photo"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                  <div className="team-card-initial" aria-hidden="true">{initial}</div>
                  <div className="team-card-division-badge">{division}</div>
                </div>
                <div className="team-card-body">
                  <div className="team-card-name">{name}</div>
                  <div className="team-card-role">{role}</div>
                  <p className="team-card-desc">{desc}</p>
                  <div className="team-card-contacts">
                    <a href={`mailto:${email}`} className="team-contact-link">
                      <IconMail size={14} strokeWidth={1.75} color="var(--purple-400)" />
                      <span>{email}</span>
                    </a>
                    <a href={`tel:${phone.replace(/\s/g,'')}`} className="team-contact-link">
                      <IconPhone size={14} strokeWidth={1.75} color="var(--purple-400)" />
                      <span>{phone}</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission & Vision ──────────────────────────────────── */}
      <section className="mission-section section" aria-labelledby="mission-heading" ref={missionRef}>
        <div className="container">
          <p className="section-label">Our Direction</p>
          <h2 id="mission-heading" className="section-title  ">
            Mission &amp; <span className="highlight">Vision</span>
          </h2>
          <div className="mission-grid">
            {missionCards.map(({ Icon, title, text }) => (
              <div key={title} className="mission-card  ">
                <Icon size={36} strokeWidth={1.4} color="var(--purple-400)" className="mission-card-icon" />
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
              <p className="section-label  ">How We Think</p>
              <h2 id="philosophy-heading" className="section-title  ">
                Our Company <span className="highlight">Philosophy</span>
              </h2>
              <div className="divider  " />
              <div className="philosophy-pillars">
                {pillars.map(({ title, desc }, i) => (
                  <div key={title} className="pillar-item  ">
                    <div className="pillar-number">0{i + 1}</div>
                    <div className="pillar-content">
                      <div className="pillar-title">{title}</div>
                      <div className="pillar-desc">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="philosophy-visual  ">
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
            <p className="section-label  ">Our Advantage</p>
            <h2 id="why-heading" className="section-title  ">
              Why Businesses Choose <span className="highlight">Mawkish Creates</span>
            </h2>
            <p className="section-subtitle  ">
              Beyond campaigns and content, we bring a strategic partnership that compounds over time.
            </p>
          </div>
          <div className="why-grid">
            {whyCards.map(({ Icon, title, desc }) => (
              <div key={title} className="why-card  ">
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