import { useEffect, useRef } from 'react'

export default function FluidBackground({ opacity = 0.12 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId, t = 0

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    const draw = () => {
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)

      const layers = [
        { freq: 0.003, amp: 0.38, speed: 0.0008, hueOffset: 0   },
        { freq: 0.004, amp: 0.32, speed: 0.0012, hueOffset: 40  },
        { freq: 0.002, amp: 0.42, speed: 0.0006, hueOffset: 80  },
        { freq: 0.005, amp: 0.28, speed: 0.0015, hueOffset: 140 },
        { freq: 0.003, amp: 0.35, speed: 0.001,  hueOffset: 200 },
      ]

      layers.forEach(({ freq, amp, speed, hueOffset }) => {
        const hue = ((t * 60 + hueOffset) % 360)
        const grad = ctx.createLinearGradient(
          W * (0.3 + 0.4 * Math.sin(t * speed * 1.3)),
          0,
          W * (0.6 + 0.4 * Math.cos(t * speed * 0.9)),
          H
        )

        grad.addColorStop(0,   `hsla(${hue},        80%, 75%, 0)`)
        grad.addColorStop(0.3, `hsla(${hue + 30},   90%, 70%, 0.55)`)
        grad.addColorStop(0.6, `hsla(${hue + 60},   85%, 65%, 0.45)`)
        grad.addColorStop(1,   `hsla(${hue + 100},  80%, 75%, 0)`)

        ctx.beginPath()

        const points = 8
        const slice  = W / points

        ctx.moveTo(0, H / 2)

        for (let i = 0; i <= points; i++) {
          const x  = i * slice
          const y  = H * (0.5 + amp * Math.sin(freq * x + t * speed * 1000 + hueOffset))
          const cpx = x - slice / 2
          const cpy = H * (0.5 + amp * Math.sin(freq * cpx + t * speed * 1000 + hueOffset))
          ctx.quadraticCurveTo(cpx, cpy, x, y)
        }

        ctx.lineTo(W, H)
        ctx.lineTo(0, H)
        ctx.closePath()
        ctx.fillStyle = grad
        ctx.fill()
      })

      t++
      animId = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position:      'absolute',
        inset:         0,
        width:         '100%',
        height:        '100%',
        pointerEvents: 'none',
        opacity,
        zIndex:        0,
        mixBlendMode:  'multiply',
      }}
    />
  )
}