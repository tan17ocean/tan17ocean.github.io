<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  images: { type: Array, default: () => [] },
  initialIndex: { type: Number, default: 0 },
  modelValue: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const currentIndex = ref(props.initialIndex)
const scale = ref(1)
const isDragging = ref(false)
const dragStartX = ref(0)
const dragOffsetX = ref(0)
const isTransitioning = ref(false)

const currentImage = computed(() => props.images[currentIndex.value])
const hasPrev = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value < props.images.length - 1)

function open(index) {
  currentIndex.value = index
  scale.value = 1
  dragOffsetX.value = 0
  emit('update:modelValue', true)
  document.body.style.overflow = 'hidden'
}

function close() {
  emit('update:modelValue', false)
  document.body.style.overflow = ''
}

function prev() {
  if (hasPrev.value && !isTransitioning.value) {
    isTransitioning.value = true
    currentIndex.value--
    scale.value = 1
    setTimeout(() => isTransitioning.value = false, 300)
  }
}

function next() {
  if (hasNext.value && !isTransitioning.value) {
    isTransitioning.value = true
    currentIndex.value++
    scale.value = 1
    setTimeout(() => isTransitioning.value = false, 300)
  }
}

function zoomIn() {
  scale.value = Math.min(scale.value + 0.5, 3)
}

function zoomOut() {
  scale.value = Math.max(scale.value - 0.5, 0.5)
}

function resetZoom() {
  scale.value = 1
}

// 键盘导航
function onKeydown(e) {
  if (!props.modelValue) return
  switch (e.key) {
    case 'Escape':
      close()
      break
    case 'ArrowLeft':
      prev()
      break
    case 'ArrowRight':
      next()
      break
    case '+':
    case '=':
      zoomIn()
      break
    case '-':
      zoomOut()
      break
    case '0':
      resetZoom()
      break
  }
}

// 拖拽切换
function onDragStart(e) {
  if (scale.value > 1) return // 放大时不允许拖拽切换
  isDragging.value = true
  dragStartX.value = e.type.includes('touch') ? e.touches[0].clientX : e.clientX
  dragOffsetX.value = 0
}

function onDragMove(e) {
  if (!isDragging.value) return
  e.preventDefault()
  const currentX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX
  dragOffsetX.value = currentX - dragStartX.value
}

function onDragEnd() {
  if (!isDragging.value) return
  isDragging.value = false
  const threshold = 80
  if (dragOffsetX.value > threshold && hasPrev.value) {
    prev()
  } else if (dragOffsetX.value < -threshold && hasNext.value) {
    next()
  }
  dragOffsetX.value = 0
}

// 点击背景关闭
function onBackdropClick(e) {
  if (e.target === e.currentTarget) close()
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})

// 监听modelValue变化
watch(() => props.modelValue, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="lightbox">
      <div v-if="modelValue" class="lightbox-overlay" @click="onBackdropClick">
        <!-- 顶部工具栏 -->
        <div class="lightbox-toolbar">
          <span class="lightbox-counter">{{ currentIndex + 1 }} / {{ images.length }}</span>
          <div class="lightbox-actions">
            <button class="lightbox-btn" @click="zoomOut" title="缩小 (-)">
              <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M19 13H5v-2h14v2z"/></svg>
            </button>
            <button class="lightbox-btn" @click="resetZoom" title="重置 (0)">
              <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/></svg>
            </button>
            <button class="lightbox-btn" @click="zoomIn" title="放大 (+)">
              <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            </button>
            <button class="lightbox-btn lightbox-close" @click="close" title="关闭 (Esc)">
              <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>
        </div>

        <!-- 左右切换按钮 -->
        <button v-if="hasPrev" class="lightbox-nav lightbox-prev" @click="prev" title="上一张 (←)">
          <svg viewBox="0 0 24 24" width="32" height="32"><path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
        </button>
        <button v-if="hasNext" class="lightbox-nav lightbox-next" @click="next" title="下一张 (→)">
          <svg viewBox="0 0 24 24" width="32" height="32"><path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
        </button>

        <!-- 图片容器 -->
        <div
          class="lightbox-content"
          @mousedown="onDragStart"
          @mousemove="onDragMove"
          @mouseup="onDragEnd"
          @mouseleave="onDragEnd"
          @touchstart="onDragStart"
          @touchmove="onDragMove"
          @touchend="onDragEnd"
        >
          <Transition name="lightbox-slide" mode="out-in">
            <img
              :key="currentIndex"
              :src="currentImage"
              class="lightbox-image"
              :style="{
                transform: `translateX(${dragOffsetX}px) scale(${scale})`,
                cursor: scale > 1 ? 'grab' : 'default'
              }"
              alt=""
              draggable="false"
            />
          </Transition>
        </div>

        <!-- 底部缩略图 -->
        <div v-if="images.length > 1" class="lightbox-thumbnails">
          <button
            v-for="(img, idx) in images"
            :key="idx"
            class="lightbox-thumb"
            :class="{ active: idx === currentIndex }"
            @click="currentIndex = idx"
          >
            <img :src="img" alt="" />
          </button>
        </div>

        <!-- 提示文字 -->
        <div class="lightbox-hint">
          ← → 切换 · + - 缩放 · Esc 关闭 · 拖拽切换
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lightbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.92);
  backdrop-filter: blur(8px);
  z-index: 99999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  user-select: none;
}

.lightbox-toolbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  z-index: 10;
  background: linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 100%);
}

.lightbox-counter {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  font-weight: 500;
}

.lightbox-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.lightbox-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s ease;
}

.lightbox-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.lightbox-close:hover {
  background: rgba(255, 80, 80, 0.3);
}

.lightbox-content {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  touch-action: pan-y;
}

.lightbox-image {
  max-width: 90vw;
  max-height: 80vh;
  object-fit: contain;
  transition: transform 0.3s ease;
  will-change: transform;
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease, transform 0.2s ease;
  z-index: 10;
}

.lightbox-nav:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-50%) scale(1.1);
}

.lightbox-prev {
  left: 20px;
}

.lightbox-next {
  right: 20px;
}

.lightbox-thumbnails {
  position: absolute;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 12px;
  overflow-x: auto;
  max-width: 80vw;
  z-index: 10;
}

.lightbox-thumb {
  flex-shrink: 0;
  width: 60px;
  height: 45px;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid transparent;
  background: none;
  cursor: pointer;
  padding: 0;
  opacity: 0.6;
  transition: opacity 0.2s ease, border-color 0.2s ease;
}

.lightbox-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lightbox-thumb:hover {
  opacity: 0.9;
}

.lightbox-thumb.active {
  opacity: 1;
  border-color: var(--primary, #4e44ce);
}

.lightbox-hint {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.75rem;
  white-space: nowrap;
  pointer-events: none;
}

/* 过渡动画 */
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.3s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

.lightbox-slide-enter-active,
.lightbox-slide-leave-active {
  transition: all 0.3s ease;
}

.lightbox-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.lightbox-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

@media (max-width: 768px) {
  .lightbox-nav {
    width: 44px;
    height: 44px;
  }
  
  .lightbox-prev {
    left: 8px;
  }
  
  .lightbox-next {
    right: 8px;
  }
  
  .lightbox-thumbnails {
    bottom: 50px;
  }
  
  .lightbox-hint {
    display: none;
  }
}
</style>
