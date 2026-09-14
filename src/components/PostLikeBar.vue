<script setup>
import { ref, computed, watch } from 'vue'
import { toggleLike, isLiked, getLikeCount } from '../composables/useLikeStore'

const props = defineProps({
  postId: { type: String, required: true },
  postTitle: { type: String, default: '' }
})

const liked = ref(isLiked(props.postId))
const count = ref(getLikeCount(props.postId))

watch(() => props.postId, (newId) => {
  liked.value = isLiked(newId)
  count.value = getLikeCount(newId)
})

function onClick() {
  const result = toggleLike(props.postId)
  liked.value = result.liked
  count.value = result.count
}
</script>

<template>
  <div class="post-like-bar">
    <button
      class="like-btn"
      :class="{ liked }"
      type="button"
      :aria-label="liked ? '取消点赞' : '点赞'"
      @click="onClick"
    >
      <svg v-if="liked" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
      <span class="like-text">{{ liked ? '已赞' : '点赞' }}</span>
    </button>
    <span v-if="count > 0" class="like-count">{{ count }}</span>
  </div>
</template>

<style scoped>
.post-like-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}
.like-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border: 1.5px solid var(--border);
  border-radius: 999px;
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
}
.like-btn:hover {
  border-color: #e43c3c;
  color: #e43c3c;
  background: rgba(228,60,60,0.06);
}
.like-btn.liked {
  border-color: #e43c3c;
  color: #e43c3c;
  background: rgba(228,60,60,0.08);
}
.like-btn svg {
  width: 18px;
  height: 18px;
}
.like-count {
  font-size: 0.88rem;
  color: var(--text-muted);
  font-weight: 500;
}
</style>
