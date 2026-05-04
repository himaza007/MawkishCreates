import { useEffect, useRef } from 'react'
import './WaterRipple.css'

export default function WaterRipple() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let W, H, animId
    const RADIUS = 60     
    const STRENGTH = 7 
    const DAMPING = 0.92   
    let buf1, buf2

    const resize = () => {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
      buf1 = new Float32Array(W * H)
      buf2 = new Float32Array(W * H)
    }

    const ripple = (x, y) => {
      const cx = Math.floor(x)
      const cy = Math.floor(y)
      for (let dy = -RADIUS; dy <= RADIUS; dy++) {
        for (let dx = -RADIUS; dx <= RADIUS; dx++) {
          const d = Math.sqrt(dx*dx + dy*dy)
          if (d < RADIUS) {
            const nx = cx + dx, ny = cy + dy
            if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
              buf1[ny * W + nx] += STRENGTH * (1 - d / RADIUS)
            }
          }
        }
      }
    }

    const update = () => {
      for (let y = 1; y < H - 1; y++) {
        for (let x = 1; x < W - 1; x++) {
          const i = y * W + x
          buf2[i] = (
            buf1[i - 1] + buf1[i + 1] +
            buf1[i - W] + buf1[i + W]
          ) / 2 - buf2[i]
          buf2[i] *= DAMPING
        }
      }
      const tmp = buf1; buf1 = buf2; buf2 = tmp
    }

    const draw = () => {
      const imgData = ctx.createImageData(W, H)
      const data = imgData.data

      for (let y = 1; y < H - 1; y++) {
        for (let x = 1; x < W - 1; x++) {
          const i = y * W + x
          const v = buf1[i]
          if (Math.abs(v) > 0.5) {
            const refX = Math.min(W - 1, Math.max(0, x + Math.floor(buf1[i + 1] - buf1[i - 1])))
            const refY = Math.min(H - 1, Math.max(0, y + Math.floor(buf1[i + W] - buf1[i - W])))
            const alpha = Math.min(255, Math.abs(v) * 3)
            const idx = (y * W + x) * 4
            const refIdx = (refY * W + refX) * 4
            data[idx]     = 163
            data[idx + 1] = 110
            data[idx + 2] = 247
            data[idx + 3] = alpha * 0.4
          }
        }
      }
      ctx.putImageData(imgData, 0, 0)  
    }


    const loop = () => {
      update()
      draw()
      animId = requestAnimationFrame(loop)
    }

    const onMove = e => ripple(e.clientX, e.clientY)
    const onClick = e => {
      for (let i = 0; i < 3; i++) {
        setTimeout(() => ripple(e.clientX + Math.random()*20-10, e.clientY + Math.random()*20-10), i * 60)
      }
    }

    resize()
    loop()
    window.addEventListener('resize',    resize)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('click',     onClick)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize',    resize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('click',     onClick)
    }
  }, [])

  return <canvas ref={canvasRef} className="water-ripple-canvas" aria-hidden="true" />
}  