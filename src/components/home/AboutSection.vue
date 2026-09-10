<script setup>
import { profile } from '../../data/profile'
</script>

<template>
  <section id="about" class="section">
    <h2 class="section-title">关于我 <span class="section-en">About</span></h2>
    <div class="section-card card" v-reveal>
      <p v-for="(para, i) in profile.bio" :key="i" class="about-para">{{ para }}</p>
      <div class="about-stats">
        <div v-for="(s, i) in profile.stats" :key="i" class="stat-item">
          <span class="stat-value">{{ s.value }}</span>
          <span class="stat-label">{{ s.label }}</span>
        </div>
      </div>
    </div>
  </section>
</template>