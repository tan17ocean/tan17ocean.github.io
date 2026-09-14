<script setup>
import { useRoute } from 'vue-router'
import BlogLayout from '../components/BlogLayout.vue'
import SideBar from '../components/SideBar.vue'

const route = useRoute()
</script>

<template>
  <BlogLayout>
    <div class="not-found-page">
      <div class="not-found-content">
        <div class="not-found-code">404</div>
        <h1 class="not-found-title">页面不存在</h1>
        <p class="not-found-desc">
          你访问的地址 <code class="not-found-url">{{ route.path }}</code> 没有对应的内容。
        </p>
        <div class="not-found-actions">
          <router-link to="/" class="btn btn-primary">返回首页</router-link>
          <router-link to="/posts" class="btn btn-outline">浏览博客</router-link>
        </div>
      </div>
    </div>
    <template #side>
      <SideBar />
    </template>
  </BlogLayout>
</template>

<style scoped>
.not-found-page {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.not-found-content {
  text-align: center;
  max-width: 480px;
}

.not-found-code {
  font-size: 6rem;
  font-weight: 800;
  line-height: 1;
  color: var(--primary, #6366f1);
  opacity: 0.6;
  margin-bottom: 1rem;
}

.not-found-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--text);
}

.not-found-desc {
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.not-found-url {
  background: var(--bg-soft, #f3f4f6);
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.9em;
  word-break: break-all;
}

[data-theme="dark"] .not-found-url {
  background: var(--bg-soft, #1f1f2e);
}

.not-found-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.6rem 1.4rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: var(--primary, #4e44ce);
  color: #fff;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-outline {
  background: transparent;
  color: var(--text);
  border: 1.5px solid var(--border, #e5e7eb);
}

.btn-outline:hover {
  border-color: var(--primary, #4e44ce);
  color: var(--primary, #4e44ce);
}
</style>