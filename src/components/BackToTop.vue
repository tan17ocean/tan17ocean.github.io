<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const visible = ref(false)

function onScroll() {
  visible.value = (window.scrollY || document.documentElement.scrollTop) > 400
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <button
    v-show="visible"
    class="back-to-top"
    type="button"
    aria-label="回到顶部"
    @click="scrollToTop"
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  </button>
</template>

<style scoped>
.back-to-top {
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 999;
  width: 44px;
  height: 44px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
  opacity: 0;
  animation: fadeIn 0.3s ease forwards;
}

.back-to-top:hover {
  background: var(--primary-soft);
  color: var(--primary);
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.back-to-top svg {
  width: 20px;
  height: 20px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (max-width: 860px) {
  .back-to-top {
    bottom: 20px;
    right: 16px;
    width: 40px;
    height: 40px;
  }
  .back-to-top svg {
    width: 18px;
    height: 18px;
  }
}
</style>
