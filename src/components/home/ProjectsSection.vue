<script setup>
import { store } from '../../composables/useContentStore'
</script>

<template>
  <section id="projects" class="section">
    <h2 class="section-title">项目 <span class="section-en">Projects</span></h2>
    <div class="projects-grid">
      <div
        v-for="(p, i) in store.profile.projects"
        :key="p.name"
        class="project-card card"
        v-reveal="i * 80"
      >
        <h3 class="project-name">
          <a v-if="p.link" :href="p.link" target="_blank" rel="noopener">{{ p.name }}</a>
          <template v-else>{{ p.name }}</template>
        </h3>
        <p class="project-desc">{{ p.desc }}</p>
        <div class="project-tags">
          <span v-for="t in p.tags" :key="t" class="project-tag">{{ t }}</span>
        </div>
      </div>
    </div>
  </section>
</template>