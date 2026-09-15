<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 光标位置
const cursorX = ref(-100)
const cursorY = ref(-100)
const cursorScale = ref(1)
const cursorOpacity = ref(1)

// 轨迹点
const trailCount = 8
const trail = ref(Array.from({ length: trailCount }, () => ({ x: -100, y: -100, scale: 0 })))

// 涟漪效果
const ripples = ref([])
let rippleId = 0

// 悬停状态
const isHovering = ref(false)
const isClicking = ref(false)

let rafId = null
let mouseX = -100
let mouseY = -100

// 缓动跟随
let currentX = -100
let currentY = -100

function lerp(start, end, factor) {
  return start + (end - start) * factor
}

function updateCursor() {
  // 主光标缓动跟随
  currentX = lerp(currentX, mouseX, 0.15)
  currentY = lerp(currentY, mouseY, 0.15)
  cursorX.value = currentX
  cursorY.value = currentY

  // 轨迹点：每个点跟随前一个点的位置
  let prevX = currentX
  let prevY = currentY
  for (let i = 0; i < trailCount; i++) {
    const point = trail.value[i]
    point.x = lerp(point.x, prevX, 0.25)
    point.y = lerp(point.y, prevY, 0.25)
    point.scale = 1 - (i / trailCount) * 0.7
    prevX = point.x
    prevY = point.y
  }

  rafId = requestAnimationFrame(updateCursor)
}

function onMouseMove(e) {
  mouseX = e.clientX
  mouseY = e.clientY
}

function onMouseDown() {
  isClicking.value = true
  cursorScale.value = 0.8

  // 添加涟漪
  const id = rippleId++
  ripples.value.push({ id, x: currentX, y: currentY, scale: 1, opacity: 0.6 })
  setTimeout(() => {
    ripples.value = ripples.value.filter(r => r.id !== id)
  }, 600)
}

function onMouseUp() {
  isClicking.value = false
  cursorScale.value = 1
}

function checkHover(e) {
  const target = e.target
  const hoverElements = ['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'LABEL']
  const isInteractive = hoverElements.includes(target.tagName) ||
    target.closest('a') ||
    target.closest('button') ||
    target.classList.contains('clickable') ||
    target.classList.contains('admin-mini-btn') ||
    target.classList.contains('post-card') ||
    target.classList.contains('nav-link') ||
    target.classList.contains('tag') ||
    target.classList.contains('pill')

  isHovering.value = isInteractive
}

onMounted(() => {
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mousemove', checkHover)
  document.addEventListener('mousedown', onMouseDown)
  document.addEventListener('mouseup', onMouseUp)
  updateCursor()
})

onUnmounted(() => {
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mousemove', checkHover)
  document.removeEventListener('mousedown', onMouseDown)
  document.removeEventListener('mouseup', onMouseUp)
  cancelAnimationFrame(rafId)
})
</script>

<template>
  <div class="custom-cursor-root" aria-hidden="true">
    <!-- 轨迹点 -->
    <div
      v-for="(point, i) in trail"
      :key="i"
      class="cursor-trail"
      :style="{
        left: point.x + 'px',
        top: point.y + 'px',
        transform: `translate(-50%, -50%) scale(${point.scale})`,
        opacity: point.scale * 0.4
      }"
    />

    <!-- 涟漪 -->
    <div
      v-for="ripple in ripples"
      :key="ripple.id"
      class="cursor-ripple"
      :style="{
        left: ripple.x + 'px',
        top: ripple.y + 'px'
      }"
    />

    <!-- 主光标 -->
    <div
      class="cursor-main"
      :class="{ hovering: isHovering, clicking: isClicking }"
      :style="{
        left: cursorX + 'px',
        top: cursorY + 'px',
        transform: `translate(-50%, -50%) scale(${cursorScale})`
      }"
    >
      <div class="cursor-core" />
      <div class="cursor-ring" />
    </div>
  </div>
</template>

<style scoped>
.custom-cursor-root {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 99999;
}

/* 主光标 */
.cursor-main {
  position: absolute;
  width: 40px;
  height: 40px;
  transition: transform 0.1s ease-out;
  will-change: transform, left, top;
}

.cursor-core {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  background: var(--primary, #4e44ce);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 10px var(--primary, #4e44ce), 0 0 20px var(--primary, #4e44ce);
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cursor-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 32px;
  height: 32px;
  border: 2px solid var(--primary, #4e44ce);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.6;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 悬停状态 */
.cursor-main.hovering .cursor-core {
  width: 4px;
  height: 4px;
  opacity: 0;
}

.cursor-main.hovering .cursor-ring {
  width: 48px;
  height: 48px;
  border-color: var(--primary-hover, #3f36b8);
  opacity: 0.8;
  background: rgba(78, 68, 206, 0.08);
}

/* 点击状态 */
.cursor-main.clicking .cursor-ring {
  border-color: var(--primary-2, #8e7bef);
  opacity: 1;
}

/* 轨迹点 */
.cursor-trail {
  position: absolute;
  width: 12px;
  height: 12px;
  background: var(--primary, #4e44ce);
  border-radius: 50%;
  pointer-events: none;
  will-change: transform, left, top, opacity;
  box-shadow: 0 0 6px var(--primary, #4e44ce);
}

/* 涟漪 */
.cursor-ripple {
  position: absolute;
  width: 40px;
  height: 40px;
  border: 2px solid var(--primary, #4e44ce);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: rippleExpand 0.6s ease-out forwards;
  pointer-events: none;
}

@keyframes rippleExpand {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
  }
  100% {
    transform: translate(-50%, -50%) scale(2.5);
    opacity: 0;
  }
}

/* 深色模式适配 */
[data-theme='dark'] .cursor-core {
  box-shadow: 0 0 10px var(--primary, #8e7bef), 0 0 20px var(--primary, #8e7bef);
}

[data-theme='dark'] .cursor-main.hovering .cursor-ring {
  background: rgba(142, 123, 239, 0.1);
}

/* 隐藏默认光标（全局） */
:global(body) {
  cursor: none !important;
}

:global(a),
:global(button),
:global(input),
:global(textarea),
:global(select),
:global(label),
:global([role="button"]) {
  cursor: none !important;
}
</style>
