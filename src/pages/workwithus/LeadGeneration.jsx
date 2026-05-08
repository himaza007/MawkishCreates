import { useState } from 'react'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { IconTarget, IconClock, IconUsers, IconTrendingUp } from '../../components/Icons'
import { api } from '../../utils/api'
import '../../styles/lead-generation-growth.css'

const plans = [
  {
    name: 'Launch',
    desc: 'For businesses just starting their lead generation journey.',
    features: [
      '1 platform campaign',
      'Up to 50 leads/mo',
      'Basic lead qualification',
      'Monthly report',
      'Email support',
    ],
  },
  {
    name: 'Accelerate',
    desc: 'For growing businesses ready to fill their pipeline consistently.',
    features: [
      '2 platform campaigns',
      'Up to 150 leads/mo',
      'Full lead qualification',
      'CRM integration',
      'Weekly reports',
      'Priority support',
    ],
    featured: true,
  },
  {
    name: 'Dominate',
    desc: 'High-volume lead generation for serious growth.',
    features: [
      'All platforms',
      'Unlimited leads',
      'Advanced qualification',
      'Nurture sequences',
      'Daily reports',
      'Dedicated manager',
      'A/B testing',
    ],
  },
]

const growthSteps = [
  {
    title: 'Attract',
    text: 'Pull the right audience into your funnel with focused targeting and messaging.',
  },
  {
    title: 'Qualify',
    text: 'Separate real opportunities from empty traffic through clear qualification logic.',
  },
  {
    title: 'Convert',
    text: 'Move high-intent prospects into conversations that can become revenue.',
  },
]

const promises = [
  {
    Icon: IconClock,
    title: 'Response within 24 hours',
    desc: 'Our team will be in touch quickly to schedule your discovery call.',
  },
  {
    Icon: IconUsers,
    title: 'Dedicated strategy session',
    desc: 'A free 30-minute call to understand your business and lead goals.',
  },
  {
    Icon: IconTrendingUp,
    title: 'Custom growth proposal',
    desc: 'We will build a tailored lead system specific to your industry and budget.',
  },
]

function LeadGrowthScene() {
  const mountRef = useRef(null)
  const sectionRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    const section = sectionRef.current
    if (!mount || !section) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.innerWidth < 768

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#05000f')
    scene.fog = new THREE.FogExp2(0x05000f, 0.018)

    const camera = new THREE.PerspectiveCamera(
      62,
      mount.clientWidth / mount.clientHeight,
      0.1,
      500
    )
    camera.position.set(0, 4, 54)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    })

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

    const root = new THREE.Group()
    const funnel = new THREE.Group()
    const growthTree = new THREE.Group()
    scene.add(root, funnel, growthTree)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
    const pointLight = new THREE.PointLight(0xa36ef7, 5, 120)
    pointLight.position.set(0, 18, 24)
    const goldLight = new THREE.PointLight(0xc9a84c, 4, 100)
    goldLight.position.set(18, -12, 18)
    scene.add(ambientLight, pointLight, goldLight)

    const makeGlowTexture = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 512
      canvas.height = 512
      const ctx = canvas.getContext('2d')
      const gradient = ctx.createRadialGradient(256, 256, 10, 256, 256, 256)
      gradient.addColorStop(0, 'rgba(255,255,255,1)')
      gradient.addColorStop(0.2, 'rgba(201,168,76,0.55)')
      gradient.addColorStop(0.5, 'rgba(123,47,247,0.25)')
      gradient.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 512, 512)
      return new THREE.CanvasTexture(canvas)
    }

    const glowTexture = makeGlowTexture()

    const starsCount = isMobile ? 1400 : 3200
    const starPositions = new Float32Array(starsCount * 3)
    const starColors = new Float32Array(starsCount * 3)
    const purple = new THREE.Color('#a36ef7')
    const gold = new THREE.Color('#c9a84c')
    const white = new THREE.Color('#ffffff')

    for (let i = 0; i < starsCount; i++) {
      const i3 = i * 3
      starPositions[i3] = (Math.random() - 0.5) * 180
      starPositions[i3 + 1] = (Math.random() - 0.5) * 105
      starPositions[i3 + 2] = -Math.random() * 190
      const color = purple.clone().lerp(white, Math.random() * 0.55)
      if (Math.random() > 0.86) color.lerp(gold, 0.58)
      starColors[i3] = color.r
      starColors[i3 + 1] = color.g
      starColors[i3 + 2] = color.b
    }

    const starGeometry = new THREE.BufferGeometry()
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3))
    const starMaterial = new THREE.PointsMaterial({
      size: 0.28, sizeAttenuation: true, vertexColors: true,
      transparent: true, opacity: 0.82,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })
    const stars = new THREE.Points(starGeometry, starMaterial)
    root.add(stars)

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: '#a36ef7', transparent: true, opacity: 0.34,
      side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    })
    const goldRingMaterial = new THREE.MeshBasicMaterial({
      color: '#c9a84c', transparent: true, opacity: 0.42,
      side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    })

    const rings = []
    const ringSpecs = [
      { y: 16, z: -8,  outer: 24,   inner: 23.65, material: goldRingMaterial },
      { y: 8,  z: -24, outer: 18,   inner: 17.7,  material: ringMaterial },
      { y: 0,  z: -40, outer: 12.5, inner: 12.25, material: ringMaterial },
      { y: -9, z: -57, outer: 6.7,  inner: 6.52,  material: goldRingMaterial },
    ]

    ringSpecs.forEach((spec, index) => {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(spec.inner, spec.outer, 128),
        spec.material.clone()
      )
      ring.position.set(0, spec.y, spec.z)
      ring.rotation.x = Math.PI / 2
      ring.rotation.z = index * 0.2
      ring.userData.baseY = spec.y
      rings.push(ring)
      funnel.add(ring)
    })

    const lineMaterial = new THREE.LineBasicMaterial({
      color: '#7b2ff7', transparent: true, opacity: 0.5,
      blending: THREE.AdditiveBlending,
    })

    const guideLines = []
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2
      const points = [
        new THREE.Vector3(Math.cos(angle) * 24, 16, -8),
        new THREE.Vector3(Math.cos(angle) * 18, 8, -24),
        new THREE.Vector3(Math.cos(angle) * 12.5, 0, -40),
        new THREE.Vector3(Math.cos(angle) * 6.7, -9, -57),
        new THREE.Vector3(0, -16, -72),
      ]
      const curve = new THREE.CatmullRomCurve3(points)
      const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(42))
      const line = new THREE.Line(geometry, lineMaterial.clone())
      line.material.opacity = i % 4 === 0 ? 0.72 : 0.32
      guideLines.push(line)
      funnel.add(line)
    }

    const leadCount = isMobile ? 280 : 760
    const leadPositions = new Float32Array(leadCount * 3)
    const leadData = []

    for (let i = 0; i < leadCount; i++) {
      const t = Math.random()
      const angle = Math.random() * Math.PI * 2
      const radius = 24 * (1 - t) + 1.5
      const i3 = i * 3
      leadPositions[i3] = Math.cos(angle) * radius
      leadPositions[i3 + 1] = 16 - t * 32
      leadPositions[i3 + 2] = -8 - t * 64
      leadData.push({ t, angle, speed: 0.045 + Math.random() * 0.09, offset: Math.random() * Math.PI * 2 })
    }

    const leadGeometry = new THREE.BufferGeometry()
    leadGeometry.setAttribute('position', new THREE.BufferAttribute(leadPositions, 3))
    const leadMaterial = new THREE.PointsMaterial({
      color: '#c9a84c', size: 0.55, sizeAttenuation: true,
      transparent: true, opacity: 0.95,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })
    const leads = new THREE.Points(leadGeometry, leadMaterial)
    funnel.add(leads)

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(2.8, 48, 48),
      new THREE.MeshStandardMaterial({
        color: '#ffffff', emissive: '#c9a84c',
        emissiveIntensity: 0.6, roughness: 0.42, metalness: 0.12,
      })
    )
    core.position.set(0, -16, -72)
    growthTree.add(core)

    const coreGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture, color: '#c9a84c', transparent: true,
        opacity: 0.72, blending: THREE.AdditiveBlending, depthWrite: false,
      })
    )
    coreGlow.position.copy(core.position)
    coreGlow.scale.set(28, 28, 1)
    growthTree.add(coreGlow)

    const branches = []
    const branchMaterialA = new THREE.LineBasicMaterial({
      color: '#c9a84c', transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending,
    })
    const branchMaterialB = new THREE.LineBasicMaterial({
      color: '#a36ef7', transparent: true, opacity: 0.42, blending: THREE.AdditiveBlending,
    })
    const branchCount = isMobile ? 34 : 76

    for (let i = 0; i < branchCount; i++) {
      const angle = (i / branchCount) * Math.PI * 2
      const height = -9 + Math.random() * 34
      const length = 8 + Math.random() * 28
      const zPush = -82 - Math.random() * 38
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -16, -72),
        new THREE.Vector3(Math.cos(angle) * length * 0.22, -10 + Math.random() * 8, -80),
        new THREE.Vector3(Math.cos(angle) * length * 0.62, height * 0.45, zPush + 8),
        new THREE.Vector3(Math.cos(angle) * length, height, zPush),
      ])
      const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(36))
      const material = (i % 3 === 0 ? branchMaterialA : branchMaterialB).clone()
      material.opacity = i % 3 === 0 ? 0.5 : 0.34
      const branch = new THREE.Line(geometry, material)
      branch.userData.baseOpacity = material.opacity
      branch.userData.phase = Math.random() * Math.PI * 2
      branches.push(branch)
      growthTree.add(branch)

      if (i % 5 === 0) {
        const node = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: glowTexture, color: i % 2 === 0 ? '#c9a84c' : '#a36ef7',
            transparent: true, opacity: 0.45,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })
        )
        node.position.set(Math.cos(angle) * length, height, zPush)
        node.scale.set(5, 5, 1)
        growthTree.add(node)
      }
    }

    const bars = []
    for (let i = 0; i < 9; i++) {
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 4 + i * 2.2, 0.5),
        new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? '#a36ef7' : '#c9a84c',
          transparent: true, opacity: 0.24, blending: THREE.AdditiveBlending,
        })
      )
      bar.position.set(-18 + i * 4.5, -18 + (4 + i * 2.2) / 2, -112)
      bar.userData.baseScaleY = 1
      bars.push(bar)
      growthTree.add(bar)
    }

    const cursor = { x: 0, y: 0 }
    const onPointerMove = e => {
      cursor.x = (e.clientX / window.innerWidth - 0.5) * 2
      cursor.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('resize', onResize)

    const clock = new THREE.Clock()
    let frameId

    const getProgress = () => {
      const rect = section.getBoundingClientRect()
      const total = section.offsetHeight - window.innerHeight
      if (total <= 0) return 0
      return Math.max(0, Math.min(1, -rect.top / total))
    }

    const animate = () => {
      const elapsed = clock.getElapsedTime()
      const progress = getProgress()
      const eased = progress * progress * (3 - 2 * progress)

      camera.position.z += ((54 - eased * 78) - camera.position.z) * 0.055
      camera.position.x += ((cursor.x * 3.2 + Math.sin(eased * Math.PI * 2) * 6) - camera.position.x) * 0.045
      camera.position.y += ((4 - cursor.y * 2.4 + Math.cos(eased * Math.PI) * 3) - camera.position.y) * 0.045
      camera.lookAt(0, -5, -70)

      stars.rotation.y = elapsed * 0.01
      stars.rotation.z = elapsed * 0.006
      funnel.rotation.y = Math.sin(elapsed * 0.25) * 0.08 + eased * 0.28
      growthTree.rotation.y = -Math.sin(elapsed * 0.2) * 0.08 - eased * 0.18

      rings.forEach((ring, index) => {
        ring.rotation.z += 0.004 + index * 0.002
        ring.position.y = ring.userData.baseY + Math.sin(elapsed * 1.2 + index) * 0.45
        ring.material.opacity = 0.24 + Math.sin(elapsed * 1.8 + index) * 0.06 + eased * 0.12
      })
      guideLines.forEach((line, index) => {
        line.material.opacity = (index % 4 === 0 ? 0.55 : 0.26) + Math.sin(elapsed * 1.5 + index) * 0.08
      })

      const positions = leadGeometry.attributes.position.array
      for (let i = 0; i < leadCount; i++) {
        const i3 = i * 3
        const data = leadData[i]
        data.t += data.speed * 0.012
        if (data.t > 1) data.t = 0
        const t = data.t
        const radius = 24 * (1 - t) + 1.5
        const angle = data.angle + elapsed * (0.7 + data.speed * 2.2) + data.offset
        positions[i3] = Math.cos(angle) * radius
        positions[i3 + 1] = 16 - t * 32
        positions[i3 + 2] = -8 - t * 64 + Math.sin(angle * 2) * 1.4
      }
      leadGeometry.attributes.position.needsUpdate = true

      core.rotation.y += 0.012
      core.scale.setScalar(1 + Math.sin(elapsed * 2.6) * 0.06 + eased * 0.18)
      coreGlow.scale.setScalar(28 + Math.sin(elapsed * 1.8) * 3 + eased * 12)

      branches.forEach(branch => {
        branch.material.opacity = branch.userData.baseOpacity + Math.sin(elapsed * 2 + branch.userData.phase) * 0.09 + eased * 0.2
      })
      bars.forEach((bar, index) => {
        const pulse = 1 + Math.sin(elapsed * 1.6 + index) * 0.08 + eased * 0.45
        bar.scale.y += (pulse - bar.scale.y) * 0.06
        bar.material.opacity = 0.18 + eased * 0.22
      })

      renderer.render(scene, camera)
      if (!reducedMotion) frameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('resize', onResize)
      starGeometry.dispose(); starMaterial.dispose()
      leadGeometry.dispose(); leadMaterial.dispose()
      ringMaterial.dispose(); goldRingMaterial.dispose()
      lineMaterial.dispose()
      core.geometry.dispose(); core.material.dispose()
      coreGlow.material.dispose(); glowTexture.dispose()
      branchMaterialA.dispose(); branchMaterialB.dispose()
      rings.forEach(r => { r.geometry.dispose(); r.material.dispose() })
      guideLines.forEach(l => { l.geometry.dispose(); l.material.dispose() })
      branches.forEach(b => { b.geometry.dispose(); b.material.dispose() })
      bars.forEach(b => { b.geometry.dispose(); b.material.dispose() })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return (
    <div className="lead-growth-visual" ref={sectionRef} aria-hidden="true">
      <div className="lead-growth-visual-sticky">
        <div className="lead-growth-visual-canvas" ref={mountRef} />
        <div className="lead-growth-visual-overlay" />
      </div>
    </div>
  )
}

/* ── Inline Inquiry Form ───────────────────────────────────── */
function LeadInquiryForm() {
  const [form, setForm] = useState({
    name: '', company: '', email: '', phone: '',
    industry: '', budget: '', description: '',
  })
  const [submitted,  setSubmitted]  = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)
    try {
      await api.post('/leads', { ...form, service: 'Lead Generation' })
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="leadgen-form-section" id="lead-inquiry" aria-labelledby="leadgen-form-heading">
      <div className="container">
        <div className="leadgen-form-inner">

          {/* Left info column */}
          <div className="leadgen-form-info">
            <p className="section-label" style={{ color: 'rgba(201,168,76,0.9)' }}>Get Started</p>
            <h2 id="leadgen-form-heading" className="section-title" style={{ color: 'var(--white)' }}>
              Start Generating{' '}
              <span className="leadgen-highlight">Qualified Leads</span>
            </h2>
            <p className="leadgen-form-subtext">
              Tell us about your business and we'll build a custom lead generation
              system designed to fill your pipeline with prospects ready to buy.
            </p>

            <div className="leadgen-form-promises">
              {promises.map(({ Icon, title, desc }) => (
                <div key={title} className="leadgen-form-promise">
                  <div className="leadgen-promise-icon">
                    <Icon size={20} strokeWidth={1.5} />
                  </div>
                  <div className="leadgen-promise-text">
                    <strong>{title}</strong>
                    <span>{desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right form card */}
          <div className="leadgen-form-card">
            {submitted ? (
              <div className="leadgen-form-success">
                <div className="leadgen-form-success-icon">✓</div>
                <h3>Inquiry Received!</h3>
                <p>
                  Thank you for reaching out. We'll be in touch within 24 hours
                  to schedule your discovery call.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate aria-label="Lead generation inquiry form">
                <div className="leadgen-form-fields">
                  <div className="leadgen-form-row">
                    <div className="leadgen-form-group">
                      <label htmlFor="lg-name">Full Name *</label>
                      <input id="lg-name" name="name" type="text" required
                        placeholder="Jane Smith" value={form.name} onChange={handleChange} />
                    </div>
                    <div className="leadgen-form-group">
                      <label htmlFor="lg-company">Company Name *</label>
                      <input id="lg-company" name="company" type="text" required
                        placeholder="Your Company" value={form.company} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="leadgen-form-row">
                    <div className="leadgen-form-group">
                      <label htmlFor="lg-email">Email Address *</label>
                      <input id="lg-email" name="email" type="email" required
                        placeholder="jane@company.com" value={form.email} onChange={handleChange} />
                    </div>
                    <div className="leadgen-form-group">
                      <label htmlFor="lg-phone">Phone Number</label>
                      <input id="lg-phone" name="phone" type="tel"
                        placeholder="+1 (555) 000-0000" value={form.phone} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="leadgen-form-row">
                    <div className="leadgen-form-group">
                      <label htmlFor="lg-industry">Business Industry *</label>
                      <select id="lg-industry" name="industry" required
                        value={form.industry} onChange={handleChange}>
                        <option value="">Select industry</option>
                        {['E-Commerce','Hospitality','Technology','Real Estate','Healthcare',
                          'Food & Beverage','Education','Finance','Retail','Other'].map(i => (
                          <option key={i} value={i}>{i}</option>
                        ))}
                      </select>
                    </div>
                    <div className="leadgen-form-group">
                      <label htmlFor="lg-budget">Monthly Budget</label>
                      <select id="lg-budget" name="budget"
                        value={form.budget} onChange={handleChange}>
                        <option value="">Select budget</option>
                        {['Under $1,000/mo','$1,000–$3,000/mo','$3,000–$5,000/mo',
                          '$5,000–$10,000/mo','$10,000+/mo'].map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="leadgen-form-group">
                    <label htmlFor="lg-description">Tell Us About Your Goals</label>
                    <textarea id="lg-description" name="description" rows={4}
                      placeholder="What are you hoping to achieve? Any context about your business or current lead generation challenges..."
                      value={form.description} onChange={handleChange} />
                  </div>

                  {submitError && (
                    <p className="leadgen-form-error" role="alert">{submitError}</p>
                  )}

                  <button type="submit" className="leadgen-form-submit" disabled={submitting}>
                    {submitting ? 'Sending…' : 'Submit Inquiry — Let\'s Talk →'}
                  </button>

                  <p className="leadgen-form-disclaimer">
                    By submitting, you agree to our Privacy Policy. We'll never share your information.
                  </p>
                </div>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}

export default function LeadGenerationWwU() {
  return (
    <main className="leadgen-page">
      <LeadGrowthScene />

      <div className="leadgen-content">
        {/* Hero */}
        <section className="page-hero leadgen-hero" aria-label="Lead Generation hero">
          <div className="container">
            <div className="leadgen-hero-grid">
              <div className="leadgen-hero-copy">
                <div className="page-hero-label">Work With Us</div>
                <h1 className="page-hero-title">
                  Lead Generation<br />
                  <em>That Actually Converts</em>
                </h1>
                <p className="page-hero-desc">
                  Precision-engineered systems that attract and deliver high-quality leads
                  directly into your pipeline — consistently, month after month.
                </p>
                <div className="leadgen-hero-actions">
                  <a href="#lead-plans" className="btn btn-primary">View Plans →</a>
                  <a href="#lead-inquiry" className="btn btn-secondary">Start Inquiry →</a>
                </div>
              </div>

              <div className="leadgen-hero-funnel">
                <img
                  src="/leadgen-funnel.png"
                  alt="Lead generation funnel visualization"
                  className="leadgen-funnel-img"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Growth steps */}
        <section className="leadgen-growth-section" aria-label="Lead generation growth process">
          <div className="container">
            <div className="leadgen-growth-grid">
              {growthSteps.map((step, index) => (
                <div className="leadgen-growth-card" key={step.title}>
                  <div className="leadgen-growth-index">0{index + 1}</div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Plans */}
        <section className="leadgen-plans-section" id="lead-plans">
          <div className="container">
            <div className="plans-header leadgen-plans-header">
              <p className="section-label">Pricing</p>
              <h2 className="section-title">
                Lead Generation <span className="highlight">Plans</span>
              </h2>
              <p className="section-subtitle">
                Transparent pricing. No hidden fees. Cancel anytime.
              </p>
            </div>

            <div className="leadgen-plans-grid">
              {plans.map(plan => (
                <article
                  key={plan.name}
                  className={`leadgen-plan-card${plan.featured ? ' leadgen-plan-featured' : ''}`}
                >
                  {plan.featured && <div className="leadgen-plan-badge">Most Popular</div>}
                  <div className="leadgen-plan-name">{plan.name}</div>
                  <p className="leadgen-plan-desc">{plan.desc}</p>
                  <div className="leadgen-plan-divider" />
                  <div className="leadgen-plan-features">
                    {plan.features.map(feature => (
                      <div key={feature} className="leadgen-plan-feature">
                        <span className="leadgen-plan-check">✓</span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Inquiry form */}
        <div className="leadgen-shared-section">
          <LeadInquiryForm />
        </div>
      </div>
    </main>
  )
}