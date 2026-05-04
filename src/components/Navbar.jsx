import { useState, useEffect, useRef } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import { useMagneticButton } from '../hooks/useAnimations'
import '../styles/navbar.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const location   = useLocation()
  const navRef     = useRef(null)
  const logoRef    = useRef(null)
  const hamRef     = useRef(null)
  const overlayRef = useRef(null)
  const linksRef   = useRef([])
  const footerRef  = useRef(null)

  // Magnetic hamburger
  const magHamRef = useMagneticButton(0.4)

  // ── Mount: navbar slide-down ──────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        navRef.current,
        { y: -80, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.2 }
      )
      gsap.fromTo(
        logoRef.current,
        { scale: 0.6, opacity: 0, rotation: -15 },
        { scale: 1, opacity: 1, rotation: 0, duration: 1.1, ease: 'back.out(1.8)', delay: 0.4 }
      )
      gsap.fromTo(
        hamRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(2)', delay: 0.7 }
      )
    })
    return () => ctx.revert()
  }, [])

  // ── Overlay open/close GSAP ───────────────────────────────
  useEffect(() => {
    const overlay = overlayRef.current
    const links   = linksRef.current.filter(Boolean)
    const footer  = footerRef.current

    if (menuOpen) {
      // Panel slides in
      gsap.to(overlay, {
        x: '0%',
        duration: 0.65,
        ease: 'power4.out',
        pointerEvents: 'auto',
      })
      // Stagger links
      gsap.fromTo(
        links,
        { x: 40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.55,
          ease: 'power3.out',
          stagger: 0.08,
          delay: 0.25,
        }
      )
      // Footer fades up
      gsap.fromTo(
        footer,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out', delay: 0.55 }
      )
    } else {
      // Links fade out fast
      gsap.to(links, { x: 30, opacity: 0, duration: 0.25, stagger: 0.04, ease: 'power2.in' })
      gsap.to(footer, { y: 10, opacity: 0, duration: 0.2 })
      // Panel slides out
      gsap.to(overlay, {
        x: '100%',
        duration: 0.55,
        ease: 'power4.in',
        pointerEvents: 'none',
        delay: 0.05,
      })
    }
  }, [menuOpen])

  // ── Scroll detection ──────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // ── Close on route change ────────────────────────────────
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  // ── Body scroll lock ─────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  // ── Escape key ───────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  // ── Logo hover pulse ────────────────────────────────────
  const handleLogoEnter = () => {
    gsap.to(logoRef.current, { scale: 1.1, duration: 0.35, ease: 'power2.out' })
  }
  const handleLogoLeave = () => {
    gsap.to(logoRef.current, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)' })
  }

  const navClass = ['navbar', scrolled ? 'navbar-scrolled' : 'navbar-default'].join(' ')

  const overlayLinks = [
    { to: '/',             label: 'Home',     end: true  },
    { to: '/about',        label: 'About Us', end: false },
    { to: '/work-with-us', label: 'Services', end: false },
  ]

  return (
    <>
      <nav ref={navRef} className={navClass} role="navigation" aria-label="Main navigation">
        <div className="navbar-bar">

          {/* ── Left: Logo ── */}
          <Link
            to="/"
            className="nav-logo-left"
            aria-label="Mawkish Creates Home"
            ref={logoRef}
            onMouseEnter={handleLogoEnter}
            onMouseLeave={handleLogoLeave}
          >
            <div className="nav-logo-glow" aria-hidden="true" />
            <img
              src="/mawkish-logo.png"
              alt="Mawkish Creates"
              className={`nav-logo-img${scrolled ? ' scrolled' : ''}`}
            />
          </Link>

          {/* ── Right: hamburger ── */}
          <div className="nav-right">
            <button
              ref={(el) => {
                hamRef.current = el
                if (magHamRef) magHamRef.current = el
              }}
              className={`nav-hamburger${menuOpen ? ' is-open' : ''}`}
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <span className="ham-line ham-line--top" />
              <span className="ham-line ham-line--mid" />
              <span className="ham-line ham-line--bot" />
            </button>
          </div>

        </div>
      </nav>

      {/* Backdrop */}
      {menuOpen && (
        <div
          className="nav-overlay-backdrop"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-in overlay — initial CSS: translateX(100%) */}
      <div
        ref={overlayRef}
        className="nav-overlay"
        aria-hidden={!menuOpen}
        style={{ transform: 'translateX(100%)' }}
      >
        {/* Decorative orb */}
        <div className="overlay-orb" aria-hidden="true" />

        <button
          className="overlay-close-btn"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="nav-overlay-inner">
          <nav className="nav-overlay-links">
            {overlayLinks.map(({ to, label, end }, i) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                ref={(el) => { linksRef.current[i] = el }}
                style={{ opacity: 0 }}
                className={({ isActive }) => `overlay-nav-link${isActive ? ' active' : ''}`}
                onMouseEnter={(e) => {
                  gsap.to(e.currentTarget.querySelector('.overlay-nav-num'), {
                    color: '#9d5ffa', x: 4, duration: 0.25, ease: 'power2.out'
                  })
                  gsap.to(e.currentTarget, { x: 6, duration: 0.3, ease: 'power2.out' })
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.currentTarget.querySelector('.overlay-nav-num'), {
                    color: 'rgba(255,255,255,0.18)', x: 0, duration: 0.35, ease: 'power2.out'
                  })
                  gsap.to(e.currentTarget, { x: 0, duration: 0.4, ease: 'power2.out' })
                }}
              >
                <span className="overlay-nav-num">0{i + 1}</span>
                <span className="overlay-nav-text">{label}</span>
                <svg className="overlay-nav-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </NavLink>
            ))}
          </nav>

          <div ref={footerRef} className="nav-overlay-footer" style={{ opacity: 0 }}>
            <Link to="/work-with-us" className="overlay-cta">
              Get Started Today
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <p className="overlay-tagline">Mawkish Creates</p>
          </div>
        </div>
      </div>
    </>
  )
}