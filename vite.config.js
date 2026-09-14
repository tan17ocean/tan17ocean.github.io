import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// base 使用相对路径，构建产物可直接部署到任意子目录
export default defineConfig({
  plugins: [vue()],
  base: './',
  build: {
    rollupOptions: {
      output: {
        // 避免 chunk 文件名以 _ 开头（GitHub Pages Jekyll 会丢弃）
        chunkFileNames: 'assets/[name]-[hash].js'
      }
    }
  },
  server: {
    port: 5174,
    host: true
  }
})