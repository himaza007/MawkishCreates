import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  IconTarget, IconSmartphone, IconCalendar, IconGlobe,
} from '../components/Icons'
import { api } from '../utils/api'
import ResultsTicker from '../components/ResultsTicker'
import { useCountUp, useMagneticButton } from '../hooks/useAnimations'
import '../styles/home.css'

gsap.registerPlugin(ScrollTrigger)

/* ── Lenis Smooth Scroll ─────────────────────────────────── */
function useLenis() {
  useEffect(() => {
    let lenis
    let rafId

    import('@studio-freight/lenis').then(({ default: Lenis }) => {
      lenis = new Lenis({ lerp: 0.085, smoothWheel: true })

      const raf = time => {
        lenis.raf(time)
        rafId = requestAnimationFrame(raf)
      }

      rafId = requestAnimationFrame(raf)
      lenis.on('scroll', ScrollTrigger.update)
    })

    return () => {
      cancelAnimationFrame(rafId)
      lenis?.destroy()
    }
  }, [])
}

/* ── Hero Particle Canvas - Original Hero Layer ───────────── */
function ParticleCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animId
    let width
    let height
    let particles

    const mouse = { x: -9999, y: -9999 }
    const rand = (a, b) => Math.random() * (b - a) + a

    const resize = () => {
      width = canvas.width = canvas.offsetWidth
      height = canvas.height = canvas.offsetHeight
    }

    const init = () => {
      resize()
      particles = Array.from({ length: 90 }, () => ({
        x: rand(0, width),
        y: rand(0, height),
        vx: rand(-0.25, 0.25),
        vy: rand(-0.25, 0.25),
        r: rand(1.5, 3),
      }))
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1

        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const d = Math.sqrt(dx * dx + dy * dy)

        if (d < 90) {
          p.x += (dx / d) * 1.5
          p.y += (dy / d) * 1.5
        }
      })

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 140) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(163,110,247,${(1 - dist / 140) * 0.3})`
            ctx.lineWidth = 0.8
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(163,110,247,0.65)'
        ctx.fill()
      })

      animId = requestAnimationFrame(draw)
    }

    const onMove = e => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }

    const onLeave = () => {
      mouse.x = -9999
      mouse.y = -9999
    }

    init()
    draw()

    window.addEventListener('resize', init)
    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', init)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className="hero-particle-canvas" aria-hidden="true" />
}

/* ── Immersive Three.js Galaxy Journey After Hero ─────────── */
function GalaxyJourney() {
  const wrapRef = useRef(null)
  const mountRef = useRef(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const mount = mountRef.current
    if (!wrap || !mount) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.innerWidth < 768

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#030008')
    scene.fog = new THREE.FogExp2(0x060010, 0.012)

    const camera = new THREE.PerspectiveCamera(68, mount.clientWidth / mount.clientHeight, 0.1, 900)
    camera.position.set(0, 3, 54)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

    const universe = new THREE.Group()
    const planets = new THREE.Group()
    const constellations = new THREE.Group()
    scene.add(universe, planets, constellations)

    const purple = new THREE.Color('#a36ef7')
    const violet = new THREE.Color('#7b2ff7')
    const gold = new THREE.Color('#c9a84c')
    const ice = new THREE.Color('#d9ccff')
    const white = new THREE.Color('#ffffff')

    const starCount = isMobile ? 2600 : 7800
    const starPositions = new Float32Array(starCount * 3)
    const starColors = new Float32Array(starCount * 3)

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3
      const depth = -Math.random() * 520
      const spread = 22 + Math.abs(depth) * 0.23
      const angle = Math.random() * Math.PI * 2
      const radius = Math.pow(Math.random(), 0.45) * spread

      starPositions[i3] = Math.cos(angle) * radius
      starPositions[i3 + 1] = Math.sin(angle) * radius * 0.58 + (Math.random() - 0.5) * 10
      starPositions[i3 + 2] = depth

      const c = purple.clone().lerp(ice, Math.random() * 0.6)
      if (Math.random() > 0.88) c.lerp(gold, 0.65)
      if (Math.random() > 0.96) c.lerp(white, 0.9)

      starColors[i3] = c.r
      starColors[i3 + 1] = c.g
      starColors[i3 + 2] = c.b
    }

    const starGeometry = new THREE.BufferGeometry()
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3))

    const starMaterial = new THREE.PointsMaterial({
      size: 0.28,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.96,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const starField = new THREE.Points(starGeometry, starMaterial)
    universe.add(starField)

    const spiralCount = isMobile ? 1800 : 4600
    const spiralPositions = new Float32Array(spiralCount * 3)
    const spiralColors = new Float32Array(spiralCount * 3)

    for (let i = 0; i < spiralCount; i++) {
      const i3 = i * 3
      const r = 6 + Math.random() * 92
      const branch = (i % 5) / 5 * Math.PI * 2
      const spin = r * 0.24
      const fuzz = Math.pow(Math.random(), 2.2)

      spiralPositions[i3] = Math.cos(branch + spin) * r + (Math.random() - 0.5) * 16 * fuzz
      spiralPositions[i3 + 1] = (Math.random() - 0.5) * 18 * fuzz
      spiralPositions[i3 + 2] = -120 + Math.sin(branch + spin) * r + (Math.random() - 0.5) * 16 * fuzz

      const c = violet.clone().lerp(ice, Math.random() * 0.45)
      if (Math.random() > 0.82) c.lerp(gold, 0.5)

      spiralColors[i3] = c.r
      spiralColors[i3 + 1] = c.g
      spiralColors[i3 + 2] = c.b
    }

    const spiralGeometry = new THREE.BufferGeometry()
    spiralGeometry.setAttribute('position', new THREE.BufferAttribute(spiralPositions, 3))
    spiralGeometry.setAttribute('color', new THREE.BufferAttribute(spiralColors, 3))

    const spiralMaterial = new THREE.PointsMaterial({
      size: 0.42,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.82,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const spiral = new THREE.Points(spiralGeometry, spiralMaterial)
    universe.add(spiral)

    const nebulaTexture = (() => {
      const canvas = document.createElement('canvas')
      canvas.width = 512
      canvas.height = 512
      const ctx = canvas.getContext('2d')
      const gradient = ctx.createRadialGradient(256, 256, 20, 256, 256, 256)
      gradient.addColorStop(0, 'rgba(255,255,255,0.95)')
      gradient.addColorStop(0.28, 'rgba(180,120,255,0.45)')
      gradient.addColorStop(0.58, 'rgba(120,60,255,0.18)')
      gradient.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 512, 512)
      return new THREE.CanvasTexture(canvas)
    })()

    const nebulaMaterial = new THREE.SpriteMaterial({
      map: nebulaTexture,
      color: '#9d5ffa',
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const nebulaSpecs = [
      [-30, 10, -65, 46, '#7b2ff7', 0.28],
      [32, -8, -130, 70, '#a36ef7', 0.22],
      [-44, -12, -210, 84, '#c9a84c', 0.16],
      [26, 16, -300, 95, '#7cc7ff', 0.14],
      [0, 0, -390, 125, '#9d5ffa', 0.2],
    ]

    nebulaSpecs.forEach(([x, y, z, scale, color, opacity]) => {
      const sprite = new THREE.Sprite(nebulaMaterial.clone())
      sprite.material.color = new THREE.Color(color)
      sprite.material.opacity = opacity
      sprite.position.set(x, y, z)
      sprite.scale.set(scale, scale, 1)
      universe.add(sprite)
    })

    const createPlanet = ({ x, y, z, size, color, emissive, ring, name }) => {
      const group = new THREE.Group()
      group.position.set(x, y, z)
      group.userData.name = name
      group.userData.targetScale = 1

      const planet = new THREE.Mesh(
        new THREE.SphereGeometry(size, 48, 48),
        new THREE.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0.05, emissive, emissiveIntensity: 0.16 })
      )
      group.add(planet)

      const glow = new THREE.Sprite(new THREE.SpriteMaterial({
        map: nebulaTexture,
        color,
        transparent: true,
        opacity: 0.32,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }))
      glow.scale.set(size * 7.5, size * 7.5, 1)
      group.add(glow)

      if (ring) {
        const ringMesh = new THREE.Mesh(
          new THREE.RingGeometry(size * 1.38, size * 2.06, 96),
          new THREE.MeshBasicMaterial({ color: ring, transparent: true, opacity: 0.32, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })
        )
        ringMesh.rotation.x = Math.PI / 2.7
        ringMesh.rotation.z = Math.PI / 8
        group.add(ringMesh)
      }

      planets.add(group)
      return group
    }

    const planetList = [
      createPlanet({ name: 'Lead Generation', x: 24, y: -6, z: -62, size: 4.2, color: '#7b2ff7', emissive: '#35106f', ring: '#c9a84c' }),
      createPlanet({ name: 'Social Media Management', x: -27, y: 9, z: -142, size: 6.4, color: '#d8c4ff', emissive: '#5f2cc2' }),
      createPlanet({ name: 'Event Management', x: 28, y: 7, z: -238, size: 5.2, color: '#c9a84c', emissive: '#7c5520', ring: '#ffffff' }),
      createPlanet({ name: 'Web Development', x: -18, y: -4, z: -338, size: 7.4, color: '#5c18b8', emissive: '#2d0b66' }),
    ]

    const planetMap = {
      'Lead Generation': planetList[0],
      'Social Media Management': planetList[1],
      'Event Management': planetList[2],
      'Web Development': planetList[3],
    }

    const moonGeometry = new THREE.SphereGeometry(0.55, 18, 18)
    const moonMaterial = new THREE.MeshBasicMaterial({ color: '#ffffff' })

    for (let i = 0; i < 24; i++) {
      const moon = new THREE.Mesh(moonGeometry, moonMaterial.clone())
      const z = -40 - i * 16
      const angle = i * 1.7
      const r = 10 + (i % 4) * 4
      moon.position.set(Math.cos(angle) * r, Math.sin(angle) * r * 0.45, z)
      moon.material.transparent = true
      moon.material.opacity = 0.45
      planets.add(moon)
    }

    const makeConstellation = (base, points, color = '#c9a84c', sectionName = 'intro') => {
      const group = new THREE.Group()
      group.position.set(...base)
      group.userData.section = sectionName

      const vectorPoints = points.map(([x, y, z]) => new THREE.Vector3(x, y, z))
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(vectorPoints)
      const line = new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.38, blending: THREE.AdditiveBlending }))
      group.add(line)

      vectorPoints.forEach(point => {
        const node = new THREE.Mesh(
          new THREE.SphereGeometry(0.28, 18, 18),
          new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.52 })
        )
        node.position.copy(point)
        group.add(node)
      })

      constellations.add(group)
      return group
    }

    const constellationList = [
      makeConstellation([-20, 11, -86], [[0, 0, 0], [5, 3, 1], [10, -1, 0], [14, 4, 1]], '#c9a84c', 'intro'),
      makeConstellation([14, -9, -180], [[0, 0, 0], [4, -3, 1], [8, 0, 0], [12, -4, 1], [16, 1, 0]], '#a36ef7', 'services'),
      makeConstellation([-28, -3, -280], [[0, 0, 0], [4, 4, 0], [8, 2, 1], [12, 7, 0]], '#ffffff', 'metrics'),
      makeConstellation([10, 12, -380], [[0, 0, 0], [5, 2, 1], [9, -2, 0], [14, 2, 1], [18, -1, 0]], '#c9a84c', 'cta'),
    ]

    const cursor = { x: 0, y: 0 }
    const cameraOffset = { x: 0, y: 0 }
    const serviceFocus = { x: 0, y: 0, active: false }
    let scrollVelocity = 0
    let lastScrollY = window.scrollY
    let scrollVelocityDecay = 0

    const onPointerMove = e => {
      cursor.x = (e.clientX / window.innerWidth - 0.5) * 2
      cursor.y = (e.clientY / window.innerHeight - 0.5) * 2
    }

    const onScroll = () => {
      const current = window.scrollY
      scrollVelocity = Math.abs(current - lastScrollY)
      lastScrollY = current
      scrollVelocityDecay = Math.min(scrollVelocity * 0.002, isMobile ? 0.6 : 2)
    }

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    const cleanupHoverHandlers = []
    const cards = document.querySelectorAll('.service-card')

    cards.forEach(card => {
      const onEnter = () => {
        const title = card.querySelector('.service-title')?.innerText
        const planet = planetMap[title]
        if (!planet) return

        serviceFocus.active = true
        serviceFocus.x = planet.position.x * 0.28
        serviceFocus.y = planet.position.y * 0.28
        planet.userData.targetScale = 1.22
        card.classList.add('service-card--cosmic-focus')
      }

      const onLeave = () => {
        serviceFocus.active = false
        serviceFocus.x = 0
        serviceFocus.y = 0
        Object.values(planetMap).forEach(planet => {
          planet.userData.targetScale = 1
        })
        card.classList.remove('service-card--cosmic-focus')
      }

      card.addEventListener('mouseenter', onEnter)
      card.addEventListener('mouseleave', onLeave)
      card.addEventListener('focus', onEnter)
      card.addEventListener('blur', onLeave)

      cleanupHoverHandlers.push(() => {
        card.removeEventListener('mouseenter', onEnter)
        card.removeEventListener('mouseleave', onLeave)
        card.removeEventListener('focus', onEnter)
        card.removeEventListener('blur', onLeave)
      })
    })

    let ambientAudio = null
    let sparkleAudio = null

    try {
      ambientAudio = new Audio('./space-ambient.mp3')
      ambientAudio.loop = true
      ambientAudio.volume = 0.09
      sparkleAudio = new Audio('/sounds/sparkle.mp3')
      sparkleAudio.volume = 0.18
    } catch {
      ambientAudio = null
      sparkleAudio = null
    }

    const startAmbient = () => {
      ambientAudio?.play().catch(() => {})
    }

    const playSparkle = () => {
      if (!sparkleAudio) return
      sparkleAudio.currentTime = 0
      sparkleAudio.play().catch(() => {})
    }

    window.addEventListener('click', startAmbient, { once: true })
    cards.forEach(card => card.addEventListener('mouseenter', playSparkle))

    const clock = new THREE.Clock()
    let animId

    const getProgress = () => {
      const rect = wrap.getBoundingClientRect()
      const scrollable = wrap.offsetHeight - window.innerHeight
      if (scrollable <= 0) return 0
      return Math.max(0, Math.min(1, -rect.top / scrollable))
    }

    const getActiveSectionName = () => {
      const sections = document.querySelectorAll('.galaxy-panel')

      for (const section of sections) {
        const rect = section.getBoundingClientRect()
        const isActive = rect.top < window.innerHeight * 0.55 && rect.bottom > window.innerHeight * 0.45

        if (isActive) {
          if (section.classList.contains('intro-section')) return 'intro'
          if (section.classList.contains('services-section')) return 'services'
          if (section.classList.contains('metrics-section')) return 'metrics'
          if (section.classList.contains('home-cta')) return 'cta'
          return 'cta'
        }
      }

      return null
    }

    const animate = () => {
      const elapsed = clock.getElapsedTime()
      const progress = getProgress()
      const eased = progress * progress * (3 - 2 * progress)
      const activeSection = getActiveSectionName()

      scrollVelocityDecay *= 0.92
      const warp = Math.min(scrollVelocityDecay, isMobile ? 0.6 : 2)

      starMaterial.size = 0.28 + warp * 0.36
      starMaterial.opacity = Math.min(1, 0.92 + warp * 0.06)
      starField.scale.z += ((1 + warp * 1.55) - starField.scale.z) * 0.09

      const targetZ = 54 - eased * 415
      const driftX = Math.sin(eased * Math.PI * 2.2) * 9
      const driftY = Math.cos(eased * Math.PI * 1.7) * 5

      cameraOffset.x += ((serviceFocus.active ? serviceFocus.x : 0) - cameraOffset.x) * 0.06
      cameraOffset.y += ((serviceFocus.active ? serviceFocus.y : 0) - cameraOffset.y) * 0.06

      camera.position.z += (targetZ - camera.position.z) * 0.08
      camera.position.x += (driftX + cursor.x * 3.5 + cameraOffset.x - camera.position.x) * 0.045
      camera.position.y += (driftY - cursor.y * 2.2 + cameraOffset.y - camera.position.y) * 0.045
      camera.rotation.z += ((Math.sin(eased * Math.PI * 3) * 0.055) - camera.rotation.z) * 0.05
      camera.lookAt(0, 0, camera.position.z - 42)

      starField.rotation.z = elapsed * 0.01 + eased * 0.55
      spiral.rotation.y = elapsed * 0.018 + eased * 1.8
      spiral.rotation.x = Math.sin(elapsed * 0.14) * 0.08

      planetList.forEach((planet, index) => {
        planet.rotation.y += 0.004 + index * 0.001
        planet.rotation.x = Math.sin(elapsed * 0.2 + index) * 0.05
        const targetScale = planet.userData.targetScale || 1
        planet.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08)
      })

      planets.children.forEach((child, index) => {
        if (child.geometry === moonGeometry) {
          child.position.x += Math.sin(elapsed + index) * 0.003
          child.position.y += Math.cos(elapsed * 0.8 + index) * 0.003
        }
      })

      constellationList.forEach((group, index) => {
        const isActive = group.userData.section === activeSection
        const targetScale = isActive ? 1.85 : 1
        group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08)
        group.rotation.z = Math.sin(elapsed * 0.35 + index) * 0.08

        group.children.forEach(child => {
          if (!child.material) return
          const targetOpacity = isActive ? 1 : 0.36
          child.material.opacity += (targetOpacity - child.material.opacity) * 0.08
        })
      })

      renderer.render(scene, camera)

      if (!prefersReducedMotion) {
        animId = requestAnimationFrame(animate)
      }
    }

    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('click', startAmbient)

      cleanupHoverHandlers.forEach(cleanup => cleanup())
      cards.forEach(card => card.removeEventListener('mouseenter', playSparkle))

      ambientAudio?.pause()
      sparkleAudio?.pause()

      starGeometry.dispose()
      starMaterial.dispose()
      spiralGeometry.dispose()
      spiralMaterial.dispose()
      nebulaTexture.dispose()
      nebulaMaterial.dispose()
      moonGeometry.dispose()
      moonMaterial.dispose()

      planetList.forEach(group => {
        group.traverse(child => {
          if (child.geometry) child.geometry.dispose()
          if (child.material) child.material.dispose()
        })
      })

      constellationList.forEach(group => {
        group.traverse(child => {
          if (child.geometry) child.geometry.dispose()
          if (child.material) child.material.dispose()
        })
      })

      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return (
    <div className="galaxy-journey-bg" ref={wrapRef} aria-hidden="true">
      <div className="galaxy-journey-sticky">
        <div className="galaxy-journey-canvas" ref={mountRef} />
        <div className="galaxy-journey-shade" />
        <div className="galaxy-journey-speed-lines" />
      </div>
    </div>
  )
}

/* ── Count Metric ────────────────────────────────────────── */
function CountMetric({ number, unit, label }) {
  const { ref, value } = useCountUp(parseInt(number.replace(/\D/g, ''), 10))
  const prefix = number.match(/^\$/) ? '$' : ''

  return (
    <div ref={ref} className="metric-item">
      <div className="metric-number">
        {prefix}{value}<span className="metric-unit">{unit}</span>
      </div>
      <div className="metric-label">{label}</div>
    </div>
  )
}

/* ── Magnetic Button ─────────────────────────────────────── */
function MagneticBtn({ to, className, children }) {
  const ref = useMagneticButton(0.3)

  return (
    <div ref={ref} className="magnetic" style={{ display: 'inline-block' }}>
      <Link to={to} className={className}>{children}</Link>
    </div>
  )
}

/* ── Floating Photo Strip ────────────────────────────────── */
function PhotoStrip() {
  const containerRef = useRef(null)

  const photos = [
    { src: '4_mwc.jpeg', rotate: '-8deg', top: '5%', left: '5%' },
    { src: '2_mwc.jpeg', rotate: '6deg', top: '0%', left: '30%' },
    { src: '1_mwc.jpeg', rotate: '-4deg', top: '35%', left: '15%' },
    { src: '3_mwc.jpeg', rotate: '10deg', top: '20%', left: '55%' },
    { src: '5_mwc.jpeg', rotate: '-6deg', top: '50%', left: '40%' },
  ]

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const cards = container.querySelectorAll('.float-card')

        let rafPending = false

    const onScroll = () => {
      if (rafPending) return
      rafPending = true

      requestAnimationFrame(() => {
        rafPending = false
        const rect = container.getBoundingClientRect()
        const progress = Math.max(0, Math.min(1, -rect.top / (rect.height * 0.3)))

        cards.forEach((card, i) => {
          const delay = i * 0.2
          const p = Math.max(0, Math.min(1, (progress - delay) / (0.8 - delay)))
          card.style.transform = `translateX(${p * -300}px) rotate(${card.dataset.rotate})`
          card.style.opacity = Math.max(0, 1 - p * 1.5)
        })
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="float-strip" ref={containerRef}>
      {photos.map((photo, index) => (
        <div
          key={index}
          className="float-card"
          data-rotate={photo.rotate}
          style={{
            top: photo.top,
            left: photo.left,
            transform: `rotate(${photo.rotate})`,
            opacity: 1,
          }}
        >
          <img src={photo.src} alt="" />
        </div>
      ))}
    </div>
  )
}

/* ── Scroll Reveal ───────────────────────────────────────── */
function useReveal() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const tween = gsap.fromTo(
      el,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true,
        },
      }
    )

    return () => tween.kill()
  }, [])

  return ref
}

/* ── Static Data ─────────────────────────────────────────── */
const services = [
  {
    Icon: IconTarget,
    title: 'Lead Generation',
    desc: 'We build systems that bring the right people to you: qualified, ready, and converting. No guesswork, just results.',
    to: '/work-with-us/lead-generation',
  },
  {
    Icon: IconSmartphone,
    title: 'Social Media Management',
    desc: 'From strategy to execution, we run your social presence so you can focus on running your business.',
    to: '/work-with-us/social-media-management',
  },
  {
    Icon: IconCalendar,
    title: 'Event Management',
    desc: 'We make your events impossible to ignore: building hype before, amplifying during, and keeping the momentum after.',
    to: '/work-with-us/events',
  },
  {
    Icon: IconGlobe,
    title: 'Web Development',
    desc: 'From sleek landing pages to full-scale web apps, we build fast, conversion-focused websites that work as hard as you do.',
    to: '/work-with-us/web-development',
  },
]

const metrics = [
  { number: '200', unit: '+', label: 'Clients Served' },
  { number: '50', unit: 'M', label: 'Leads Generated' },
  { number: '340', unit: '%', label: 'Avg. Revenue Growth' },
  { number: '5', unit: '+', label: 'Years of Expertise' },
]

/* ══════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════ */
export default function Home() {
  const [testimonials, setTestimonials] = useState([])
  useLenis()

  useEffect(() => {
    api.get('/testimonials?featured=true')
      .then(response => setTestimonials(response.data))
      .catch(() => {})
  }, [])

  const heroTitleRef = useRef(null)
  const heroSubRef = useRef(null)
  const heroActionsRef = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 })

    tl.fromTo(
      heroTitleRef.current,
      { y: 80, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.1, ease: 'power4.out' }
    )
      .fromTo(
        heroSubRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' },
        '-=0.6'
      )
      .fromTo(
        heroActionsRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' },
        '-=0.5'
      )

    return () => tl.kill()
  }, [])

  const introRef = useReveal()
  const servicesRef = useReveal()
  const metricsRef = useReveal()
  const ctaRef = useReveal()

  const servicesGridRef = useRef(null)
  const metricsGridRef = useRef(null)

  useEffect(() => {
    const grid = servicesGridRef.current
    if (!grid) return

    const tween = gsap.fromTo(
      grid.querySelectorAll('.service-card'),
      { y: 70, opacity: 0, rotateX: 10 },
      {
        y: 0,
        opacity: 1,
        rotateX: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: {
          trigger: grid,
          start: 'top 80%',
          once: true,
        },
      }
    )

    return () => tween.kill()
  }, [])

  useEffect(() => {
    const grid = metricsGridRef.current
    if (!grid) return

    const tween = gsap.fromTo(
      grid.querySelectorAll('.metric-item'),
      { y: 40, opacity: 0, scale: 0.92 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: grid,
          start: 'top 85%',
          once: true,
        },
      }
    )

    return () => tween.kill()
  }, [])

  return (
    <main className="home-page">
      {/* ════════════════════════════════════════════════════
          HERO - left untouched in structure and styling
      ═════════════════════════════════════════════════════ */}
      <section className="hero" aria-label="Hero">
        <div className="fluid-bg" aria-hidden="true">
          <div className="fluid-blob fluid-blob-1" />
          <div className="fluid-blob fluid-blob-2" />
          <div className="fluid-blob fluid-blob-3" />
          <div className="fluid-blob fluid-blob-4" />
        </div>

        <div className="hero-bg-orb hero-bg-orb-1" aria-hidden="true" />
        <div className="hero-bg-orb hero-bg-orb-2" aria-hidden="true" />
        <div className="hero-bg-orb hero-bg-orb-3" aria-hidden="true" />
        <div className="noise-overlay" aria-hidden="true" />

        <ParticleCanvas />

        <div className="hero-deco-text deco-text" aria-hidden="true">GROWTH</div>

        <div className="container">
          <div className="hero-inner">
            <div className="hero-content">
              <p className="hero-eyebrow"> Your Creative Growth Partner</p>

              <h1 className="hero-title" ref={heroTitleRef}>
                <span className="line-italic">Scaling Businesses</span>
                <span className="line-accent">Through Strategy</span>
              </h1>

              <p className="hero-subtitle" ref={heroSubRef}>
                We design and execute high-impact campaigns that generate
                qualified leads, grow revenue, and build lasting brands.
              </p>

              <div className="hero-actions" ref={heroActionsRef}>
                <MagneticBtn to="/work-with-us" className="btn btn-primary">
                  Work With Us →
                </MagneticBtn>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-scroll" aria-hidden="true">
          <span className="hero-scroll-text">Scroll</span>
          <div className="hero-scroll-line" />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          AFTER HERO - immersive Three.js galaxy journey
      ═════════════════════════════════════════════════════ */}
      <section className="galaxy-journey">
        <GalaxyJourney />

        <div className="galaxy-journey-content">
          <ResultsTicker />

          <section className="galaxy-panel intro-section section" aria-labelledby="intro-heading">
            <div className="galaxy-scroll-indicator">
              <span>01</span>
              Entering the Mawkish Constellation
            </div>

            <div className="intro-split">
              <div className="container">
                <div className="intro-content galaxy-glass-panel" ref={introRef}>
                  <p className="section-label">Who We Are</p>

                  <h2 id="intro-heading" className="section-title">
                    Your Growth Partner,<br />
                    <span className="highlight">Definitely not an Agency</span>
                  </h2>

                  <div className="divider" />

                  <p className="section-subtitle">
                    Mawkish Creates is a results-obsessed creative partner dedicated to scaling
                    businesses through strategic lead generation, social media management, and event marketing.
                    We don't just run campaigns, we engineer your growth.
                  </p>

                  <div className="intro-stats-row">
                    {[
                      { n: '50+', d: 'Clients across diverse industries' },
                      { n: '98%', d: 'Client satisfaction rate promised' },
                      { n: '$2M+', d: 'Revenue generated for clients' },
                      { n: '5M+', d: 'Campaign impressions delivered' },
                    ].map(({ n, d }) => (
                      <div key={n} className="intro-stat">
                        <div className="intro-stat-number">{n}</div>
                        <div className="intro-stat-desc">{d}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 'var(--space-8)' }}>
                    <MagneticBtn to="/about" className="btn btn-secondary">
                      Learn More About Us →
                    </MagneticBtn>
                  </div>
                </div>
              </div>

              <PhotoStrip />
            </div>
          </section>

          <section className="galaxy-panel services-section section" aria-labelledby="services-heading">
            <div className="galaxy-scroll-indicator">
              <span>02</span>
              Crossing the Speciality Belt
            </div>

            <div className="section-deco-text deco-text services-deco" aria-hidden="true">
              SERVICES
            </div>

            <div className="container">
              <div className="services-header" ref={servicesRef}>
                <p className="section-label">What We Do</p>

                <h2 id="services-heading" className="section-title">
                  Services Built for <span className="highlight">Real Results</span>
                </h2>

                <p className="section-subtitle">
                  Everything we build is designed to move the needle —
                  more qualified leads, higher conversions, and a brand people actually remember.
                </p>
              </div>

              <div className="services-grid" ref={servicesGridRef}>
                {services.map(({ Icon, title, desc, to, cosmicName }) => (
                  <Link
                    key={title}
                    to={to}
                    className="service-card"
                    aria-label={`Learn more about ${title}`}
                  >
                    <div className="service-cosmic-name">{cosmicName}</div>

                    <div className="service-icon" aria-hidden="true">
                      <Icon size={26} strokeWidth={1.5} />
                    </div>

                    <h3 className="service-title">{title}</h3>
                    <p className="service-desc">{desc}</p>

                    <div className="service-link-arrow">
                      Learn More <span>→</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className="galaxy-panel metrics-section" aria-label="Agency metrics">
            <div className="galaxy-scroll-indicator">
              <span>03</span>
              Passing the Proof Planets
            </div>

            <div className="section-deco-text deco-text metrics-deco" aria-hidden="true">
              IMPACT
            </div>

            <div className="container">
              <div ref={metricsRef} className="metrics-header">
                <p className="section-label">By The Numbers</p>

                <h2 className="section-title">
                  Results That <span className="highlight">Speak.</span>
                </h2>

                <p className="section-subtitle">
                  The brighter the constellation, the stronger the proof behind it.
                </p>
              </div>

              <div className="metrics-grid" ref={metricsGridRef}>
                {metrics.map(({ number, unit, label }) => (
                  <CountMetric key={label} number={number} unit={unit} label={label} />
                ))}
              </div>
            </div>
          </section>

          {testimonials.length > 0 && (
            <section className="galaxy-panel testimonials-section section">
              <div className="galaxy-scroll-indicator">
                <span>04</span>
                Echoes from the Orbit
              </div>

              <div className="container">
                <div className="testimonials-header">
                  <p className="section-label">Client Voices</p>

                  <h2 className="section-title">
                    Brands That <span className="highlight">Trusted the Orbit</span>
                  </h2>
                </div>

                <div className="testimonials-grid">
                  {testimonials.slice(0, 3).map((item, index) => (
                    <article key={item._id || index} className="testimonial-card">
                      <div className="testimonial-stars">★★★★★</div>
                      <span className="testimonial-quote-mark">“</span>

                      <p className="testimonial-text">
                        {item.quote || item.text || item.message}
                      </p>

                      <div className="testimonial-author">
                        <div className="testimonial-avatar">
                          {(item.name || 'M').charAt(0)}
                        </div>

                        <div>
                          <div className="testimonial-author-name">{item.name}</div>
                          <div className="testimonial-author-role">
                            {item.role || item.company}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}

          <section className="galaxy-panel home-cta section" aria-label="Call to action">
            <div className="galaxy-scroll-indicator">
              <span>05</span>
              Beyond Infinite
            </div>

            <div className="home-cta-deco deco-text" aria-hidden="true">
              BEYOND INFINITE
            </div>

            <div className="container">
              <div className="home-cta-inner galaxy-cta-card" ref={ctaRef}>
                <p className="section-label">Start Your Orbit</p>

                <h2 className="home-cta-title">
                  Ready to Build Something <em>Unmissable?</em>
                </h2>

                <p className="home-cta-desc">
                  Let’s create a growth system that attracts the right audience,
                  builds real trust, and turns attention into measurable results.
                </p>

                <div className="home-cta-actions">
                  <MagneticBtn to="/work-with-us" className="btn btn-primary">
                    Work With Us →
                  </MagneticBtn>

                  <MagneticBtn to="/about" className="btn btn-secondary">
                    Explore Mawkish →
                  </MagneticBtn>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
