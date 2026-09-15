import { ref, watch } from 'vue'

const defaultTitle = 'tan17ocean · 个人主页'
const defaultDesc = 'tan17ocean 的个人主页：技术、阅读与生活。'
const siteUrl = 'https://tan17ocean.github.io'

export function usePageMeta() {
  const title = ref(defaultTitle)
  const description = ref(defaultDesc)
  const ogImage = ref('')

  function setMeta(opts = {}) {
    title.value = opts.title ? `${opts.title} · tan17ocean` : defaultTitle
    description.value = opts.description || defaultDesc
    ogImage.value = opts.ogImage || ''
    updateDOM()
  }

  function updateDOM() {
    // title
    document.title = title.value
    // description
    let metaDesc = document.querySelector('meta[name="description"]')
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.setAttribute('name', 'description')
      document.head.appendChild(metaDesc)
    }
    metaDesc.setAttribute('content', description.value)
    // OpenGraph
    setOgMeta('og:title', title.value)
    setOgMeta('og:description', description.value)
    setOgMeta('og:type', 'article')
    setOgMeta('og:url', window.location.href)
    setOgMeta('og:image', ogImage.value || `${siteUrl}/preview-blog.png`)
    // Twitter
    setOgMeta('twitter:card', 'summary_large_image')
    setOgMeta('twitter:title', title.value)
    setOgMeta('twitter:description', description.value)
    setOgMeta('twitter:image', ogImage.value || `${siteUrl}/preview-blog.png`)
  }

  function setOgMeta(property, content) {
    let meta = document.querySelector(`meta[property="${property}"]`)
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('property', property)
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', content)
  }

  // 路由切换时自动更新
  watch(() => window.location.href, updateDOM, { immediate: false })

  return { setMeta }
}
