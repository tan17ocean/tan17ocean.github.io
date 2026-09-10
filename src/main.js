import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import reveal from './directives/reveal'
import { loadRemote, startPolling } from './composables/useContentStore'
import './styles/main.css'
import './styles/admin.css'

const app = createApp(App)
app.directive('reveal', reveal)
app.use(router)
app.mount('#app')

// 启动远程内容加载（全站数据以线上 content.json 为准），
// 并开启轻量轮询，后台发布的新内容会自动同步到访客页面
loadRemote().then(() => {
  startPolling()
})