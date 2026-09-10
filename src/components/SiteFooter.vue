<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { profile } from '../data/profile'

const year = new Date().getFullYear()
const elapsed = ref('00:00:00')
let timer = null
const start = Date.now()

function pad(n) {
  return String(n).padStart(2, '0')
}

function tick() {
  const s = Math.floor((Date.now() - start) / 1000)
  elapsed.value = `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`
}

onMounted(() => {
  timer = setInterval(tick, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <p>
        &copy; {{ year }} <strong>{{ profile.name }}</strong> · 由
        <a href="https://vuejs.org" target="_blank" rel="noopener">Vue 3</a> +
        <a href="https://vitejs.dev" target="_blank" rel="noopener">Vite</a>
        驱动
      </p>
      <p class="footer-timer" title="页面已运行时长">已运行 {{ elapsed }}</p>
    </div>
  </footer>
</template>