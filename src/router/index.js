import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
  { path: '/posts', name: 'posts', component: () => import('../views/PostsView.vue') },
  { path: '/post/:id', name: 'post-detail', component: () => import('../views/PostDetailView.vue') },
  { path: '/archives', name: 'archives', component: () => import('../views/ArchivesView.vue') },
  { path: '/tags', name: 'tags', component: () => import('../views/TagsView.vue') },
  { path: '/search', name: 'search', component: () => import('../views/SearchView.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  // hash 模式：部署到任意静态托管均无需服务端配置；页面内锚点滚动走 JS scrollIntoView
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router