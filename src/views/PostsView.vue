<script setup>
import { ref, computed } from 'vue'
import BlogLayout from '../components/BlogLayout.vue'
import PostCard from '../components/PostCard.vue'
import { sortedPosts, categoryCounts } from '../composables/useContentStore'

const counts = categoryCounts()
const categories = Object.keys(counts).sort()
const selected = ref('')

const list = computed(() =>
  selected.value ? sortedPosts().filter((p) => p.category === selected.value) : sortedPosts()
)
</script>

<template>
  <BlogLayout>
    <header class="blog-head">
      <h1 class="page-title">博客</h1>
      <p class="page-desc">技术笔记、读书思考与生活随笔。</p>
    </header>

    <div class="filter-chips">
      <button class="chip" :class="{ active: selected === '' }" type="button" @click="selected = ''">
        全部 <span class="chip-count">{{ list.length }}</span>
      </button>
      <button
        v-for="c in categories"
        :key="c"
        class="chip"
        :class="{ active: selected === c }"
        type="button"
        @click="selected = c"
      >
        {{ c }} <span class="chip-count">{{ counts[c] }}</span>
      </button>
    </div>

    <div class="blog-post-list">
      <PostCard v-for="post in list" :key="post.id" :post="post" />
    </div>
  </BlogLayout>
</template>