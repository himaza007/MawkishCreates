import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SplitType from 'split-type'
import Lenis from 'lenis'
import { api } from '../../utils/api'
import '../../styles/webdev.css'

gsap.registerPlugin(ScrollTrigger)

/* ─── Lenis smooth scroll ──────────────────────────────────── */
function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) })
    let rafId
    const raf = time => { lenis.raf(time); rafId = requestAnimationFrame(raf) }
    rafId = requestAnimationFrame(raf)
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.lagSmoothing(0)
    return () => { cancelAnimationFrame(rafId); lenis.destroy() }
  }, [])
}

/* ─── Three.js scene ───────────────────────────────────────── */
function WebDevTechScene() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.innerWidth < 768

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#05000f')
    scene.fog = new THREE.FogExp2(0x05000f, 0.02)

    const camera = new THREE.PerspectiveCamera(62, mount.clientWidth / mount.clientHeight, 0.1, 500)
    camera.position.set(0, 4, 46)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

    const root = new THREE.Group()
    const architecture = new THREE.Group()
    const dataStream = new THREE.Group()
    scene.add(root, architecture, dataStream)

    scene.add(new THREE.AmbientLight(0xffffff, 0.72))
    const purpleLight = new THREE.PointLight(0x7b2ff7, 8, 140)
    purpleLight.position.set(16, 16, 26)
    const goldLight = new THREE.PointLight(0xc9a84c, 4, 110)
    goldLight.position.set(-16, -8, 20)
    scene.add(purpleLight, goldLight)

    const particleCount = isMobile ? 1300 : 3600
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const purple = new THREE.Color('#7b2ff7')
    const lavender = new THREE.Color('#d7c6ff')
    const gold = new THREE.Color('#c9a84c')
    const white = new THREE.Color('#ffffff')

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      positions[i3] = (Math.random() - 0.5) * 150
      positions[i3 + 1] = (Math.random() - 0.5) * 84
      positions[i3 + 2] = -Math.random() * 150
      const color = purple.clone().lerp(lavender, Math.random() * 0.55)
      if (Math.random() > 0.9) color.lerp(gold, 0.55)
      if (Math.random() > 0.97) color.lerp(white, 0.85)
      colors[i3] = color.r; colors[i3 + 1] = color.g; colors[i3 + 2] = color.b
    }

    const particleGeo = new THREE.BufferGeometry()
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    const particleMat = new THREE.PointsMaterial({ size: 0.28, sizeAttenuation: true, vertexColors: true, transparent: true, opacity: 0.86, blending: THREE.AdditiveBlending, depthWrite: false })
    const particles = new THREE.Points(particleGeo, particleMat)
    root.add(particles)

    const grid = new THREE.GridHelper(120, 42, 0x7b2ff7, 0x2d0a5e)
    grid.position.y = -15; grid.position.z = -42
    grid.material.transparent = true; grid.material.opacity = 0.32
    architecture.add(grid)

    const frameMat = new THREE.LineBasicMaterial({ color: '#a36ef7', transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending })
    const makeWireBox = (w, h, d, x, y, z) => {
      const box = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)), frameMat.clone())
      box.position.set(x, y, z); architecture.add(box); return box
    }
    const browserFrame = makeWireBox(28, 17, 1.2, 10, 2, -28)
    const serverStack = makeWireBox(8, 19, 8, -20, 0, -30)
    const mobileFrame = makeWireBox(7, 13, 1, 25, -5, -18)
    const moduleBoxes = []
    for (let i = 0; i < 9; i++) {
      const box = makeWireBox(3.8 + Math.random() * 2, 1.2 + Math.random() * 1.4, 0.5, 1 + (i % 3) * 7.4, 7 - Math.floor(i / 3) * 5, -27 + Math.random() * 1.2)
      box.material.opacity = 0.42; moduleBoxes.push(box)
    }

    const netMat = new THREE.LineBasicMaterial({ color: '#c9a84c', transparent: true, opacity: 0.44, blending: THREE.AdditiveBlending })
    const networkLines = []
    const connect = (a, b) => {
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a), new THREE.Vector3(...b)]), netMat.clone())
      networkLines.push(line); dataStream.add(line)
    }
    connect([-20, 6, -30], [0, 8, -27]); connect([-20, 0, -30], [8, 2, -27])
    connect([-20, -6, -30], [22, -2, -18]); connect([10, 2, -28], [25, -5, -18]); connect([10, -7, -28], [25, -9, -18])

    const packetGeo = new THREE.SphereGeometry(0.32, 16, 16)
    const packetMat = new THREE.MeshBasicMaterial({ color: '#c9a84c', transparent: true, opacity: 0.9 })
    const packets = []
    networkLines.forEach((line) => {
      const pos = line.geometry.attributes.position
      const start = new THREE.Vector3(pos.getX(0), pos.getY(0), pos.getZ(0))
      const end = new THREE.Vector3(pos.getX(1), pos.getY(1), pos.getZ(1))
      for (let i = 0; i < 4; i++) {
        const p = new THREE.Mesh(packetGeo, packetMat.clone())
        p.userData = { start, end, t: Math.random(), speed: 0.004 + Math.random() * 0.006 }
        dataStream.add(p); packets.push(p)
      }
    })

    const codeMat = new THREE.MeshBasicMaterial({ color: '#7b2ff7', transparent: true, opacity: 0.16, wireframe: true, blending: THREE.AdditiveBlending })
    const codePlanes = []
    for (let i = 0; i < 16; i++) {
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(4 + Math.random() * 10, 1 + Math.random() * 3, 3, 2), codeMat.clone())
      plane.position.set((Math.random() - 0.5) * 90, (Math.random() - 0.5) * 44, -20 - Math.random() * 110)
      plane.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
      codePlanes.push(plane); root.add(plane)
    }

    const cursor = { x: 0, y: 0 }
    const onPointerMove = e => { cursor.x = (e.clientX / window.innerWidth - 0.5) * 2; cursor.y = (e.clientY / window.innerHeight - 0.5) * 2 }
    const onResize = () => { camera.aspect = mount.clientWidth / mount.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(mount.clientWidth, mount.clientHeight) }
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('resize', onResize)

    const clock = new THREE.Clock()
    let frameId
    const animate = () => {
      const t = clock.getElapsedTime()
      camera.position.x += (cursor.x * 3.5 - camera.position.x) * 0.035
      camera.position.y += (4 - cursor.y * 2.5 - camera.position.y) * 0.035
      camera.lookAt(3, -1, -28)
      particles.rotation.y = t * 0.014; particles.rotation.z = t * 0.006
      grid.position.z = -42 + ((t * 7) % 12)
      architecture.rotation.y = Math.sin(t * 0.25) * 0.08
      dataStream.rotation.y = architecture.rotation.y
      browserFrame.rotation.y = Math.sin(t * 0.55) * 0.06
      serverStack.rotation.y = t * 0.12
      mobileFrame.rotation.y = Math.sin(t * 0.75) * 0.1
      moduleBoxes.forEach((b, i) => { b.material.opacity = 0.28 + Math.sin(t * 1.6 + i) * 0.16 })
      networkLines.forEach((l, i) => { l.material.opacity = 0.24 + Math.sin(t * 2 + i) * 0.16 })
      packets.forEach(p => {
        p.userData.t += p.userData.speed
        if (p.userData.t > 1) p.userData.t = 0
        p.position.lerpVectors(p.userData.start, p.userData.end, p.userData.t)
      })
      codePlanes.forEach((pl, i) => { pl.rotation.z += 0.002 + i * 0.0002; pl.position.y += Math.sin(t + i) * 0.002 })
      renderer.render(scene, camera)
      if (!reducedMotion) frameId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('resize', onResize)
      ;[particleGeo, packetGeo].forEach(g => g.dispose())
      ;[particleMat, frameMat, netMat, packetMat, codeMat].forEach(m => m.dispose())
      ;[root, architecture, dataStream].forEach(g => g.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose() }))
      renderer.dispose(); renderer.domElement.remove()
    }
  }, [])

  return (
    <div className="wd-three-wrap" aria-hidden="true">
      <div ref={mountRef} className="wd-three-canvas" />
      <div className="wd-three-vignette" />
    </div>
  )
}

/* ─── Text reveal ──────────────────────────────────────────── */
function TextReveal({ children, tag: Tag = 'h2', className = '', delay = 0 }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const split = new SplitType(el, { types: 'lines' })
    split.lines.forEach(line => {
      const wrap = document.createElement('div')
      wrap.className = 'line-mask'
      line.parentNode.insertBefore(wrap, line)
      wrap.appendChild(line)
    })
    gsap.set(split.lines, { y: '105%' })
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' } })
    tl.to(split.lines, { y: '0%', duration: 1, ease: 'power4.out', stagger: 0.08, delay })
    return () => { split.revert(); tl.kill() }
  }, [delay])
  return <Tag ref={ref} className={className}>{children}</Tag>
}

/* ─── Hero title ───────────────────────────────────────────── */
function HeroTitle() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const split = new SplitType(el, { types: 'chars,words' })
    gsap.set(split.chars, { y: 80, opacity: 0, rotateX: -45 })
    gsap.to(split.chars, { y: 0, opacity: 1, rotateX: 0, duration: 0.9, ease: 'power4.out', stagger: { each: 0.025, from: 'start' }, delay: 0.3 })
    return () => split.revert()
  }, [])
  return (
    <h1 ref={ref} className="wd-hero-title">
      Web Solutions<br />
      <em className="wd-hero-em">Engineered For You</em>
    </h1>
  )
}

/* ─── FadeUp ───────────────────────────────────────────────── */
function FadeUp({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay }}>
      {children}
    </motion.div>
  )
}

/* ─── Marquee ──────────────────────────────────────────────── */
function Marquee({ items }) {
  const track = [...items, ...items, ...items]
  return (
    <div className="wd-marquee-outer" aria-hidden="true">
      <div className="wd-marquee-track">
        {track.map((item, i) => (
          <span key={i} className="wd-marquee-item">
            <span className="wd-marquee-sep" />{item}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ─── Package terminal card ────────────────────────────────── */
function PackageTerminal({ pkg, index, activeTab }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-5% 0px' })
  const cmd = activeTab === 'business'
    ? `npx mawkish build --plan=${pkg.name.toLowerCase()}`
    : `npx mawkish shop --plan=${pkg.name.toLowerCase()}`

  return (
    <motion.article ref={ref}
      className={'wd-terminal-card' + (pkg.featured ? ' wd-terminal-featured' : '')}
      initial={{ opacity: 0, y: 48, rotateX: 8 }}
      animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}>
      <div className="wd-terminal-topbar">
        <div className="wd-terminal-dots"><span /><span /><span /></div>
        <div className="wd-terminal-path">~/mawkish/{pkg.name.toLowerCase()}</div>
      </div>
      {pkg.featured && <div className="wd-terminal-badge">Recommended</div>}
      <div className="wd-terminal-body">
        <div className="wd-terminal-line"><span className="wd-terminal-prompt">$</span><span>{cmd}</span></div>
        <div className="wd-terminal-line wd-terminal-muted">
          <span className="wd-terminal-prompt">›</span>
          <span>{pkg.category}</span>
          <span className="wd-terminal-timeline">{pkg.timeline}</span>
        </div>
        <h3 className="wd-terminal-title">{pkg.name}</h3>
        <p className="wd-terminal-tagline">{pkg.tagline}</p>
        <div className="wd-terminal-output">
          <span className="wd-output-label">best_for:</span>
          <p>{pkg.bestFor}</p>
        </div>
        <div className="wd-terminal-feature-list">
          {pkg.features.map((f, i) => (
            <div key={i} className="wd-terminal-feature">
              <span className="wd-terminal-check">✓</span><span>{f}</span>
            </div>
          ))}
        </div>
        {pkg.maintenance && <div className="wd-terminal-maintenance">maintenance: {pkg.maintenance} included</div>}
        <a href="#get-started" className="wd-terminal-cta">
          Execute project
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </a>
      </div>
    </motion.article>
  )
}

/* ─── Process accordion ────────────────────────────────────── */
function ProcessAccordion({ steps }) {
  const [active, setActive] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  return (
    <motion.div ref={ref} className="wd-process-accordion"
      initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.5 }}>
      {steps.map((step, i) => (
        <div key={step.title}
          className={'wd-acc-item' + (active === i ? ' wd-acc-active' : '')}
          onClick={() => setActive(i)} role="button" tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setActive(i) }}>
          <div className="wd-acc-header">
            <span className="wd-acc-num">{String(i + 1).padStart(2, '0')}</span>
            <span className="wd-acc-title">{step.title}</span>
            <span className="wd-acc-toggle">{active === i ? '−' : '+'}</span>
          </div>
          <AnimatePresence initial={false}>
            {active === i && (
              <motion.div className="wd-acc-body"
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
                <p className="wd-acc-desc">{step.desc}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </motion.div>
  )
}

/* ─── Addon row ────────────────────────────────────────────── */
function AddonRow({ addon, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-5% 0px' })
  return (
    <motion.div ref={ref} className="wd-addon-row"
      initial={{ opacity: 0, x: -24 }} animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: index * 0.07 }}>
      <div className="wd-addon-index">{String(index + 1).padStart(2, '0')}</div>
      <div className="wd-addon-body">
        <div className="wd-addon-name">{addon.name}</div>
        <div className="wd-addon-desc">{addon.desc}</div>
      </div>
      <a href="#get-started" className="wd-addon-link">Enquire</a>
    </motion.div>
  )
}

/* ─── Scroll statement ─────────────────────────────────────── */
function ScrollStatement() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const tween = gsap.to(el, { xPercent: -35, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1.5 } })
    return () => tween.kill()
  }, [])
  return (
    <div className="wd-scroll-stmt-outer">
      <div ref={ref} className="wd-scroll-stmt-inner">
        <span>Custom&nbsp;Design</span><span className="wd-stmt-sep">—</span>
        <span>Built&nbsp;to&nbsp;Rank</span><span className="wd-stmt-sep">—</span>
        <span>Engineered&nbsp;to&nbsp;Convert</span><span className="wd-stmt-sep">—</span>
        <span>Made&nbsp;to&nbsp;Last</span><span className="wd-stmt-sep">—</span>
        <span>Custom&nbsp;Design</span><span className="wd-stmt-sep">—</span>
        <span>Built&nbsp;to&nbsp;Rank</span>
      </div>
    </div>
  )
}

/* ─── Web Dev Inquiry Form ─────────────────────────────────── */
function WebDevInquiryForm() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '',
    packagePreference: '', industry: '', websiteType: '', timeline: '', description: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [focused, setFocused] = useState(null)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await api.post('/leads', { ...form, service: 'Web Development' })
      setSubmitted(true)
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-5% 0px' })

  return (
    <section className="wd-form-section" id="get-started" aria-labelledby="wd-form-heading">
      <div className="container">

        {/* Header */}
        <div className="wd-form-header">
          <FadeUp><span className="wd-overline">Get Started</span></FadeUp>
          <TextReveal tag="h2" className="wd-section-heading wd-form-title" id="wd-form-heading">
            Start building your<br />digital presence.
          </TextReveal>
          <FadeUp delay={0.15}>
            <p className="wd-section-sub">
              Tell us about your business and where you want to take it online. We'll map out the right package and put together a proposal with clear timelines.
            </p>
          </FadeUp>
        </div>

        {/* Layout */}
        <div className="wd-form-layout">

          {/* Left — promises */}
          <FadeUp className="wd-form-left" delay={0.1}>
            <div className="wd-form-promises">
              {[
                { label: 'Response time', value: 'Within 24 hours', mono: 'response_time: <24h' },
                { label: 'Discovery call', value: 'Free 30-minute strategy session', mono: 'session: free_discovery' },
                { label: 'Proposal', value: 'Custom-built for your brief', mono: 'output: tailored_proposal' },
                { label: 'No obligation', value: 'No pressure, no hidden costs', mono: 'commitment: zero' },
              ].map((p, i) => (
                <motion.div key={i} className="wd-form-promise"
                  initial={{ opacity: 0, x: -20 }} animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 + i * 0.08 }}>
                  <div className="wd-promise-mono">{p.mono}</div>
                  <div className="wd-promise-label">{p.label}</div>
                  <div className="wd-promise-value">{p.value}</div>
                </motion.div>
              ))}
            </div>

            <div className="wd-form-terminal-note" aria-hidden="true">
              <div className="wd-ftn-top">
                <span /><span /><span />
                <p>process.sh</p>
              </div>
              <div className="wd-ftn-body">
                <p><span className="wd-ftn-gold">01</span> Submit your brief below</p>
                <p><span className="wd-ftn-gold">02</span> We review and reach out within 24h</p>
                <p><span className="wd-ftn-gold">03</span> Free discovery call booked</p>
                <p><span className="wd-ftn-green">04</span> Tailored proposal delivered</p>
              </div>
            </div>
          </FadeUp>

          {/* Right — form card */}
          <motion.div ref={ref} className="wd-form-card"
            initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}>

            <div className="wd-form-card-top">
              <div className="wd-form-card-dots"><span /><span /><span /></div>
              <p className="wd-form-card-path">~/mawkish/new-project.sh</p>
            </div>

            {submitted ? (
              <div className="wd-form-success">
                <div className="wd-form-success-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="#82f7c2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="wd-form-success-title">Brief received.</h3>
                <p className="wd-form-success-msg">We'll review your project details and reach out within 24 hours to schedule your discovery call.</p>
                <div className="wd-form-success-mono">
                  <span className="wd-ftn-green">✓</span> inquiry logged — awaiting response
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="wd-form-fields" aria-label="Web development inquiry form">

                {/* Row 1 — name + email */}
                <div className="wd-form-row">
                  <div className="wd-field-group">
                    <label htmlFor="wd-name" className="wd-field-label">
                      <span className="wd-field-mono">name:</span> Full Name *
                    </label>
                    <input id="wd-name" name="name" type="text" required
                      placeholder="Jane Smith"
                      className={'wd-field-input' + (focused === 'name' ? ' wd-field-focused' : '')}
                      value={form.name} onChange={handleChange}
                      onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} />
                  </div>
                  <div className="wd-field-group">
                    <label htmlFor="wd-email" className="wd-field-label">
                      <span className="wd-field-mono">email:</span> Email Address *
                    </label>
                    <input id="wd-email" name="email" type="email" required
                      placeholder="jane@company.com"
                      className={'wd-field-input' + (focused === 'email' ? ' wd-field-focused' : '')}
                      value={form.email} onChange={handleChange}
                      onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} />
                  </div>
                </div>

                {/* Row 2 — phone + company */}
                <div className="wd-form-row">
                  <div className="wd-field-group">
                    <label htmlFor="wd-phone" className="wd-field-label">
                      <span className="wd-field-mono">phone:</span> Phone Number
                    </label>
                    <input id="wd-phone" name="phone" type="tel"
                      placeholder="+1 (555) 000-0000"
                      className={'wd-field-input' + (focused === 'phone' ? ' wd-field-focused' : '')}
                      value={form.phone} onChange={handleChange}
                      onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)} />
                  </div>
                  <div className="wd-field-group">
                    <label htmlFor="wd-company" className="wd-field-label">
                      <span className="wd-field-mono">company:</span> Business Name
                    </label>
                    <input id="wd-company" name="company" type="text"
                      placeholder="Your Company"
                      className={'wd-field-input' + (focused === 'company' ? ' wd-field-focused' : '')}
                      value={form.company} onChange={handleChange}
                      onFocus={() => setFocused('company')} onBlur={() => setFocused(null)} />
                  </div>
                </div>

                {/* Row 3 — package + industry */}
                <div className="wd-form-row">
                  <div className="wd-field-group">
                    <label htmlFor="wd-package" className="wd-field-label">
                      <span className="wd-field-mono">package:</span> Package Preference
                    </label>
                    <select id="wd-package" name="packagePreference"
                      className={'wd-field-input wd-field-select' + (focused === 'packagePreference' ? ' wd-field-focused' : '')}
                      value={form.packagePreference} onChange={handleChange}
                      onFocus={() => setFocused('packagePreference')} onBlur={() => setFocused(null)}>
                      <option value="">-- select package --</option>
                      <optgroup label="Business Websites">
                        <option value="Base">Base — Single page</option>
                        <option value="Build">Build — Multi-page</option>
                        <option value="Scale">Scale — Full system</option>
                      </optgroup>
                      <optgroup label="eCommerce">
                        <option value="Core">Core — Up to 50 products</option>
                        <option value="Plus">Plus — Up to 200 products</option>
                        <option value="Advanced">Advanced — Unlimited</option>
                      </optgroup>
                      <option value="Not sure">Not sure yet</option>
                    </select>
                  </div>
                  <div className="wd-field-group">
                    <label htmlFor="wd-industry" className="wd-field-label">
                      <span className="wd-field-mono">industry:</span> Business Industry *
                    </label>
                    <select id="wd-industry" name="industry" required
                      className={'wd-field-input wd-field-select' + (focused === 'industry' ? ' wd-field-focused' : '')}
                      value={form.industry} onChange={handleChange}
                      onFocus={() => setFocused('industry')} onBlur={() => setFocused(null)}>
                      <option value="">-- select industry --</option>
                      {['E-Commerce','Hospitality','Technology','Real Estate','Healthcare',
                        'Food & Beverage','Education','Finance','Fashion','Retail','Professional Services','Other'].map(i => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 4 — website type + timeline */}
                <div className="wd-form-row">
                  <div className="wd-field-group">
                    <label htmlFor="wd-websitetype" className="wd-field-label">
                      <span className="wd-field-mono">type:</span> Website Type
                    </label>
                    <select id="wd-websitetype" name="websiteType"
                      className={'wd-field-input wd-field-select' + (focused === 'websiteType' ? ' wd-field-focused' : '')}
                      value={form.websiteType} onChange={handleChange}
                      onFocus={() => setFocused('websiteType')} onBlur={() => setFocused(null)}>
                      <option value="">-- select type --</option>
                      <option value="New website">New website from scratch</option>
                      <option value="Redesign">Redesign existing site</option>
                      <option value="eCommerce store">New eCommerce store</option>
                      <option value="eCommerce migration">eCommerce migration / upgrade</option>
                      <option value="Web application">Custom web application</option>
                      <option value="Landing page">Landing page</option>
                      <option value="Not sure">Not sure yet</option>
                    </select>
                  </div>
                  <div className="wd-field-group">
                    <label htmlFor="wd-timeline" className="wd-field-label">
                      <span className="wd-field-mono">deadline:</span> Desired Timeline
                    </label>
                    <select id="wd-timeline" name="timeline"
                      className={'wd-field-input wd-field-select' + (focused === 'timeline' ? ' wd-field-focused' : '')}
                      value={form.timeline} onChange={handleChange}
                      onFocus={() => setFocused('timeline')} onBlur={() => setFocused(null)}>
                      <option value="">-- select timeline --</option>
                      <option value="ASAP">As soon as possible</option>
                      <option value="1 month">Within 1 month</option>
                      <option value="1-3 months">1–3 months</option>
                      <option value="3-6 months">3–6 months</option>
                      <option value="Flexible">Flexible / no rush</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="wd-field-group">
                  <label htmlFor="wd-description" className="wd-field-label">
                    <span className="wd-field-mono">brief:</span> Tell Us About Your Project
                  </label>
                  <textarea id="wd-description" name="description" rows={4}
                    placeholder="What does your business do? What are you hoping to achieve with your website? Any existing site or references we should know about?"
                    className={'wd-field-input wd-field-textarea' + (focused === 'description' ? ' wd-field-focused' : '')}
                    value={form.description} onChange={handleChange}
                    onFocus={() => setFocused('description')} onBlur={() => setFocused(null)} />
                </div>

                {error && <p className="wd-form-error" role="alert">{error}</p>}

                <button type="submit" className="wd-form-submit" disabled={submitting}>
                  {submitting
                    ? <><span className="wd-submit-spinner" />Sending brief...</>
                    : <>Execute — Submit Brief <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></>
                  }
                </button>

                <p className="wd-form-disclaimer">
                  By submitting you agree to our Privacy Policy. We'll never share your information.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ─── Data ─────────────────────────────────────────────────── */
const marqueeItems = [
  'React Architecture', 'Custom UI/UX', 'SEO Optimisation', 'Mobile-First',
  'eCommerce', 'Performance Builds', 'Free Hosting', 'Analytics Setup',
  'Lead Capture', 'Copywriting', 'Multi-Language', 'Secure Deployment',
]

const businessPackages = [
  { category: 'Business Website', name: 'Base', tagline: 'A focused, well-structured entry point for businesses establishing their presence online.', bestFor: 'Small businesses and startups with no existing website', features: ['1-page website with 6 sections','Modern UI design','Essential SEO setup','Contact form and social links','Mobile-optimised and fast','Free .COM domain and 1yr hosting'], timeline: '1–2 weeks', maintenance: '3 months', featured: false },
  { category: 'Business Website', name: 'Build', tagline: 'A multi-page platform designed to support visibility, engagement, and conversion.', bestFor: 'Growing businesses outgrowing a basic or underperforming site', features: ['Up to 5 custom-designed pages','Custom UI/UX design','Full SEO optimisation','Live chat integration','Speed and SEO audit','Analytics and lead capture','Free .COM domain and 1yr hosting'], timeline: '2–3 weeks', maintenance: '6 months', featured: true },
  { category: 'Business Website', name: 'Scale', tagline: 'A complete digital system built to support scale, visibility, and long-term positioning.', bestFor: 'Established businesses ready for a full digital transformation', features: ['Advanced multi-page website','Custom UI/UX with user testing','Advanced SEO and keyword research','Blog and multi-language support','Advanced analytics dashboard','Professional copywriting (10 pages)','Free .COM domain and 1yr hosting'], timeline: '4–6 weeks', maintenance: '12 months', featured: false },
]

const ecommercePackages = [
  { category: 'eCommerce', name: 'Core', tagline: 'A streamlined store setup to begin selling online with clarity and structure.', bestFor: 'Boutiques and small retailers moving online for the first time', features: ['Up to 50 products','Custom UI and clean layout','Basic SEO setup','Cart, coupons and upselling','Featured and sale products','5GB hosting, 2 email accounts'], timeline: '2–3 weeks', maintenance: null, featured: false },
  { category: 'eCommerce', name: 'Plus', tagline: 'A flexible commerce platform designed to support growth in both catalogue and revenue.', bestFor: 'Online stores scaling beyond the basics', features: ['Up to 200 products','Custom UI and enhanced layout','Enhanced SEO and analytics','Sale timers and product filtering','Advanced cross-selling and discounts','10GB hosting, 5 email accounts'], timeline: '3–4 weeks', maintenance: null, featured: true },
  { category: 'eCommerce', name: 'Advanced', tagline: 'A fully developed system for high-volume operations and complex requirements.', bestFor: 'Scaling businesses ready to dominate their market online', features: ['Unlimited products','Custom UI and advanced design','Professional SEO, multiplatform','Live chat and smart recommendations','Customer accounts and invoices','20GB hosting, 10 email accounts'], timeline: '4–6 weeks', maintenance: null, featured: false },
]

const addons = [
  { name: 'Extra Page', desc: 'Additional content page for Build or Scale packages' },
  { name: 'Extra Section', desc: 'Additional section added to your Base single-page website' },
  { name: 'Mobile and UX/UI Optimisation', desc: 'Intuitive navigation, conversion-driven layouts, seamless mobile UX' },
  { name: 'Speed and Performance Audit', desc: 'Faster load times, SEO best practices, and security enhancements' },
  { name: 'Custom Web Application', desc: 'Fully bespoke web app — modern, mobile-first, performance-built' },
  { name: 'Monthly SEO Retainer', desc: 'Ongoing keyword tracking, content updates, and backlink building' },
]

const processSteps = [
  { title: 'Discovery Call', desc: 'A free 30-minute session where we learn about your business, your goals, and the audience you are trying to reach.' },
  { title: 'Design and Strategy', desc: 'We craft custom wireframes and a visual direction built entirely around your brand — nothing templated.' },
  { title: 'Build and Develop', desc: 'Development begins with performance and SEO baked in from the ground up, not bolted on at the end.' },
  { title: 'Review and Refine', desc: 'You review every detail. We refine until it is exactly right. Multiple rounds of feedback, no extra charges.' },
  { title: 'Launch and Support', desc: 'We go live together. Assets handed over, hosting configured, and your team supported through the transition.' },
]

const includedItems = [
  ['Free .COM Domain', 'Yours from day one'],
  ['Hosting Setup', 'Configured for launch'],
  ['Mobile Responsive', 'Built for every screen'],
  ['SEO Basics', 'Search-ready foundation'],
  ['Analytics', 'Measure what matters'],
  ['Support', 'Guidance after launch'],
]

/* ─── Main page ────────────────────────────────────────────── */
export default function WebDevelopmentWwU() {
  const [activeTab, setActiveTab] = useState('business')
  useLenis()

  const packages = activeTab === 'business' ? businessPackages : ecommercePackages
  const heroSubRef = useRef(null)
  const heroCtaRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(heroSubRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 1.1 })
    gsap.fromTo(heroCtaRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 1.35 })
  }, [])

  return (
    <main className="wd-page">

      {/* Hero */}
      <section className="wd-hero">
        <WebDevTechScene />
        <div className="wd-hero-noise" />
        <div className="wd-hero-glow" />
        <div className="wd-hero-inner container">
          <motion.div className="wd-hero-eyebrow"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}>
            <span className="wd-eyebrow-line" />Web Development
          </motion.div>
          <HeroTitle />
          <p ref={heroSubRef} className="wd-hero-sub" style={{ opacity: 0 }}>
            Designed to reflect your brand, structured to perform, and engineered like a scalable digital product.
          </p>
          <div ref={heroCtaRef} className="wd-hero-actions" style={{ opacity: 0 }}>
            <a href="#packages" className="wd-btn-primary">View Packages <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></a>
            <a href="#get-started" className="wd-btn-ghost">Start a Project</a>
          </div>
          <div className="wd-hero-terminal" aria-hidden="true">
            <div className="wd-mini-terminal-top"><span /><span /><span /><p>mawkish-build.sh</p></div>
            <div className="wd-mini-terminal-body">
              <p><span>$</span> npm create mawkish@latest</p>
              <p><span>›</span> resolving brand architecture...</p>
              <p><span>›</span> compiling custom interface...</p>
              <p><span>✓</span> website system ready for launch</p>
            </div>
          </div>
        </div>
        <div className="wd-hero-scroll-hint">
          <motion.div className="wd-scroll-line" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 1.2, ease: 'easeInOut', delay: 1.8 }} />
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2, duration: 0.6 }}>Scroll</motion.span>
        </div>
      </section>

      {/* Marquee */}
      <div className="wd-marquee-section"><Marquee items={marqueeItems} /></div>

      {/* Statement */}
      <section className="wd-stmt-section">
        <div className="container">
          <FadeUp><span className="wd-overline">What we do</span></FadeUp>
          <TextReveal tag="h2" className="wd-stmt-heading">
            We build websites like digital infrastructure: designed for your brand, coded for performance, and structured to convert.
          </TextReveal>
        </div>
      </section>

      <ScrollStatement />

      {/* Pillars */}
      <section className="wd-pillars-section">
        <div className="container">
          <div className="wd-pillars-header">
            <FadeUp><span className="wd-overline">Our Approach</span></FadeUp>
            <TextReveal tag="h2" className="wd-pillar-heading">Design system.<br />Code system.<br />Growth system.</TextReveal>
          </div>
          <div className="wd-pillars-grid">
            {[
              { num: '01', title: 'Built From Scratch', desc: 'Nothing templated. Every element is considered, designed, and developed specifically for your brand.' },
              { num: '02', title: 'Performance-Led', desc: 'Fast, responsive, and technically sound, because experience begins before design.' },
              { num: '03', title: 'SEO From Day One', desc: 'Not bolted on after. We architect your site structure, content, and metadata to rank before it even launches.' },
              { num: '04', title: 'We Stay With You', desc: 'Ongoing support, hosting, and maintenance. Built for continuity, not handover.' },
            ].map((p, i) => (
              <FadeUp key={p.title} delay={i * 0.08} className="wd-pillar-card">
                <span className="wd-pillar-num">{p.num}</span>
                <div className="wd-pillar-rule" />
                <h3 className="wd-pillar-title">{p.title}</h3>
                <p className="wd-pillar-desc">{p.desc}</p>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="wd-packages-section" id="packages">
        <div className="container">
          <div className="wd-packages-header">
            <FadeUp><span className="wd-overline">Packages</span></FadeUp>
            <TextReveal tag="h2" className="wd-section-heading">Deploy your website stack</TextReveal>
            <FadeUp delay={0.2}><p className="wd-section-sub">Choose the build path that matches your stage. Each package includes domain setup, hosting, and support.</p></FadeUp>
            <FadeUp delay={0.3}>
              <div className="wd-tabs" role="tablist">
                <button type="button" role="tab" className={'wd-tab' + (activeTab === 'business' ? ' wd-tab-active' : '')} onClick={() => setActiveTab('business')}>$ business</button>
                <button type="button" role="tab" className={'wd-tab' + (activeTab === 'ecommerce' ? ' wd-tab-active' : '')} onClick={() => setActiveTab('ecommerce')}>$ ecommerce</button>
              </div>
            </FadeUp>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} className="wd-terminal-grid"
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: 'easeInOut' }}>
              {packages.map((pkg, i) => <PackageTerminal key={pkg.name} pkg={pkg} index={i} activeTab={activeTab} />)}
            </motion.div>
          </AnimatePresence>
          {activeTab === 'ecommerce' && <FadeUp><p className="wd-footnote">All eCommerce packages include product upload assistance, payment gateway setup, and monthly billing options.</p></FadeUp>}
        </div>
      </section>

      {/* Add-ons */}
      <section className="wd-addons-section">
        <div className="container">
          <div className="wd-addons-header">
            <FadeUp><span className="wd-overline">Add-Ons</span></FadeUp>
            <TextReveal tag="h2" className="wd-section-heading wd-light-heading">Extend the system.</TextReveal>
            <FadeUp delay={0.15}><p className="wd-section-sub wd-sub-light">Additional modules tailored to specific requirements, available at any stage.</p></FadeUp>
          </div>
          <div className="wd-addons-list">
            {addons.map((a, i) => <AddonRow key={a.name} addon={a} index={i} />)}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="wd-process-section">
        <div className="container">
          <div className="wd-process-layout">
            <div className="wd-process-left">
              <FadeUp><span className="wd-overline">Process</span></FadeUp>
              <TextReveal tag="h2" className="wd-section-heading">A structured sprint from concept to launch.</TextReveal>
              <FadeUp delay={0.2}><p className="wd-body-text">Clear communication, defined stages, and consistent visibility throughout.</p></FadeUp>
            </div>
            <div className="wd-process-right"><ProcessAccordion steps={processSteps} /></div>
          </div>
        </div>
      </section>

      {/* Included */}
      <section className="wd-included-section">
        <div className="container">
          <FadeUp><p className="wd-included-label">Every package includes</p></FadeUp>
          <div className="wd-included-grid">
            {includedItems.map(([title, sub]) => (
              <FadeUp key={title} className="wd-included-item">
                <div className="wd-included-dot" />
                <div className="wd-included-title">{title}</div>
                <div className="wd-included-sub">{sub}</div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="wd-cta-band">
        <div className="container">
          <div className="wd-cta-band-inner">
            <TextReveal tag="h2" className="wd-cta-band-heading">Ready to engineer your next digital presence?</TextReveal>
            <FadeUp delay={0.15}>
              <a href="#get-started" className="wd-btn-primary wd-btn-large">
                Start a Project
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Custom form */}
      <WebDevInquiryForm />

    </main>
  )
}