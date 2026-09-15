<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { formatDateCN, readingTime } from '../utils/format'

const props = defineProps({
  post: { type: Object, required: true }
})

const readMins = computed(() => readingTime(props.post.content))

// ---- 3D 磁性卡片效果 ----
const cardRef = ref(null)
const transformStyle = ref('')
const shineStyle = ref('')
const isHovering = ref(false)

let rafId = null
let targetRotateX = 0
let targetRotateY = 0
let currentRotateX = 0
let currentRotateY = 0
let targetShineX = 50
let targetShineY = 50
let currentShineX = 50
let currentShineY = 50

function lerp(start, end, factor) {
  return start + (end - start) * factor
}

function animate() {
  currentRotateX = lerp(currentRotateX, targetRotateX, 0.12)
  currentRotateY = lerp(currentRotateY, targetRotateY, 0.12)
  currentShineX = lerp(currentShineX, targetShineX, 0.12)
  currentShineY = lerp(currentShineY, targetShineY, 0.12)

  transformStyle.value = `perspective(800px) rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg) scale3d(${isHovering.value ? 1.02 : 1}, ${isHovering.value ? 1.02 : 1}, 1)`
  shineStyle.value = `radial-gradient(circle at ${currentShineX}% ${currentShineY}%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 60%)`

  rafId = requestAnimationFrame(animate)
}

function onMouseMove(e) {
  const card = cardRef.value
  if (!card) return

  const rect = card.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const centerX = rect.width / 2
  const centerY = rect.height / 2

  // 计算倾斜角度（最大 ±12 度）
  const rotateY = ((x - centerX) / centerX) * 12
  const rotateX = -((y - centerY) / centerY) * 12

  targetRotateX = rotateX
  targetRotateY = rotateY

  // 光泽位置反向移动（模拟光源在上方）
  targetShineX = 50 + ((x - centerX) / centerX) * 40
  targetShineY = 50 + ((y - centerY) / centerY) * 40

  isHovering.value = true
}

function onMouseLeave() {
  targetRotateX = 0
  targetRotateY = 0
  targetShineX = 50
  targetShineY = 50
  isHovering.value = false
}

onMounted(() => {
  animate()
})

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<template>
  <article
    ref="cardRef"
    class="post-card"
    :class="{ 'post-pinned': post.pinned, 'is-hovering': isHovering }"
    :style="{ transform: transformStyle }"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
  >
    <!-- 3D 光泽层 -->
    <div class="card-shine" :style="{ background: shineStyle }" />

    <h2 class="post-card-title">
      <router-link :to="`/post/${post.id}`">{{ post.title }}</router-link>
      <span v-if="post.pinned" class="pin-icon" title="置顶文章">📌</span>
    </h2>
    <div class="post-card-meta">
      <time :datetime="post.date">{{ formatDateCN(post.date) }}</time>
      <span class="meta-sep">·</span>
      <router-link :to="{ path: '/search', query: { c: post.category } }" class="meta-category">
        {{ post.category }}
      </router-link>
      <span class="meta-sep">·</span>
      <span>约 {{ readMins }} 分钟</span>
    </div>
    <p class="post-card-summary">{{ post.summary }}</p>
    <div class="post-card-foot">
      <div class="tag-list">
        <router-link v-for="t in post.tags" :key="t" :to="{ path: '/search', query: { t } }" class="tag-chip">
          {{ t }}
        </router-link>
      </div>
      <router-link class="post-card-more" :to="`/post/${post.id}`">阅读全文 &rarr;</router-link>
    </div>
  </article>
</template>