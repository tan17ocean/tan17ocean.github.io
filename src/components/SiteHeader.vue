<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { profile } from '../data/profile'
import { useTheme } from '../composables/useTheme'

const router = useRouter()
const route = useRoute()
const { theme, toggleTheme } = useTheme()

const keyword = ref('')
const menuOpen = ref(false)

// 锚点导航（首页区块）；路由项（博客区页面）
const anchorItems = [
  { label: '关于', anchor: 'about' },
  { label: '技能', anchor: 'skills' },
  { label: '项目', anchor: 'projects' }
]
const routeItems = [
  { label: '博客', to: '/posts' },
  { label: '标签', to: '/tags' },
  { label: '归档', to: '/archives' }
]

function isRouteActive(to) {
  return route.path === to
}

async function goAnchor(anchor) {
  menuOpen.value = false
  if (route.path !== '/') {
    await router.push('/')
  }
  requestAnimationFrame(() => {
    const el = document.getElementById(anchor)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function onSearch() {
  const q = keyword.value.trim()
  menuOpen.value = false
  router.push({ path: '/search', query: q ? { q } : {} })
}

function closeMenu() {
  menuOpen.value = false
}
</script>

<template>
  <header class="site-header">
    <div class="header-inner">
      <router-link to="/" class="brand" @click="closeMenu">
        <span class="brand-dot"></span>
        <span class="brand-title">{{ profile.name }}</span>
      </router-link>

      <nav class="site-nav" :class="{ open: menuOpen }">
        <div class="nav-group">
          <button
            v-for="item in anchorItems"
            :key="item.anchor"
            type="button"
            class="nav-link nav-anchor"
            @click="goAnchor(item.anchor)"
          >
            {{ item.label }}
          </button>
          <router-link
            v-for="item in routeItems"
            :key="item.to"
            :to="item.to"
            class="nav-link"
            :class="{ active: isRouteActive(item.to) }"
            @click="closeMenu"
          >
            {{ item.label }}
          </router-link>
        </div>
        <form class="nav-search" @submit.prevent="onSearch">
          <input v-model="keyword" type="search" placeholder="搜索文章…" aria-label="搜索文章" />
          <button type="submit" class="icon-btn" aria-label="提交搜索">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </form>
      </nav>

      <div class="header-actions">
        <form class="desktop-search" @submit.prevent="onSearch">
          <input v-model="keyword" type="search" placeholder="搜索文章…" aria-label="搜索文章" />
          <button type="submit" class="icon-btn" aria-label="提交搜索">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </form>

        <button
          class="icon-btn theme-toggle"
          :aria-label="theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'"
          @click="toggleTheme"
        >
          <svg
            v-if="theme === 'dark'"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          >
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
          <svg
            v-else
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>

        <button
          class="icon-btn menu-toggle"
          :aria-label="menuOpen ? '关闭菜单' : '打开菜单'"
          @click="menuOpen = !menuOpen"
        >
          <svg v-if="!menuOpen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>