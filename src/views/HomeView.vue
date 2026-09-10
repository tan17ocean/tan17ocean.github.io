<script setup>
import HeroSection from '../components/home/HeroSection.vue'
import AboutSection from '../components/home/AboutSection.vue'
import SkillsSection from '../components/home/SkillsSection.vue'
import ProjectsSection from '../components/home/ProjectsSection.vue'
import TimelineSection from '../components/home/TimelineSection.vue'
import ContactSection from '../components/home/ContactSection.vue'
import SideBar from '../components/SideBar.vue'
</script>

<template>
  <div class="page-home">
    <HeroSection />
    <div class="home-body">
      <div class="home-content">
        <AboutSection />
        <SkillsSection />
        <ProjectsSection />
        <TimelineSection />
        <ContactSection />
      </div>
      <SideBar />
    </div>
  </div>
</template>