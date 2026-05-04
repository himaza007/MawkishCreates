import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import './LoadingScreen.css'

const fragments = Array.from({ length: 36 })

export default function LoadingScreen({ onDone }) {
  const loaderRef = useRef(null)
  const logoRef = useRef(null)
  const fragmentsRef = useRef([])
  const starsRef = useRef([])

  useEffect(() => {
    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => onDone?.(),
    })

    tl.fromTo(
      starsRef.current,
      { opacity: 0, scale: 0 },
      {
        opacity: () => gsap.utils.random(0.35, 1),
        scale: 1,
        duration: 0.9,
        stagger: 0.015,
      }
    )

    tl.fromTo(
      logoRef.current,
      { opacity: 0, scale: 0.85, filter: 'blur(12px)' },
      {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        duration: 1,
      },
      '-=0.5'
    )

    tl.fromTo(
      '.loader-title span',
      { y: '120%', opacity: 0 },
      {
        y: '0%',
        opacity: 1,
        duration: 0.8,
        stagger: 0.08,
      },
      '-=0.5'
    )

    tl.to({}, { duration: 0.65 })

    tl.to(
      logoRef.current,
      {
        opacity: 0,
        scale: 0.92,
        filter: 'blur(10px)',
        duration: 0.45,
        ease: 'power2.in',
      }
    )

    tl.fromTo(
      fragmentsRef.current,
      {
        opacity: 0,
        scale: 0.4,
        x: 0,
        y: 0,
        rotate: 0,
      },
      {
        opacity: 1,
        scale: 1,
        duration: 0.25,
        stagger: {
          amount: 0.18,
          from: 'center',
        },
      },
      '-=0.35'
    )

    tl.to(
      fragmentsRef.current,
      {
        x: () => gsap.utils.random(-180, 180),
        y: () => gsap.utils.random(-160, 220),
        rotate: () => gsap.utils.random(-90, 90),
        scale: () => gsap.utils.random(0.1, 0.7),
        opacity: 0,
        duration: 1.1,
        ease: 'power4.inOut',
        stagger: {
          amount: 0.4,
          from: 'center',
        },
      },
      'fragment'
    )

    tl.to(
      starsRef.current,
      {
        opacity: 0,
        scale: 0,
        duration: 0.8,
        stagger: {
          amount: 0.35,
          from: 'random',
        },
      },
      'fragment+=0.1'
    )

    tl.to(
      '.loader-title',
      {
        opacity: 0,
        y: -20,
        filter: 'blur(8px)',
        duration: 0.5,
      },
      'fragment+=0.1'
    )

    tl.to(
      loaderRef.current,
      {
        opacity: 0,
        duration: 0.7,
        ease: 'power2.inOut',
        pointerEvents: 'none',
      },
      '-=0.2'
    )

    return () => tl.kill()
  }, [onDone])

  return (
    <div ref={loaderRef} className="loader" aria-hidden="true">
      <div className="loader-bg" />
      <div className="loader-vignette" />

      <div className="constellation">
        {Array.from({ length: 72 }).map((_, i) => (
          <span
            key={i}
            ref={el => (starsRef.current[i] = el)}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              '--size': `${Math.random() * 3 + 1}px`,
              '--delay': `${Math.random() * 2}s`,
            }}
          />
        ))}

        <svg className="constellation-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M12 22 L28 38 L46 26 L61 48 L80 34" />
          <path d="M18 72 L34 58 L52 70 L73 54 L88 68" />
          <path d="M62 14 L70 30 L86 22" />
        </svg>
      </div>

      <div className="loader-center">
        <div className="logo-stage">
          <div className="logo-aura" />

          <img
            ref={logoRef}
            src="/Mawkish Creates Logo.png"
            alt="Mawkish Creates"
            className="loader-logo-img"
          />

          <div className="fragment-grid">
            {fragments.map((_, i) => (
              <span
                key={i}
                ref={el => (fragmentsRef.current[i] = el)}
                className="fragment"
              />
            ))}
          </div>
        </div>

        <p className="loader-tagline">A constellation of creative systems</p>
      </div>
    </div>
  )
}