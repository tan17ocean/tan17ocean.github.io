import router from '../router'

// 平滑滚动到首页锚点：若当前不在首页则先跳回首页再滚动
export async function scrollToAnchor(anchor) {
  if (router.currentRoute.value.path !== '/') {
    await router.push('/')
  }
  requestAnimationFrame(() => {
    const el = document.getElementById(anchor)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}