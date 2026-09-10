<script setup>
import { store } from '../../composables/useContentStore'

const groups = Object.entries(store.profile.skills)
</script>

<template>
  <section id="skills" class="section">
    <h2 class="section-title">技能 <span class="section-en">Skills</span></h2>
    <div class="skills-grid">
      <div v-for="[group, items] in groups" :key="group" class="skill-card card" v-reveal>
        <h3 class="skill-group">{{ group }}</h3>
        <div class="skill-tags">
          <span v-for="s in items" :key="s" class="skill-tag">{{ s }}</span>
        </div>
      </div>
    </div>
  </section>
</template>