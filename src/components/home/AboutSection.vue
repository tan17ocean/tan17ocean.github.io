<script setup>
import { computed } from 'vue'
import { store } from '../../composables/useContentStore'

const displayStats = computed(() => {
  const publishedCount = store.posts.filter((p) => p.published !== false).length
  return store.profile.stats.map((s) => {
    if (s.label === '篇文章') {
      return { ...s, value: String(publishedCount) }
    }
    return s
  })
})
</script>

<template>
  <section id="about" class="section">
    <h2 class="section-title">关于我 <span class="section-en">About</span></h2>
    <div class="section-card card" v-reveal>
      <p v-for="(para, i) in store.profile.bio" :key="i" class="about-para">{{ para }}</p>
      <div class="about-stats">
        <div v-for="(s, i) in displayStats" :key="i" class="stat-item">
          <span class="stat-value">{{ s.value }}</span>
          <span class="stat-label">{{ s.label }}</span>
        </div>
      </div>
    </div>
  </section>
</template>