<script setup>
import { profile } from '../../data/profile'
</script>

<template>
  <section id="timeline" class="section">
    <h2 class="section-title">经历 <span class="section-en">Timeline</span></h2>
    <div class="timeline">
      <div v-for="(item, i) in profile.timeline" :key="i" class="timeline-item" v-reveal="i * 80">
        <span class="timeline-dot" aria-hidden="true"></span>
        <div class="timeline-body card">
          <span class="timeline-date">{{ item.date }}</span>
          <h3 class="timeline-title">{{ item.title }}</h3>
          <p class="timeline-desc">{{ item.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>