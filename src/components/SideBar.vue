<script setup>
import { computed, inject } from 'vue'
import { store } from '../composables/useContentStore'
import { sortedPosts, tagCounts } from '../composables/useContentStore'
import PostToc from './PostToc.vue'

const postToc = inject('postToc', null)

const recentPosts = computed(() => sortedPosts().slice(0, 5))
const tags = computed(() => {
  const counts = tagCounts()
  return Object.keys(counts)
    .sort()
    .slice(0, 12)
})

// 社交链接（有值才渲染）
const socials = computed(() => {
  const list = []
  if (store.profile.contact.github) list.push({ key: 'github', label: 'GitHub', href: store.profile.contact.github })
  if (store.profile.contact.juejin) list.push({ key: 'juejin', label: '掘金', href: store.profile.contact.juejin })
  if (store.profile.contact.twitter) list.push({ key: 'twitter', label: 'Twitter', href: store.profile.contact.twitter })
  if (store.profile.contact.email) list.push({ key: 'email', label: '邮箱', href: `mailto:${store.profile.contact.email}` })
  return list
})
</script>

<template>
  <aside class="sidebar">
    <!-- 头像卡 -->
    <section class="widget widget-avatar">
      <div class="avatar-wrap">
        <div v-if="store.profile.avatar" class="avatar-img">
          <img :src="store.profile.avatar" :alt="store.profile.name" />
        </div>
        <div v-else class="avatar-img avatar-fallback" aria-hidden="true">
          {{ store.profile.name.charAt(0).toUpperCase() }}
        </div>
      </div>
      <h3 class="widget-avatar-name">{{ store.profile.name }}</h3>
      <p class="widget-avatar-tagline">{{ store.profile.tagline }}</p>
      <div v-if="socials.length" class="widget-socials">
        <a
          v-for="s in socials"
          :key="s.key"
          :href="s.href"
          :title="s.label"
          class="social-link"
          target="_blank"
          rel="noopener"
        >
          {{ s.label }}
        </a>
      </div>
    </section>

    <!-- 公告卡 -->
    <section class="widget">
      <h4 class="widget-title">公告</h4>
      <p class="widget-notice">{{ store.profile.notice }}</p>
    </section>

    <!-- 目录（仅在文章详情页显示）-->
    <section v-if="postToc && postToc.length" class="widget widget-toc">
      <h4 class="widget-title">目录</h4>
      <PostToc :toc="postToc" />
    </section>

    <!-- 近期文章 -->
    <section class="widget">
      <h4 class="widget-title">近期文章</h4>
      <ul class="widget-recent">
        <li v-for="p in recentPosts" :key="p.id">
          <router-link :to="`/post/${p.id}`" class="recent-link">{{ p.title }}</router-link>
          <span class="recent-date">{{ p.date }}</span>
        </li>
      </ul>
    </section>

    <!-- RSS 订阅 -->
    <section class="widget">
      <h4 class="widget-title">RSS 订阅</h4>
      <div style="padding: 0 20px 20px;">
        <a href="/feed.xml" target="_blank" rel="noopener noreferrer" class="rss-link">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="vertical-align:middle;margin-right:6px;">
            <path d="M4 4a2 2 0 012 2v.093a2 2 0 01-2 2A2 2 0 014 4z"/>
            <path d="M4 8c7.732 0 14 6.268 14 14h-4c0-5.523-4.477-10-10-10H4z"/>
            <path d="M4 14c4.418 0 8 3.582 8 8H8c0-2.21-1.79-4-4-4v-4z"/>
          </svg>
          订阅本站更新
        </a>
      </div>
    </section>

    <!-- 标签云 -->
    <section class="widget">
      <h4 class="widget-title">标签</h4>
      <div class="widget-tags">
        <router-link
          v-for="t in tags"
          :key="t"
          :to="{ path: '/search', query: { t } }"
          class="widget-tag"
        >
          {{ t }}
        </router-link>
      </div>
    </section>
  </aside>
</template>

<style scoped>
.rss-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  border-radius: 10px;
  background: var(--primary-soft);
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: background 0.15s ease, color 0.15s ease;
}
.rss-link:hover {
  background: var(--primary);
  color: #fff;
}
.rss-link svg {
  flex-shrink: 0;
}
</style>