<script setup>
import { ref, computed } from 'vue'
import BlogLayout from '../components/BlogLayout.vue'
import PostCard from '../components/PostCard.vue'
import { sortedPosts, tagCounts } from '../data/posts'

const counts = tagCounts()
const tags = Object.keys(counts).sort()
const selected = ref('')

function level(count) {
  if (count >= 3) return 'lg'
  if (count === 2) return 'md'
  return 'sm'
}

const list = computed(() =>
  selected.value ? sortedPosts().filter((p) => p.tags.includes(selected.value)) : []
)
</script>

<template>
  <BlogLayout>
    <header class="blog-head">
      <h1 class="page-title">标签</h1>
      <p class="page-desc">点击标签查看相关文章。</p>
    </header>

    <div class="tag-cloud">
      <button
        v-for="t in tags"
        :key="t"
        type="button"
        class="cloud-tag"
        :class="[level(counts[t]), { active: selected === t }]"
        @click="selected = selected === t ? '' : t"
      >
        {{ t }} <span class="chip-count">{{ counts[t] }}</span>
      </button>
    </div>

    <div v-if="selected" class="blog-post-list">
      <h2 class="section-title">标签：{{ selected }}</h2>
      <PostCard v-for="post in list" :key="post.id" :post="post" />
    </div>
  </BlogLayout>
</template>