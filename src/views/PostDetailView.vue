<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BlogLayout from '../components/BlogLayout.vue'
import { store, sortedPosts } from '../composables/useContentStore'
import { formatDateCN, readingTime, mdToHtml } from '../utils/format'

const route = useRoute()

const post = computed(() => store.posts.find((p) => p.id === route.params.id))
const html = computed(() => (post.value ? mdToHtml(post.value.content) : ''))
const readMins = computed(() => (post.value ? readingTime(post.value.content) : 0))

const siblings = computed(() => {
  if (!post.value) return { prev: null, next: null }
  const list = sortedPosts()
  const idx = list.findIndex((p) => p.id === post.value.id)
  return { prev: list[idx + 1] || null, next: list[idx - 1] || null }
})
</script>

<template>
  <BlogLayout>
    <template v-if="post">
      <article class="post-detail">
        <header class="post-detail-head">
          <router-link to="/posts" class="back-link">&larr; 返回博客列表</router-link>
          <h1 class="post-detail-title">{{ post.title }}</h1>
          <div class="post-detail-meta">
            <time :datetime="post.date">{{ formatDateCN(post.date) }}</time>
            <span class="meta-sep">·</span>
            <router-link :to="{ path: '/search', query: { c: post.category } }" class="meta-category">
              {{ post.category }}
            </router-link>
            <span class="meta-sep">·</span>
            <span>约 {{ readMins }} 分钟阅读</span>
          </div>
        </header>

        <div class="post-content markdown-body" v-html="html"></div>

        <footer class="post-detail-foot">
          <div class="tag-list">
            <router-link v-for="t in post.tags" :key="t" :to="{ path: '/search', query: { t } }" class="tag-chip">
              {{ t }}
            </router-link>
          </div>

          <nav class="post-pager">
            <router-link v-if="siblings.prev" :to="`/post/${siblings.prev.id}`" class="pager-link">
              <span class="pager-label">上一篇</span>
              <span class="pager-title">{{ siblings.prev.title }}</span>
            </router-link>
            <span v-else class="pager-link pager-empty"></span>
            <router-link v-if="siblings.next" :to="`/post/${siblings.next.id}`" class="pager-link pager-next">
              <span class="pager-label">下一篇</span>
              <span class="pager-title">{{ siblings.next.title }}</span>
            </router-link>
            <span v-else class="pager-link pager-empty"></span>
          </nav>
        </footer>
      </article>
    </template>

    <section v-else class="not-found">
      <h1>文章不存在</h1>
      <p>你访问的文章已被移除或地址有误。</p>
      <router-link to="/posts" class="btn btn-primary">返回博客列表</router-link>
    </section>
  </BlogLayout>
</template>