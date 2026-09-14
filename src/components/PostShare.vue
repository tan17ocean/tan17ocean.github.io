<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  id: { type: String, required: true }
})

const copied = ref(false)

const shareUrl = computed(() => {
  return typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}#/post/${props.id}`
    : `#/post/${props.id}`
})

async function copyLink() {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    // fallback
    const ta = document.createElement('textarea')
    ta.value = shareUrl.value
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  }
}

function shareTwitter() {
  const url = encodeURIComponent(shareUrl.value)
  const text = encodeURIComponent(props.title)
  window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'noopener,noreferrer')
}

function shareWeibo() {
  const url = encodeURIComponent(shareUrl.value)
  const text = encodeURIComponent(props.title)
  window.open(`https://service.weibo.com/share/share.php?url=${url}&title=${text}`, '_blank', 'noopener,noreferrer')
}

function shareWechat() {
  const url = encodeURIComponent(shareUrl.value)
  window.open(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${url}`, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <div class="post-share">
    <span class="share-label">分享文章</span>
    <div class="share-actions">
      <button class="share-btn share-copy" type="button" @click="copyLink">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        <span>{{ copied ? '已复制' : '复制链接' }}</span>
      </button>
      <button class="share-btn share-twitter" type="button" @click="shareTwitter">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        <span>Twitter</span>
      </button>
      <button class="share-btn share-weibo" type="button" @click="shareWeibo">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9.82 13.87c-.36.81-1.33 1.17-2.13.8-.78-.36-1.06-1.24-.69-2.04.36-.79 1.31-1.15 2.1-.8.8.37 1.08 1.24.72 2.04zm1.31 1.85c-.13.28-.48.41-.77.28-.29-.12-.43-.44-.3-.72.13-.28.47-.4.76-.28.29.12.43.44.31.72zm-.46-6.14c-2.52-.57-5.35.6-6.54 2.75-1.26 2.28-.52 4.88 1.72 5.8 2.36.97 5.55-.08 6.88-2.33 1.27-2.14.55-4.63-1.67-5.62-.13-.06-.27-.1-.39-.16v-.44z"/></svg>
        <span>微博</span>
      </button>
      <button class="share-btn share-wechat" type="button" @click="shareWechat">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8.69 14.2c-.29 0-.58-.03-.85-.08-2.38-.4-4.2-2.2-4.2-4.5 0-2.6 2.3-4.7 5.2-4.7 2.8 0 5.1 2.1 5.1 4.7 0 2.6-2.3 4.7-5.1 4.7-.25 0-.49-.02-.73-.06l-1.53.86.42-1.07zm9.3 3.3c-.26 0-.51-.02-.75-.06l-1.43.8.39-.99c-2.22-.37-3.92-2.05-3.92-4.2 0-2.33 2.06-4.22 4.6-4.22 2.54 0 4.6 1.9 4.6 4.22 0 2.33-2.06 4.22-4.6 4.22z"/></svg>
        <span>微信</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.post-share {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}
.share-label {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 500;
}
.share-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.share-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-weight: 500;
  transition: all 0.15s ease;
  cursor: pointer;
}
.share-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-soft);
}
.share-btn svg {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}
</style>
