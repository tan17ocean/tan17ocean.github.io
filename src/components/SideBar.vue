<script setup>
import { computed } from 'vue'
import { store } from '../composables/useContentStore'
import { sortedPosts, tagCounts } from '../composables/useContentStore'

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