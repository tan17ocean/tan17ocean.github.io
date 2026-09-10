<script setup>
import { onMounted } from 'vue'
import { profile } from '../../data/profile'
import { useTypewriter } from '../../composables/useTypewriter'
import { scrollToAnchor } from '../../utils/scroll'

const { text, start } = useTypewriter(profile.heroSubtitles)

onMounted(() => {
  start()
})
</script>

<template>
  <section id="top" class="hero">
    <!-- 装饰层：网格 + 光晕 + 浮动光点 -->
    <div class="hero-bg" aria-hidden="true">
      <span class="hero-glow glow-1"></span>
      <span class="hero-glow glow-2"></span>
      <span class="hero-dot dot-1"></span>
      <span class="hero-dot dot-2"></span>
      <span class="hero-dot dot-3"></span>
    </div>

    <div class="hero-inner">
      <p class="hero-badge">HELLO, I AM</p>
      <h1 class="hero-name">{{ profile.name }}</h1>
      <p class="hero-type">
        <span class="type-text">{{ text }}</span><span class="type-caret" aria-hidden="true"></span>
      </p>
      <div class="hero-actions">
        <router-link to="/posts" class="btn btn-primary btn-lg">进入博客</router-link>
        <button type="button" class="btn btn-ghost btn-lg" @click="scrollToAnchor('contact')">
          联系我
        </button>
      </div>
    </div>

    <button type="button" class="hero-scroll" aria-label="向下滚动" @click="scrollToAnchor('about')">
      <span class="hero-scroll-dot"></span>
    </button>
  </section>
</template>