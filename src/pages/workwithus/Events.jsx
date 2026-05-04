import { useState, useRef, useEffect, useCallback } from 'react'
import { api } from '../../utils/api'
import { useScrollReveal } from '../../hooks/useAnimations'
import '../../styles/events-page.css'

/* ─── DATA ──────────────────────────────────────────────────── */
const stages = [
  { num: '01', title: 'Discovery',         desc: 'Deep-dive session with the client. We learn objectives, audience, competitive context.' },
  { num: '02', title: 'Research',          desc: 'Original industry research shapes every agenda item. Nothing is templated or recycled.' },
  { num: '03', title: 'Programme build',   desc: 'Sessions, panels, and keynotes designed to serve a specific purpose within the event narrative.' },
  { num: '04', title: 'Content creation',  desc: 'Every word written and branded in-house. Agenda copy, bios, invitations, run-of-show.' },
  { num: '05', title: 'Attendee curation', desc: 'Delegates personally invited. Director level and above. Not open registration.' },
  { num: '06', title: 'Vendor management', desc: 'Every supplier sourced, contracted, and managed entirely by us across all regions.' },
  { num: '07', title: 'Delivery',          desc: 'Full on-site management from setup to close. The client\'s job is to be present.' },
  { num: '08', title: 'Post-event',        desc: 'Summary report, recordings, highlight reel, and attendee follow-up sequence.' },
]

const tracks = [
  {
    id: 'brief', label: 'I have an event in mind',
    desc: 'For clients with a defined objective and audience.',
    fields: [
      { name: 'name',      label: 'Name and job title',    type: 'text',     required: true,  placeholder: 'Jane Smith, Head of Strategy' },
      { name: 'company',   label: 'Organisation',          type: 'text',     required: true,  placeholder: 'Company name' },
      { name: 'industry',  label: 'Industry',              type: 'text',     required: true,  placeholder: 'e.g. Financial Services' },
      { name: 'objective', label: 'Event objective',       type: 'textarea', required: true,  placeholder: 'What do you need this event to achieve?' },
      { name: 'geography', label: 'Location',              type: 'text',     required: false, placeholder: 'e.g. Dubai, Singapore, London' },
      { name: 'timing',    label: 'Timing',                type: 'text',     required: false, placeholder: 'e.g. Q3 2026' },
      { name: 'budget',    label: 'Estimated budget',      type: 'text',     required: false, placeholder: 'e.g. $50,000–$100,000' },
      { name: 'email',     label: 'Contact email',         type: 'email',    required: true,  placeholder: 'jane@company.com' },
    ],
  },
  {
    id: 'explore', label: "I want to explore what's possible",
    desc: "For leaders who know something is missing but haven't defined it yet.",
    fields: [
      { name: 'name',      label: 'Name and job title',              type: 'text',     required: true,  placeholder: 'Jane Smith, Head of Strategy' },
      { name: 'company',   label: 'Organisation',                    type: 'text',     required: true,  placeholder: 'Company name' },
      { name: 'industry',  label: 'Industry',                        type: 'text',     required: true,  placeholder: 'e.g. Financial Services' },
      { name: 'objective', label: 'What are you trying to achieve?', type: 'textarea', required: true,  placeholder: 'Open text — there is no wrong answer.' },
      { name: 'email',     label: 'Contact email',                   type: 'email',    required: true,  placeholder: 'jane@company.com' },
    ],
  },
  {
    id: 'sponsor', label: "I'm interested in sponsorship",
    desc: 'For brands seeking access to rooms of senior decision-makers.',
    fields: [
      { name: 'name',      label: 'Name and job title',     type: 'text',     required: true,  placeholder: 'Jane Smith, Head of Partnerships' },
      { name: 'company',   label: 'Organisation',           type: 'text',     required: true,  placeholder: 'Company name' },
      { name: 'event',     label: 'Event of interest',      type: 'text',     required: false, placeholder: 'Event name, or leave open' },
      { name: 'objective', label: 'Sponsorship objectives', type: 'textarea', required: true,  placeholder: 'What does a successful sponsorship look like?' },
      { name: 'email',     label: 'Contact email',          type: 'email',    required: true,  placeholder: 'jane@company.com' },
    ],
  },
]

/* ─── CONFERENCE HALL ───────────────────────────────────────── */
function ConferenceHall() {
  const mountRef = useRef(null)

  useEffect(() => {
    let THREE, renderer, scene, camera, animId
    let chairMesh, particles, pVel
    let visible = true

    const init = async () => {
      const mod = await import('three')
      THREE = mod
      if (!mountRef.current) return

      const W = mountRef.current.clientWidth
      const H = mountRef.current.clientHeight

      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' })
      renderer.setSize(W, H)
      renderer.setPixelRatio(1)
      renderer.shadowMap.enabled = false
      renderer.outputColorSpace = THREE.SRGBColorSpace
      mountRef.current.appendChild(renderer.domElement)

      scene = new THREE.Scene()
      // Lighter fog so hall is actually visible
      scene.fog = new THREE.FogExp2(0x0d0028, 0.014)
      scene.background = new THREE.Color(0x0d0028)

      camera = new THREE.PerspectiveCamera(65, W / H, 0.5, 200)
      camera.position.set(0, 5, 70)
      camera.lookAt(0, 3, 0)

      /* ── MATERIALS — Lambert, all emissive-boosted for visibility ── */
      const floorMat  = new THREE.MeshLambertMaterial({ color: 0x150035 })
      const wallMat   = new THREE.MeshLambertMaterial({ color: 0x100028 })
      const ceilMat   = new THREE.MeshLambertMaterial({ color: 0x0a001a })
      const stageMat  = new THREE.MeshLambertMaterial({ color: 0x200050, emissive: 0x100028, emissiveIntensity: 0.5 })
      const podMat    = new THREE.MeshLambertMaterial({ color: 0x9d5ffa, emissive: 0x7b2ff7, emissiveIntensity: 0.9 })
      const screenMat = new THREE.MeshLambertMaterial({ color: 0x1a0060, emissive: 0x2d0a8e, emissiveIntensity: 1.2 })
      const neonP     = new THREE.MeshLambertMaterial({ color: 0xbfa0fb, emissive: 0x7b2ff7, emissiveIntensity: 2.0 })
      const neonG     = new THREE.MeshLambertMaterial({ color: 0xf0d080, emissive: 0xc9a84c, emissiveIntensity: 2.0 })
      const chairM    = new THREE.MeshLambertMaterial({ color: 0x2a1060, emissive: 0x150035, emissiveIntensity: 0.3 })
      const tableM    = new THREE.MeshLambertMaterial({ color: 0x1e0840, emissive: 0x100020, emissiveIntensity: 0.2 })
      const colMat    = new THREE.MeshLambertMaterial({ color: 0x1a0840, emissive: 0x0d0020, emissiveIntensity: 0.4 })

      const HW = 24, HD = 65, HH = 12

      /* ── HALL PLANES ── */
      const addPlane = (w, h, mat, px, py, pz, rx, ry) => {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat)
        m.position.set(px, py, pz)
        m.rotation.set(rx, ry, 0)
        scene.add(m)
      }
      addPlane(HW*2, HD, floorMat,   0,    0,      0,      -Math.PI/2, 0)
      addPlane(HW*2, HD, ceilMat,    0,    HH,     0,       Math.PI/2, 0)
      addPlane(HW*2, HH, wallMat,    0,    HH/2,  -HD/2,   0,          0)
      addPlane(HD,   HH, wallMat,   -HW,  HH/2,   0,       0,          Math.PI/2)
      addPlane(HD,   HH, wallMat,    HW,  HH/2,   0,       0,         -Math.PI/2)

      /* ── AISLE CARPET — central strip ── */
      const carpet = new THREE.Mesh(new THREE.PlaneGeometry(4, HD), new THREE.MeshLambertMaterial({
        color: 0x1a005a, emissive: 0x0d0040, emissiveIntensity: 0.4
      }))
      carpet.rotation.x = -Math.PI/2
      carpet.position.set(0, 0.01, 0)
      scene.add(carpet)

      /* ── STAGE ── */
      const stage = new THREE.Mesh(new THREE.BoxGeometry(20, 0.7, 10), stageMat)
      stage.position.set(0, 0.35, -25)
      scene.add(stage)

      /* ── PODIUM ── */
      const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.6, 1.1, 8), podMat)
      pod.position.set(0, 1.4, -22)
      scene.add(pod)
      // Podium top plate
      const podTop = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.5), new THREE.MeshLambertMaterial({ color: 0xc9a84c, emissive: 0xc9a84c, emissiveIntensity: 0.8 }))
      podTop.position.set(0, 2.0, -22)
      scene.add(podTop)

      /* ── MAIN SCREEN ── */
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(16, 6.5), screenMat)
      screen.position.set(0, 6.5, -32.3)
      scene.add(screen)
      // Screen bright border
      const screenBorder = new THREE.Mesh(new THREE.PlaneGeometry(16.6, 7.1), neonP)
      screenBorder.position.set(0, 6.5, -32.4)
      scene.add(screenBorder)
      // Screen inner content glow (simulated presentation slide)
      const slideGlow = new THREE.Mesh(new THREE.PlaneGeometry(15, 5.8), new THREE.MeshLambertMaterial({
        color: 0x3a10a0, emissive: 0x4a20c0, emissiveIntensity: 0.7
      }))
      slideGlow.position.set(0, 6.5, -32.2)
      scene.add(slideGlow)

      /* ── CEILING LIGHT BARS ── */
      for (let i = 0; i < 5; i++) {
        const z = -4 - i * 9
        const bar = new THREE.Mesh(new THREE.BoxGeometry(20, 0.12, 0.12), new THREE.MeshLambertMaterial({
          color: 0x888888, emissive: 0x333333, emissiveIntensity: 0.3
        }))
        bar.position.set(0, HH - 0.1, z)
        scene.add(bar)
        // Glow strip under bar
        const glowBar = new THREE.Mesh(new THREE.BoxGeometry(19, 0.05, 0.4), new THREE.MeshLambertMaterial({
          color: 0xffffff, emissive: 0xbfa0fb, emissiveIntensity: 1.5
        }))
        glowBar.position.set(0, HH - 0.3, z)
        scene.add(glowBar)
      }

      /* ── SIDE COLUMNS with neon strips ── */
      for (let i = 0; i < 6; i++) {
        const z = -3 - i * 8
        ;[[-HW + 1.2, neonP], [HW - 1.2, neonG]].forEach(([x, mat]) => {
          // Column body
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, HH, 6), colMat)
          col.position.set(x, HH/2, z)
          scene.add(col)
          // Vertical neon strip
          const strip = new THREE.Mesh(new THREE.BoxGeometry(0.06, HH * 0.7, 0.06), mat)
          strip.position.set(x + (x < 0 ? 0.42 : -0.42), HH * 0.5, z)
          scene.add(strip)
          // Base ring
          const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.12, 8), new THREE.MeshLambertMaterial({ color: 0xc9a84c, emissive: 0xc9a84c, emissiveIntensity: 0.8 }))
          ring.position.set(x, 0.06, z)
          scene.add(ring)
        })
      }

      /* ── STAGE FLOOR UPLIGHTS ── */
      const uplightColors = [0x7b2ff7, 0xc9a84c, 0xbfa0fb, 0xc9a84c, 0x7b2ff7]
      uplightColors.forEach((c, i) => {
        const cone = new THREE.Mesh(
          new THREE.ConeGeometry(0.25, 1.8, 6),
          new THREE.MeshLambertMaterial({ color: c, emissive: c, emissiveIntensity: 1.8, transparent: true, opacity: 0.6 })
        )
        cone.position.set(-8 + i * 4, 0.9, -25)
        scene.add(cone)
      })

      /* ── INSTANCED CHAIRS: 8 rows × 14 cols, split left/right of aisle ── */
      const ROWS = 8, HALF_COLS = 7
      const total = ROWS * HALF_COLS * 2
      // Simple chair shape — flat box approximation
      const seatGeo  = new THREE.BoxGeometry(0.75, 0.08, 0.6)
      const backGeo  = new THREE.BoxGeometry(0.75, 0.65, 0.08)
      const legGeo   = new THREE.CylinderGeometry(0.04, 0.04, 0.38, 4)

      // Merge seat+back into one instanced mesh for perf
      const chairGeo = new THREE.BoxGeometry(0.75, 0.85, 0.68)
      chairMesh = new THREE.InstancedMesh(chairGeo, chairM, total)
      chairMesh.frustumCulled = false
      const dummy = new THREE.Object3D()
      let idx = 0
      for (let row = 0; row < ROWS; row++) {
        const z   = -1 - row * 4.2
        const ty  = row * 0.18
        // Left bank
        for (let col = 0; col < HALF_COLS; col++) {
          dummy.position.set(-2.6 - col * 1.35, ty + 0.44, z)
          dummy.updateMatrix(); chairMesh.setMatrixAt(idx++, dummy.matrix)
        }
        // Right bank
        for (let col = 0; col < HALF_COLS; col++) {
          dummy.position.set(2.6 + col * 1.35, ty + 0.44, z)
          dummy.updateMatrix(); chairMesh.setMatrixAt(idx++, dummy.matrix)
        }
      }
      chairMesh.instanceMatrix.needsUpdate = true
      scene.add(chairMesh)

      /* ── TABLE SURFACES per row (one long instanced plane) ── */
      const tableGeo = new THREE.BoxGeometry(8.5, 0.05, 0.45)
      const tableMesh = new THREE.InstancedMesh(tableGeo, tableM, ROWS * 2)
      let ti = 0
      for (let row = 0; row < ROWS; row++) {
        const z  = -0.65 - row * 4.2
        const ty = row * 0.18 + 0.9
        ;[-5.5, 5.5].forEach(x => {
          dummy.position.set(x, ty, z); dummy.rotation.set(0,0,0)
          dummy.updateMatrix(); tableMesh.setMatrixAt(ti++, dummy.matrix)
        })
      }
      tableMesh.instanceMatrix.needsUpdate = true
      scene.add(tableMesh)

      /* ── FLOOR REFLECTION STRIP (glossy aisle effect) ── */
      const reflStrip = new THREE.Mesh(new THREE.PlaneGeometry(2, HD * 0.6), new THREE.MeshLambertMaterial({
        color: 0x4a10c0, emissive: 0x3a0a90, emissiveIntensity: 0.3, transparent: true, opacity: 0.4
      }))
      reflStrip.rotation.x = -Math.PI/2
      reflStrip.position.set(0, 0.02, -10)
      scene.add(reflStrip)

      /* ── PARTICLES ── */
      const pCount = 200
      const pPos = new Float32Array(pCount * 3)
      pVel = new Float32Array(pCount)
      for (let i = 0; i < pCount; i++) {
        pPos[i*3]   = (Math.random()-0.5) * HW * 1.8
        pPos[i*3+1] = Math.random() * HH
        pPos[i*3+2] = (Math.random()-0.5) * HD * 0.85
        pVel[i]     = 0.004 + Math.random() * 0.005
      }
      const pGeo = new THREE.BufferGeometry()
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
      particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
        color: 0xbfa0fb, size: 0.12, transparent: true, opacity: 0.6, sizeAttenuation: true
      }))
      scene.add(particles)

      /* ── LIGHTING — more lights, higher intensity for visibility ── */
      scene.add(new THREE.AmbientLight(0x2a0060, 3.5))

      // Main overhead fill — warm purple
      const keyL = new THREE.PointLight(0x9d5ffa, 6, 80)
      keyL.position.set(0, 11, -5)
      scene.add(keyL)

      // Stage wash — gold
      const stageL = new THREE.PointLight(0xc9a84c, 5, 50)
      stageL.position.set(0, 8, -26)
      scene.add(stageL)

      // Back purple wash
      const backL = new THREE.PointLight(0x5c18b8, 4, 55)
      backL.position.set(0, 7, -32)
      scene.add(backL)

      // Left/right rim fills
      const rimL = new THREE.PointLight(0x7b2ff7, 3, 50)
      rimL.position.set(-18, 6, -10)
      scene.add(rimL)
      const rimR = new THREE.PointLight(0xc9a84c, 2.5, 50)
      rimR.position.set(18, 6, -10)
      scene.add(rimR)

      // Front fill so seats are readable
      const frontL = new THREE.PointLight(0xbfa0fb, 3, 60)
      frontL.position.set(0, 5, 20)
      scene.add(frontL)

      /* ── VISIBILITY PAUSE ── */
      const onVis = () => { visible = document.visibilityState === 'visible' }
      document.addEventListener('visibilitychange', onVis)

      /* ── RENDER LOOP ── */
      let t = 0, lastTime = 0
      const FRAME_MS = 1000 / 40 // 40fps cap

      const animate = (now) => {
        animId = requestAnimationFrame(animate)
        if (!visible) return
        const delta = now - lastTime
        if (delta < FRAME_MS) return
        lastTime = now - (delta % FRAME_MS)
        t += 0.007

        // One continuous scroll journey.
        // At the top, the camera is outside the room.
        // As the user scrolls down, it moves through the aisle into the conference.
        // Scrolling back up reverses the movement and pulls the viewer outside again.
        const section = mountRef.current?.closest('.ev-journey')
        if (section) {
          const rect = section.getBoundingClientRect()
          const scrollable = Math.max(rect.height - window.innerHeight, 1)
          const p = Math.max(0, Math.min(1, -rect.top / scrollable))

          const targetZ = 78 - p * 92
          const targetY = 5.8 - p * 2.9
          const targetFov = 66 + p * 8

          camera.position.z += (targetZ - camera.position.z) * 0.055
          camera.position.y += (targetY - camera.position.y) * 0.055
          camera.fov += (targetFov - camera.fov) * 0.05
          camera.updateProjectionMatrix()
        }
        camera.position.x += (Math.sin(t * 0.15) * 0.5 - camera.position.x) * 0.007
        camera.lookAt(0, 3, -5)

        // Particle drift every other frame
        if (Math.floor(t * 100) % 2 === 0) {
          const pos = particles.geometry.attributes.position.array
          for (let i = 0; i < pCount; i++) {
            pos[i*3+1] += pVel[i]
            if (pos[i*3+1] > HH) pos[i*3+1] = 0
          }
          particles.geometry.attributes.position.needsUpdate = true
        }

        renderer.render(scene, camera)
      }
      animId = requestAnimationFrame(animate)

      const onResize = () => {
        if (!mountRef.current) return
        const W = mountRef.current.clientWidth, H = mountRef.current.clientHeight
        camera.aspect = W / H; camera.updateProjectionMatrix()
        renderer.setSize(W, H)
      }
      window.addEventListener('resize', onResize)

      return () => {
        document.removeEventListener('visibilitychange', onVis)
        window.removeEventListener('resize', onResize)
      }
    }

    let cleanup
    init().then(fn => { cleanup = fn }).catch(console.error)
    return () => {
      cancelAnimationFrame(animId)
      if (cleanup) cleanup()
      if (renderer) {
        renderer.dispose()
        if (mountRef.current?.contains(renderer.domElement))
          mountRef.current.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div ref={mountRef} className="ev-hall-canvas" aria-hidden="true" />
}

/* ─── TILT CARD ─────────────────────────────────────────────── */
function TiltCard({ children, className = '', intensity = 10, style }) {
  const ref = useRef(null)
  const raf = useRef(null)
  const onMove = useCallback(e => {
    if (raf.current) cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      const el = ref.current; if (!el) return
      const r = el.getBoundingClientRect()
      const x = ((e.clientX - r.left) / r.width  - 0.5) * 2
      const y = ((e.clientY - r.top)  / r.height - 0.5) * 2
      el.style.transform = `perspective(700px) rotateY(${x*intensity}deg) rotateX(${-y*intensity}deg) translateZ(8px)`
      const s = el.querySelector('.ev-sheen')
      if (s) { s.style.opacity='1'; s.style.backgroundPosition=`${50+x*28}% ${50+y*28}%` }
    })
  }, [intensity])
  const onLeave = useCallback(() => {
    const el = ref.current; if (!el) return
    el.style.transition = 'transform 0.7s cubic-bezier(0.23,1,0.32,1)'
    el.style.transform = 'perspective(700px) rotateY(0) rotateX(0) translateZ(0)'
    const s = el.querySelector('.ev-sheen'); if (s) s.style.opacity = '0'
    setTimeout(() => { if (el) el.style.transition = '' }, 700)
  }, [])
  return (
    <div ref={ref} className={`ev-glass-card ${className}`} style={{ ...style, transformStyle:'preserve-3d', willChange:'transform' }}
      onMouseMove={onMove} onMouseLeave={onLeave}>
      <div className="ev-sheen" aria-hidden="true" />
      {children}
    </div>
  )
}

/* ─── ANIMATED COUNTER ──────────────────────────────────────── */
function Counter({ value, suffix = '' }) {
  const ref = useRef(null)
  const [display, setDisplay] = useState('0')
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      obs.disconnect()
      const num = parseInt(value.replace(/\D/g,''))
      if (isNaN(num)) { setDisplay(value); return }
      const start = performance.now()
      const dur = 1400
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1)
        const eased = 1 - Math.pow(1 - p, 3)
        setDisplay(Math.floor(eased * num).toString())
        if (p < 1) requestAnimationFrame(tick)
        else setDisplay(value)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [value])
  return <span ref={ref}>{display}{suffix}</span>
}

/* ─── FORM ──────────────────────────────────────────────────── */
function TrackForm({ track }) {
  const blank = Object.fromEntries(track.fields.map(f => [f.name, '']))
  const [form, setForm]             = useState(blank)
  const [submitted, setSubmitted]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState(null)
  useEffect(() => {
    setForm(Object.fromEntries(track.fields.map(f => [f.name, ''])))
    setSubmitted(false); setError(null)
  }, [track.id])
  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const onSubmit = async e => {
    e.preventDefault(); setSubmitting(true); setError(null)
    try {
      await api.post('/leads', { ...form, service: `Events — ${track.label}`, track: track.id })
      setSubmitted(true)
    } catch (err) { setError(err?.message || 'Something went wrong.') }
    finally { setSubmitting(false) }
  }
  if (submitted) return (
    <div className="ev-success">
      <div className="ev-success-icon">✓</div>
      <h3>Received.</h3>
      <p>We'll be in touch within two business days.</p>
    </div>
  )
  return (
    <form className="ev-form" onSubmit={onSubmit} noValidate>
      <div className="ev-form-grid">
        {track.fields.map(f => (
          <div key={f.name} className={`ev-field${f.type==='textarea'?' ev-field--full':''}`}>
            <label htmlFor={`${track.id}-${f.name}`}>{f.label}{f.required&&' *'}</label>
            {f.type==='textarea'
              ? <textarea id={`${track.id}-${f.name}`} name={f.name} rows={3} required={f.required} placeholder={f.placeholder} value={form[f.name]} onChange={onChange}/>
              : <input    id={`${track.id}-${f.name}`} name={f.name} type={f.type} required={f.required} placeholder={f.placeholder} value={form[f.name]} onChange={onChange}/>
            }
          </div>
        ))}
      </div>
      {error && <p className="ev-form-error" role="alert">{error}</p>}
      <button type="submit" className="btn btn-primary ev-submit" disabled={submitting}>
        {submitting ? 'Sending…' : 'Submit enquiry →'}
      </button>
    </form>
  )
}

/* ─── PAGE ──────────────────────────────────────────────────── */
export default function EventsPage() {
  const [activeStage, setActiveStage] = useState(0)
  const [activeTrack, setActiveTrack] = useState(0)
  const methodRef  = useScrollReveal()
  const sponsorRef = useScrollReveal()
  const formRef    = useScrollReveal()

  return (
    <>
      {/* ══ IMMERSIVE CONFERENCE JOURNEY — one Three.js layout ═══════ */}
      <section className="ev-journey" aria-label="Events conference journey">
        <ConferenceHall />
        <div className="noise-overlay" aria-hidden="true" />

        <div className="ev-journey-panels">
          <article className="ev-copy-panel ev-copy-panel--hero">
            <div className="container">
              <div className="ev-copy-card">
                <p className="ev-label ev-hero-label">Mawkish Creates — Events</p>
                <h1 className="ev-hero-title">
                  We don't manage events.<br />
                  <span className="highlight">We engineer outcomes.</span>
                </h1>
                <p className="ev-hero-sub">
                  Research-driven conference production for enterprise and government clients.
                  Scroll to enter the room.
                </p>
                <div className="ev-hero-actions">
                  <a href="#enquire" className="btn btn-primary">Work with us →</a>
                  <a href="#method"  className="btn btn-ghost">See how we work</a>
                </div>
                <div className="ev-scroll-hint" aria-hidden="true">
                  <span /><p>scroll to enter</p>
                </div>
              </div>
            </div>
          </article>

          <article className="ev-copy-panel ev-copy-panel--statement">
            <div className="container">
              <div className="ev-copy-card ev-copy-card--wide">
                <p className="ev-label">What this is</p>
                <h2 className="ev-statement-title">
                  Not event coverage. Not venue coordination.{' '}
                  <span className="highlight">A conference arm built on research and commercial intent.</span>
                </h2>
              </div>
            </div>
          </article>

          <article className="ev-copy-panel ev-copy-panel--stats">
            <div className="container">
              <div className="ev-copy-card ev-copy-card--wide">
                <p className="ev-label">Inside the room</p>
                <div className="ev-statement-stats">
                  {[
                    { val: 'Director', suffix: '+', label: 'Average delegate seniority' },
                    { val: '3',        suffix: ' regions', label: 'GCC · SE Asia · Europe' },
                    { val: '8',        suffix: ' stages',  label: 'End-to-end ownership' },
                  ].map(({ val, suffix, label }) => (
                    <div key={label} className="ev-inline-stat">
                      <div className="ev-inline-stat-num">
                        <Counter value={val} suffix={suffix} />
                      </div>
                      <div className="ev-inline-stat-label">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>

          <article className="ev-copy-panel ev-copy-panel--method">
            <div className="container">
              <div className="ev-copy-card">
                <p className="ev-label">How we work</p>
                <h2 className="ev-heading">
                  From research to room.<br />
                  <span className="highlight">We own every step.</span>
                </h2>
                <p className="ev-sub" style={{ marginTop:'var(--space-4)', marginBottom:'var(--space-8)' }}>
                  Most event companies start at logistics. We start at intelligence —
                  then build the agenda, the room, and every asset from scratch.
                </p>
                <a href="#method" className="btn btn-primary">Explore the process →</a>
              </div>
            </div>
          </article>
        </div>

        <div className="ev-journey-fade" aria-hidden="true" />
      </section>

      {/* ══ METHOD — interactive accordion stages ══════════════ */}
      <section className="ev-method section" id="method" ref={methodRef}>
        <div className="ev-glow ev-glow-1" aria-hidden="true" />
        <div className="ev-glow ev-glow-2" aria-hidden="true" />
        <div className="container">
          <div className="ev-method-head">
            <div>
              <p className="ev-label">How we work</p>
              <h2 className="ev-heading">
                From research to room.<br />
                <span className="highlight">We own every step.</span>
              </h2>
            </div>
            <p className="ev-sub">
              Most event companies start at logistics. We start at intelligence —
              then build the agenda, the room, and every asset from scratch.
            </p>
          </div>

          {/* Interactive stage selector */}
          <div className="ev-stage-layout">
            {/* Left — number list */}
            <div className="ev-stage-list">
              {stages.map((s, i) => (
                <button
                  key={s.num}
                  className={`ev-stage-btn${activeStage === i ? ' ev-stage-btn--active' : ''}`}
                  onClick={() => setActiveStage(i)}
                >
                  <span className="ev-stage-btn-num">{s.num}</span>
                  <span className="ev-stage-btn-title">{s.title}</span>
                  <span className="ev-stage-btn-arrow">→</span>
                </button>
              ))}
            </div>
            {/* Right — active stage detail card */}
            <TiltCard className="ev-stage-detail" intensity={6} key={activeStage}>
              <div className="ev-stage-detail-num">{stages[activeStage].num}</div>
              <h3 className="ev-stage-detail-title">{stages[activeStage].title}</h3>
              <p className="ev-stage-detail-desc">{stages[activeStage].desc}</p>
              <div className="ev-stage-detail-progress">
                <div className="ev-stage-detail-bar" style={{ width: `${((activeStage+1)/stages.length)*100}%` }} />
              </div>
              <p className="ev-stage-detail-count">{activeStage+1} of {stages.length}</p>
              <div className="ev-stage-detail-nav">
                <button onClick={() => setActiveStage(i => Math.max(0, i-1))} disabled={activeStage===0}>← Prev</button>
                <button onClick={() => setActiveStage(i => Math.min(stages.length-1, i+1))} disabled={activeStage===stages.length-1}>Next →</button>
              </div>
            </TiltCard>
          </div>

          <div className="ev-method-cta">
            <a href="#enquire" className="btn btn-primary">Build yours with us →</a>
          </div>
        </div>
      </section>

      {/* ══ SPONSORS ══════════════════════════════════════════ */}
      <section className="ev-sponsor section" ref={sponsorRef}>
        <div className="ev-glow ev-glow-sponsor" aria-hidden="true" />
        <div className="container ev-sponsor-inner">
          <div className="reveal-on-scroll">
            <p className="ev-label">For sponsors</p>
            <h2 className="ev-heading">
              The room you{' '}
              <span className="highlight">cannot build yourself.</span>
            </h2>
            <p className="ev-sub" style={{ marginTop:'var(--space-4)', marginBottom:'var(--space-8)' }}>
              Every attendee is personally invited. Sponsoring a Mawkish Creates event means
              buying access to a room that took months of research to assemble.
            </p>
            <a href="#enquire" onClick={() => setActiveTrack(2)} className="btn btn-ghost">
              Enquire about sponsorship →
            </a>
          </div>
          <ul className="ev-sponsor-list reveal-on-scroll">
            {[
              ['Speaking opportunity',         'Keynote, panel, or session chair.'],
              ['Branded content integration',  'Name and logo across all event materials.'],
              ['1-to-1 meeting facilitation',  'Curated introductions to specific delegates.'],
              ['Post-event content licensing', 'Recordings, reports, and highlight reels.'],
              ['On-site brand presence',       'Signage, collateral, and hosted space.'],
            ].map(([title, desc], i) => (
              <li key={title} className="ev-sponsor-item reveal-on-scroll" style={{ transitionDelay:`${i*0.07}s` }}>
                <div className="ev-sponsor-dot" aria-hidden="true" />
                <div><strong>{title}</strong><p>{desc}</p></div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ══ ENQUIRY ═══════════════════════════════════════════ */}
      <section className="ev-enquire section" id="enquire" ref={formRef}>
        <div className="ev-glow ev-glow-enquire" aria-hidden="true" />
        <div className="container">
          <div className="ev-enquire-head reveal-on-scroll">
            <p className="ev-label">Work with us</p>
            <h2 className="ev-heading">
              Let's build something <span className="highlight">worth attending.</span>
            </h2>
          </div>
          <div className="ev-tracks reveal-on-scroll">
            {tracks.map((t, i) => (
              <button key={t.id}
                className={`ev-track-btn${activeTrack===i?' ev-track-btn--active':''}`}
                onClick={() => setActiveTrack(i)}>
                <span className="ev-track-num">{String(i+1).padStart(2,'0')}</span>
                {t.label}
              </button>
            ))}
          </div>
          <TiltCard className="ev-form-wrap reveal-on-scroll" intensity={3}>
            <div className="ev-form-intro">
              <h3 className="ev-form-title">{tracks[activeTrack].label}</h3>
              <p className="ev-form-desc">{tracks[activeTrack].desc}</p>
            </div>
            <TrackForm key={activeTrack} track={tracks[activeTrack]} />
          </TiltCard>
        </div>
      </section>
    </>
  )
}