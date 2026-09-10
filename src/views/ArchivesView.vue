<script setup>
import BlogLayout from '../components/BlogLayout.vue'
import { postsByYearMonth } from '../composables/useContentStore'

const groups = postsByYearMonth()
</script>

<template>
  <BlogLayout>
    <header class="blog-head">
      <h1 class="page-title">归档</h1>
      <p class="page-desc">按时间倒序浏览全部文章。</p>
    </header>

    <div class="archives">
      <div v-for="(months, year) in groups" :key="year" class="archive-year">
        <h2 class="archive-year-title">{{ year }} 年</h2>
        <div v-for="(posts, month) in months" :key="month" class="archive-month">
          <h3 class="archive-month-title">{{ Number(month) }} 月</h3>
          <ul class="archive-list">
            <li v-for="p in posts" :key="p.id" class="archive-item">
              <span class="archive-date">{{ p.date }}</span>
              <router-link :to="`/post/${p.id}`" class="archive-link">{{ p.title }}</router-link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </BlogLayout>
</template>