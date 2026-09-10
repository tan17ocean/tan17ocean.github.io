<script setup>
import { computed } from 'vue'
import { formatDateCN, readingTime } from '../utils/format'

const props = defineProps({
  post: { type: Object, required: true }
})

const readMins = computed(() => readingTime(props.post.content))
</script>

<template>
  <article class="post-card">
    <h2 class="post-card-title">
      <router-link :to="`/post/${post.id}`">{{ post.title }}</router-link>
    </h2>
    <div class="post-card-meta">
      <time :datetime="post.date">{{ formatDateCN(post.date) }}</time>
      <span class="meta-sep">·</span>
      <router-link :to="{ path: '/search', query: { c: post.category } }" class="meta-category">
        {{ post.category }}
      </router-link>
      <span class="meta-sep">·</span>
      <span>约 {{ readMins }} 分钟</span>
    </div>
    <p class="post-card-summary">{{ post.summary }}</p>
    <div class="post-card-foot">
      <div class="tag-list">
        <router-link v-for="t in post.tags" :key="t" :to="{ path: '/search', query: { t } }" class="tag-chip">
          {{ t }}
        </router-link>
      </div>
      <router-link class="post-card-more" :to="`/post/${post.id}`">阅读全文 &rarr;</router-link>
    </div>
  </article>
</template>