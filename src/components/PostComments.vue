<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  postId: { type: String, required: true }
})

const giscusFrame = ref(null)
const theme = ref('light')

function getTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
}

function updateGiscusTheme() {
  const t = getTheme()
  theme.value = t
  if (!giscusFrame.value) return
  const iframe = giscusFrame.value.querySelector('iframe.giscus-frame')
  if (!iframe || !iframe.contentWindow) return
  iframe.contentWindow.postMessage({ giscus: { setConfig: { theme: t } } }, 'https://giscus.app')
}

function loadGiscus() {
  const container = giscusFrame.value
  if (!container) return
  container.innerHTML = ''

  const script = document.createElement('script')
  script.src = 'https://giscus.app/client.js'
  script.setAttribute('data-repo', 'tan17ocean/tan17ocean.github.io')
  script.setAttribute('data-repo-id', 'R_kgDONn2v-w')
  script.setAttribute('data-category', 'Announcements')
  script.setAttribute('data-category-id', 'DIC_kwDONn2v-84CmVg1')
  script.setAttribute('data-mapping', 'specific')
  script.setAttribute('data-term', props.postId)
  script.setAttribute('data-strict', '0')
  script.setAttribute('data-reactions-enabled', '1')
  script.setAttribute('data-emit-metadata', '0')
  script.setAttribute('data-input-position', 'bottom')
  script.setAttribute('data-theme', getTheme())
  script.setAttribute('data-lang', 'zh-CN')
  script.setAttribute('data-loading', 'lazy')
  script.crossOrigin = 'anonymous'
  script.async = true

  container.appendChild(script)
}

let observer = null

onMounted(() => {
  loadGiscus()
  observer = new MutationObserver(() => updateGiscusTheme())
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})

watch(() => props.postId, () => {
  loadGiscus()
})
</script>

<template>
  <div class="post-comments">
    <h3 class="comments-title">留言评论</h3>
    <div ref="giscusFrame" class="giscus"></div>
  </div>
</template>

<style scoped>
.post-comments {
  margin-top: 40px;
  padding-top: 28px;
  border-top: 1px solid var(--border);
}
.comments-title {
  margin: 0 0 18px;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text);
}
.giscus {
  min-height: 200px;
}
</style>
