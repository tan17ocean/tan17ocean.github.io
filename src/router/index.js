import { createRouter, createWebHashHistory } from 'vue-router'
import { isLoggedIn } from '../utils/auth'

const routes = [
  { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
  { path: '/posts', name: 'posts', component: () => import('../views/PostsView.vue') },
  { path: '/post/:id', name: 'post-detail', component: () => import('../views/PostDetailView.vue') },
  { path: '/archives', name: 'archives', component: () => import('../views/ArchivesView.vue') },
  { path: '/tags', name: 'tags', component: () => import('../views/TagsView.vue') },
  { path: '/search', name: 'search', component: () => import('../views/SearchView.vue') },
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/AdminView.vue'),
    meta: { requiresAuth: true }
  },
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

// 路由守卫：管理后台需登录，未登录跳登录页并记录来源
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isLoggedIn()) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  // 已登录访问登录页则直接回管理后台
  if (to.name === 'login' && isLoggedIn()) {
    return { name: 'admin' }
  }
  return true
})

export default router