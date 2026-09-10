<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import BlogLayout from '../components/BlogLayout.vue'
import PostCard from '../components/PostCard.vue'
import { searchPosts, sortedPosts } from '../composables/useContentStore'

const route = useRoute()

// 本页同时承担三类筛选：关键词搜索(q) / 分类(c) / 标签(t)
const mode = ref('')
const label = ref('')
const results = ref([])

watch(
  () => route.query,
  (q) => {
    const query = q || {}
    if (query.q) {
      mode.value = 'q'
      label.value = String(query.q)
      results.value = searchPosts(String(query.q))
    } else if (query.c) {
      mode.value = 'c'
      label.value = String(query.c)
      results.value = sortedPosts().filter((p) => p.category === query.c)
    } else if (query.t) {
      mode.value = 't'
      label.value = String(query.t)
      results.value = sortedPosts().filter((p) => p.tags.includes(query.t))
    } else {
      mode.value = ''
      label.value = ''
      results.value = []
    }
  },
  { immediate: true }
)
</script>

<template>
  <BlogLayout>
    <header class="blog-head">
      <h1 class="page-title">搜索</h1>
      <p class="page-desc">在站内检索标题、正文、标签与分类。</p>
    </header>

    <template v-if="mode">
      <p class="result-summary">
        <template v-if="mode === 'q'">关键词「{{ label }}」共 {{ results.length }} 篇相关文章</template>
        <template v-else-if="mode === 'c'">分类「{{ label }}」共 {{ results.length }} 篇文章</template>
        <template v-else>标签「{{ label }}」共 {{ results.length }} 篇文章</template>
      </p>

      <div v-if="results.length" class="blog-post-list">
        <PostCard v-for="post in results" :key="post.id" :post="post" />
      </div>
      <p v-else class="no-result">
        没有找到相关内容，换个关键词试试，或
        <router-link to="/posts">返回博客列表</router-link>。
      </p>
    </template>

    <div v-else class="search-empty">
      <p>在右上角搜索框输入关键词，例如「Vue」「读书」「Git」。</p>
    </div>
  </BlogLayout>
</template>