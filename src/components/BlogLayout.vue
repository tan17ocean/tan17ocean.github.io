<script setup>
import SideBar from './SideBar.vue'
</script>

<template>
  <div class="page page-blog">
    <div class="blog-layout">
      <div class="blog-content">
        <slot />
      </div>
      <SideBar />
    </div>
  </div>
</template>