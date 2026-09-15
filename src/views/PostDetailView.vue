<script setup>
import { computed, ref, watch, onMounted, onUnmounted, provide } from 'vue'
import { useRoute } from 'vue-router'
import BlogLayout from '../components/BlogLayout.vue'
import PostToc from '../components/PostToc.vue'
import { store, sortedPosts, getSeriesPosts } from '../composables/useContentStore'
import { formatDateCN, readingTime, mdToHtml, extractToc } from '../utils/format'
import PostLikeBar from '../components/PostLikeBar.vue'
import PostShare from '../components/PostShare.vue'
import PostComments from '../components/PostComments.vue'
import { usePageMeta } from '../composables/usePageMeta.js'

import ImageLightbox from '../components/ImageLightbox.vue'

// ---------- 访问统计 ----------
const LS_VIEWS = 'tan-home-views'
function recordView(postId) {
  try {
    const raw = localStorage.getItem(LS_VIEWS)
    const data = raw ? JSON.parse(raw) : {}
    data[postId] = (data[postId] || 0) + 1
    localStorage.setItem(LS_VIEWS, JSON.stringify(data))
  } catch {
    /* ignore */
  }
}

const route = useRoute()
const { setMeta } = usePageMeta()

// 记录文章访问
onMounted(() => {
  if (post.value) recordView(post.value.id)
})

const post = computed(() => store.posts.find((p) => p.id === route.params.id && p.published !== false))

// 文章页 SEO meta
watch(() => post.value, (p) => {
  if (p) {
    setMeta({
      title: p.title,
      description: p.summary || p.title,
    })
  }
}, { immediate: true })
const html = computed(() => (post.value ? mdToHtml(post.value.content) : ''))
const toc = computed(() => (post.value ? extractToc(post.value.content) : []))
provide('postToc', toc)
const readMins = computed(() => (post.value ? readingTime(post.value.content) : 0))
const contentEl = ref(null)

// ---------- 阅读进度条 ----------
const progress = ref(0)

const lightboxVisible = ref(false)
const lightboxImages = ref([])
const lightboxIndex = ref(0)

function initImageLightbox() {
  if (!contentEl.value) return
  const imgs = contentEl.value.querySelectorAll('img')
  lightboxImages.value = Array.from(imgs).map((img) => img.src)

  imgs.forEach((img, idx) => {
    // 添加懒加载
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy')
    }
    // 添加点击事件
    img.style.cursor = 'zoom-in'
    img.addEventListener('click', () => {
      lightboxIndex.value = idx
      lightboxVisible.value = true
    })
  })
}

function updateProgress() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
  progress.value = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0
}

// ---------- 代码块复制按钮 ----------
function initCodeCopy() {
  if (!contentEl.value) return
  const blocks = contentEl.value.querySelectorAll('pre')
  blocks.forEach((pre) => {
    if (pre.querySelector('.code-copy-btn')) return
    const btn = document.createElement('button')
    btn.className = 'code-copy-btn'
    btn.textContent = '复制'
    btn.type = 'button'
    btn.addEventListener('click', async () => {
      const code = pre.querySelector('code')
      const text = code ? code.textContent : pre.textContent
      try {
        await navigator.clipboard.writeText(text)
        btn.textContent = '已复制'
        btn.classList.add('copied')
        setTimeout(() => {
          btn.textContent = '复制'
          btn.classList.remove('copied')
        }, 2000)
      } catch {
        btn.textContent = '失败'
        setTimeout(() => {
          btn.textContent = '复制'
          btn.classList.remove('copied')
        }, 2000)
      }
    })
    pre.classList.add('code-block-wrapper')
    pre.appendChild(btn)
  })
}

watch(html, () => {
  requestAnimationFrame(() => {
    initCodeCopy()
    initImageLightbox()
  })
})

onMounted(() => {
  window.addEventListener('scroll', updateProgress, { passive: true })
  requestAnimationFrame(() => {
    initCodeCopy()
    initImageLightbox()
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateProgress)
})

const siblings = computed(() => {
  if (!post.value) return { prev: null, next: null }
  const list = sortedPosts()
  const idx = list.findIndex((p) => p.id === post.value.id)
  return { prev: list[idx + 1] || null, next: list[idx - 1] || null }
})

// ---------- 系列/连载 ----------
const seriesInfo = computed(() => {
  if (!post.value || !post.value.series) return null
  const seriesPosts = getSeriesPosts(post.value.series)
  const currentIdx = seriesPosts.findIndex((p) => p.id === post.value.id)
  if (currentIdx < 0) return null
  return {
    name: post.value.series,
    total: seriesPosts.length,
    current: currentIdx + 1,
    posts: seriesPosts,
    prevInSeries: seriesPosts[currentIdx - 1] || null,
    nextInSeries: seriesPosts[currentIdx + 1] || null
  }
})
</script>

<template>
  <BlogLayout>
    <template v-if="post">
      <!-- 阅读进度条 -->
      <div class="reading-progress-bar" :style="{ width: progress + '%' }"></div>
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

          <!-- 系列/连载标识 -->
          <div v-if="seriesInfo" class="post-series-badge">
            <span class="series-icon">📚</span>
            <span class="series-name">{{ seriesInfo.name }}</span>
            <span class="series-progress">第 {{ seriesInfo.current }} / {{ seriesInfo.total }} 篇</span>
          </div>
        </header>

        <div ref="contentEl" class="post-content markdown-body" v-html="html"></div>

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

          <!-- 系列导航 -->
          <nav v-if="seriesInfo" class="series-nav">
            <div class="series-nav-header">
              <span class="series-nav-icon">📖</span>
              <span class="series-nav-title">{{ seriesInfo.name }}</span>
              <span class="series-nav-count">（{{ seriesInfo.current }} / {{ seriesInfo.total }}）</span>
            </div>
            <div class="series-nav-links">
              <router-link
                v-if="seriesInfo.prevInSeries"
                :to="`/post/${seriesInfo.prevInSeries.id}`"
                class="series-link series-link-prev"
              >
                <span class="series-arrow">←</span>
                <span class="series-link-label">上一篇</span>
                <span class="series-link-title">{{ seriesInfo.prevInSeries.title }}</span>
              </router-link>
              <span v-else class="series-link series-link-disabled">
                <span class="series-arrow">←</span>
                <span>已是系列第一篇</span>
              </span>

              <router-link
                v-if="seriesInfo.nextInSeries"
                :to="`/post/${seriesInfo.nextInSeries.id}`"
                class="series-link series-link-next"
              >
                <span class="series-link-label">下一篇</span>
                <span class="series-link-title">{{ seriesInfo.nextInSeries.title }}</span>
                <span class="series-arrow">→</span>
              </router-link>
              <span v-else class="series-link series-link-disabled">
                <span>已是系列最后一篇</span>
                <span class="series-arrow">→</span>
              </span>
            </div>
          </nav>

          <!-- 点赞 & 分享 -->
          <PostLikeBar :post-id="post.id" :post-title="post.title" />
          <PostShare :title="post.title" :id="post.id" />

          <!-- Giscus 评论 -->
          <PostComments :post-id="post.id" />
        </footer>
      </article>
    </template>

    <template v-else>
      <section class="not-found">
        <h1>文章不存在</h1>
        <p>你访问的文章已被移除或地址有误。</p>
        <router-link to="/posts" class="btn btn-primary">返回博客列表</router-link>
      </section>
    </template>

    <template #side>
      <SideBar />
    </template>

    <!-- 图片 Lightbox -->
    <ImageLightbox
      v-model="lightboxVisible"
      :images="lightboxImages"
      :initial-index="lightboxIndex"
    />
  </BlogLayout>
</template>
