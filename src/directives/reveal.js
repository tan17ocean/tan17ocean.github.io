// v-reveal 指令：元素进入视口时添加 .visible 类触发渐入动画
export default {
  mounted(el, binding) {
    el.classList.add('reveal')
    // 支持指令值设置延迟（毫秒）
    if (binding.value) el.style.transitionDelay = `${binding.value}ms`
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('visible')
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('visible')
            observer.unobserve(el)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    observer.observe(el)
    el._revealObserver = observer
  },
  unmounted(el) {
    if (el._revealObserver) el._revealObserver.disconnect()
  }
}