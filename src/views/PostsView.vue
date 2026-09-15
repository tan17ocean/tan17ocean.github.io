<script setup>
import { ref, computed } from 'vue'
import BlogLayout from '../components/BlogLayout.vue'
import PostCard from '../components/PostCard.vue'
import { sortedPosts, categoryCounts, allSeries, getSeriesPosts } from '../composables/useContentStore'

const counts = categoryCounts()
const categories = Object.keys(counts).sort()

// 当前筛选状态：空=全部，category:xxx=按分类，series:xxx=按系列
const selectedCategory = ref('')
const selectedSeries = ref('')

const seriesList = computed(() => allSeries())

const list = computed(() => {
  if (selectedSeries.value) {
    return getSeriesPosts(selectedSeries.value)
  }
  if (selectedCategory.value) {
    return sortedPosts().filter((p) => p.category === selectedCategory.value)
  }
  return sortedPosts()
})

function selectCategory(c) {
  selectedCategory.value = c
  selectedSeries.value = ''
}

function selectSeries(s) {
  selectedSeries.value = s
  selectedCategory.value = ''
}

function selectAll() {
  selectedCategory.value = ''
  selectedSeries.value = ''
}

// 计算每个系列的文章数
const seriesCounts = computed(() => {
  const map = {}
  sortedPosts().forEach((p) => {
    if (p.series) {
      map[p.series] = (map[p.series] || 0) + 1
    }
  })
  return map
})
</script>

<template>
  <BlogLayout>
    <header class="blog-head">
      <h1 class="page-title">博客</h1>
      <p class="page-desc">技术笔记、读书思考与生活随笔。</p>
    </header>

    <!-- 分类筛选 -->
    <div class="filter-chips">
      <button class="chip" :class="{ active: !selectedCategory && !selectedSeries }" type="button" @click="selectAll">
        全部 <span class="chip-count">{{ sortedPosts().length }}</span>
      </button>
      <button
        v-for="c in categories"
        :key="c"
        class="chip"
        :class="{ active: selectedCategory === c }"
        type="button"
        @click="selectCategory(c)"
      >
        {{ c }} <span class="chip-count">{{ counts[c] }}</span>
      </button>
    </div>

    <!-- 系列筛选（仅当存在系列时显示） -->
    <div v-if="seriesList.length > 0" class="series-chips">
      <span class="series-label">📚 系列</span>
      <button
        v-for="s in seriesList"
        :key="s"
        class="chip series-chip"
        :class="{ active: selectedSeries === s }"
        type="button"
        @click="selectedSeries === s ? selectAll() : selectSeries(s)"
      >
        {{ s }} <span class="chip-count">{{ seriesCounts[s] || 0 }}</span>
      </button>
    </div>

    <div class="blog-post-list">
      <PostCard v-for="post in list" :key="post.id" :post="post" />
    </div>
  </BlogLayout>
</template>