<script setup>
import { computed, ref, watch, onMounted, onUnmounted, provide } from 'vue'
import { useRoute } from 'vue-router'
import BlogLayout from '../components/BlogLayout.vue'
import PostToc from '../components/PostToc.vue'
import { store, sortedPosts } from '../composables/useContentStore'
import { formatDateCN, readingTime, mdToHtml, extractToc } from '../utils/format'
import PostLikeBar from '../components/PostLikeBar.vue'
import PostShare from '../components/PostShare.vue'
import PostComments from '../components/PostComments.vue'

const route = useRoute()

const post = computed(() => store.posts.find((p) => p.id === route.params.id && p.published !== false))
const html = computed(() => (post.value ? mdToHtml(post.value.content) : ''))
const toc = computed(() => (post.value ? extractToc(post.value.content) : []))
provide('postToc', toc)
const readMins = computed(() => (post.value ? readingTime(post.value.content) : 0))
const contentEl = ref(null)

// ---------- 阅读进度条 ----------
const progress = ref(0)

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
  requestAnimationFrame(initCodeCopy)
})

onMounted(() => {
  window.addEventListener('scroll', updateProgress, { passive: true })
  requestAnimationFrame(initCodeCopy)
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
  </BlogLayout>
</template>
