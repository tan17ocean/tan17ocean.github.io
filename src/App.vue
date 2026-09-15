<script setup>
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
import BackToTop from './components/BackToTop.vue'
import SeasonalEffect from './components/SeasonalEffect.vue'
import CustomCursor from './components/CustomCursor.vue'
</script>

<template>
  <div class="app-shell">
    <CustomCursor />
    <SeasonalEffect />
    <SiteHeader />
    <main class="app-main">
      <router-view />
    </main>
    <SiteFooter />
    <BackToTop />
  </div>
</template>