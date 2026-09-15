<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  toc: { type: Array, required: true },
})

const activeId = ref('')

function onClick(id) {
  const el = document.getElementById(id)
  if (!el) return
  const offset = 80 // 固定导航栏高度偏移
  const top = el.getBoundingClientRect().top + window.scrollY - offset
  window.scrollTo({ top, behavior: 'smooth' })
}

function findActive() {
  if (!props.toc.length) return
  const headings = props.toc
    .map((h) => ({ ...h, el: document.getElementById(h.id) }))
    .filter((h) => h.el)
  if (!headings.length) return
  const scrollY = window.scrollY + 80
  for (let i = headings.length - 1; i >= 0; i--) {
    if (headings[i].el.offsetTop <= scrollY) {
      activeId.value = headings[i].id
      return
    }
  }
  activeId.value = headings[0].id
}

let ticking = false
function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => {
    findActive()
    ticking = false
  })
}

onMounted(() => {
  findActive()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <nav v-if="toc.length" class="toc-nav" aria-label="文章目录">
    <ul class="toc-list">
      <li
        v-for="item in toc"
        :key="item.id"
        class="toc-item"
        :class="{ 'toc-active': activeId === item.id, 'toc-h1': item.level === 1, 'toc-h3': item.level === 3 }"
      >
        <a href="javascript:;" @click.prevent="onClick(item.id)">
          {{ item.text }}
        </a>
      </li>
    </ul>
  </nav>
</template>
