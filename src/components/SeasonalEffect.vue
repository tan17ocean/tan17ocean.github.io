<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
let ctx = null
let animationId = null
let leaves = []
let w = 0
let h = 0

// 当前季节判断
function getCurrentSeason() {
  const month = new Date().getMonth() + 1 // 1-12
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'autumn'
  return 'winter'
}

const season = getCurrentSeason()

// 不同季节的粒子配置
const seasonConfig = {
  autumn: {
    colors: [
      '#C2593B', '#D2691E', '#CD853F', '#8B4513',
      '#A0522D', '#B8860B', '#DAA520', '#F4A460',
      '#E6A23C', '#FF8C00', '#D2691E', '#BC8F8F'
    ],
    particleCount: 25,
    speedBase: 1.2,
    swayRange: 2,
    rotationSpeed: 0.02,
    sizeRange: [4, 10]
  },
  spring: {
    colors: [
      '#FFB7C5', '#FFC0CB', '#FF69B4', '#FF1493',
      '#DB7093', '#F08080', '#FA8072', '#E9967A'
    ],
    particleCount: 20,
    speedBase: 0.8,
    swayRange: 1.5,
    rotationSpeed: 0.015,
    sizeRange: [3, 7]
  },
  winter: {
    colors: [
      '#FFFFFF', '#F0F8FF', '#E6E6FA', '#B0C4DE',
      '#ADD8E6', '#87CEEB', '#E0FFFF', '#F5F5F5'
    ],
    particleCount: 35,
    speedBase: 0.6,
    swayRange: 1,
    rotationSpeed: 0.01,
    sizeRange: [2, 5]
  },
  summer: {
    colors: [
      '#87CEFA', '#98FB98', '#90EE90', '#20B2AA',
      '#48D1CC', '#40E0D0', '#00CED1', '#5F9EA0'
    ],
    particleCount: 15,
    speedBase: 0.5,
    swayRange: 1,
    rotationSpeed: 0.01,
    sizeRange: [3, 6]
  }
}

const config = seasonConfig[season]

class Leaf {
  constructor() {
    this.reset(true)
  }

  reset(initial = false) {
    this.x = Math.random() * w
    this.y = initial ? Math.random() * h : -20
    this.size = config.sizeRange[0] + Math.random() * (config.sizeRange[1] - config.sizeRange[0])
    this.speedY = config.speedBase + Math.random() * 0.8
    this.speedX = (Math.random() - 0.5) * config.swayRange
    this.rotation = Math.random() * Math.PI * 2
    this.rotationSpeed = (Math.random() - 0.5) * config.rotationSpeed * 2
    this.color = config.colors[Math.floor(Math.random() * config.colors.length)]
    this.opacity = 0.6 + Math.random() * 0.4
    this.swayPhase = Math.random() * Math.PI * 2
    this.swaySpeed = 0.02 + Math.random() * 0.03
    this.type = Math.floor(Math.random() * 3) // 0: 椭圆叶, 1: 菱形叶, 2: 枫叶简化
  }

  update() {
    this.y += this.speedY
    this.swayPhase += this.swaySpeed
    this.x += this.speedX + Math.sin(this.swayPhase) * 1.5
    this.rotation += this.rotationSpeed

    // 边界检查：超出底部重置
    if (this.y > h + 20) {
      this.reset()
    }
    // 左右边界 wrapping
    if (this.x < -20) this.x = w + 20
    if (this.x > w + 20) this.x = -20
  }

  draw() {
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate(this.rotation)
    ctx.globalAlpha = this.opacity
    ctx.fillStyle = this.color

    if (this.type === 0) {
      // 椭圆形叶子
      ctx.beginPath()
      ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2)
      ctx.fill()
      // 叶脉
      ctx.strokeStyle = this.color
      ctx.globalAlpha = this.opacity * 0.5
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(0, -this.size * 0.6)
      ctx.lineTo(0, this.size * 0.6)
      ctx.stroke()
    } else if (this.type === 1) {
      // 菱形叶子
      ctx.beginPath()
      ctx.moveTo(0, -this.size)
      ctx.lineTo(this.size * 0.5, 0)
      ctx.lineTo(0, this.size)
      ctx.lineTo(-this.size * 0.5, 0)
      ctx.closePath()
      ctx.fill()
    } else {
      // 简化枫叶
      const s = this.size
      ctx.beginPath()
      ctx.moveTo(0, -s)
      ctx.lineTo(s * 0.3, -s * 0.3)
      ctx.lineTo(s * 0.8, -s * 0.5)
      ctx.lineTo(s * 0.4, 0)
      ctx.lineTo(s * 0.7, s * 0.4)
      ctx.lineTo(0, s * 0.6)
      ctx.lineTo(-s * 0.7, s * 0.4)
      ctx.lineTo(-s * 0.4, 0)
      ctx.lineTo(-s * 0.8, -s * 0.5)
      ctx.lineTo(-s * 0.3, -s * 0.3)
      ctx.closePath()
      ctx.fill()
    }

    ctx.restore()
  }
}

function resize() {
  const canvas = canvasRef.value
  if (!canvas) return
  w = window.innerWidth
  h = window.innerHeight
  const dpr = window.devicePixelRatio || 1
  canvas.width = w * dpr
  canvas.height = h * dpr
  canvas.style.width = w + 'px'
  canvas.style.height = h + 'px'
  ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
}

function initLeaves() {
  leaves = []
  for (let i = 0; i < config.particleCount; i++) {
    leaves.push(new Leaf())
  }
}

function animate() {
  if (!ctx) return
  ctx.clearRect(0, 0, w, h)
  for (const leaf of leaves) {
    leaf.update()
    leaf.draw()
  }
  animationId = requestAnimationFrame(animate)
}

onMounted(() => {
  resize()
  initLeaves()
  animate()
  window.addEventListener('resize', () => {
    resize()
    // 重新初始化粒子以适应新尺寸
    initLeaves()
  })
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
})
</script>

<template>
  <canvas
    v-if="season !== 'summer'"
    ref="canvasRef"
    class="seasonal-canvas"
    aria-hidden="true"
  />
</template>

<style scoped>
.seasonal-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9998;
}
</style>
