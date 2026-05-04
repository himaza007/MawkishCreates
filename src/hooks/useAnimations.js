import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

/**
 * useLenis — smooth scroll
 */
export function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
    }
  }, [])
}

/**
 * useScrollReveal — IntersectionObserver based, adds .revealed class
 */
export function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed')
          observer.unobserve(entry.target)
        }
      },
      { threshold }
    )

    const targets = el.querySelectorAll('.reveal-on-scroll')
    if (targets.length) {
      targets.forEach(t => observer.observe(t))
    } else {
      observer.observe(el)
    }

    return () => observer.disconnect()
  }, [threshold])

  return ref
}

/**
 * useGsapReveal — GSAP ScrollTrigger stagger reveal
 */
export function useGsapReveal({
  stagger = 0.15,
  y = 50,
  duration = 0.8,
  ease = 'power3.out',
  start = 'top 80%',
} = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const targets = el.querySelectorAll('.gsap-reveal')
    if (!targets.length) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          ease,
          stagger,
          scrollTrigger: {
            trigger: el,
            start,
            once: true,
          },
        }
      )
    }, el)

    return () => ctx.revert()
  }, [stagger, y, duration, ease, start])

  return ref
}

/**
 * useGsapTextReveal — word-by-word animation
 */
export function useGsapTextReveal(duration = 0.9, stagger = 0.08) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const original = el.innerHTML
    const words = el.innerText.trim().split(/\s+/)

    el.innerHTML = words
      .map(
        w =>
          `<span class="gsap-word" style="display:inline-block;overflow:hidden;">
             <span class="gsap-word-inner" style="display:inline-block;">${w}</span>
           </span>`
      )
      .join(' ')

    const inners = el.querySelectorAll('.gsap-word-inner')

    const ctx = gsap.context(() => {
      gsap.fromTo(
        inners,
        { y: '110%', opacity: 0 },
        {
          y: '0%',
          opacity: 1,
          duration,
          ease: 'power4.out',
          stagger,
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
        }
      )
    }, el)

    return () => {
      ctx.revert()
      el.innerHTML = original
    }
  }, [duration, stagger])

  return ref
}

/**
 * useCountUp — number animation
 */
export function useCountUp(target, duration = 1800) {
  const ref = useRef(null)
  const [value, setValue] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.unobserve(entry.target)

        const numTarget = parseFloat(
          target.toString().replace(/[^0-9.]/g, '')
        )
        const start = performance.now()

        const tick = now => {
          const progress = Math.min((now - start) / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setValue(Math.floor(eased * numTarget))
          if (progress < 1) requestAnimationFrame(tick)
          else setValue(numTarget)
        }

        requestAnimationFrame(tick)
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return { ref, value }
}

/**
 * useMagneticButton — hover follow effect
 */
export function useMagneticButton(strength = 0.35) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onMove = e => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) * strength
      const dy = (e.clientY - cy) * strength
      el.style.transform = `translate(${dx}px, ${dy}px)`
    }

    const onLeave = () => {
      el.style.transform = 'translate(0, 0)'
      el.style.transition =
        'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
    }

    const onEnter = () => {
      el.style.transition = 'transform 0.15s linear'
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseenter', onEnter)
    el.addEventListener('mouseleave', onLeave)

    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseenter', onEnter)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [strength])

  return ref
}