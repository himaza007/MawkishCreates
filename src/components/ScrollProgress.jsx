import { useEffect, useRef } from 'react'

export default function ScrollProgress() {
  const ref = useRef(null)

  useEffect(() => {
    const bar = ref.current
    if (!bar) return

    const update = () => {
      const doc    = document.documentElement
      const scroll = doc.scrollTop
      const height = doc.scrollHeight - doc.clientHeight
      const pct    = height > 0 ? scroll / height : 0
      bar.style.transform = `scaleX(${pct})`
      bar.style.width     = '100%'
    }

    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  return <div ref={ref} className="scroll-progress" aria-hidden="true" />
}
