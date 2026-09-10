// ============================================================
// 构建后生成 dist/content.json
// ------------------------------------------------------------
// 把 src/data 下的默认资料与文章序列化为线上数据文件，
// 保证部署后 content.json 已存在，首访 fetch 即可读到数据。
// ============================================================
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const { profile } = await import(pathToFileURL(resolve(root, 'src/data/profile.js')).href)
const { posts } = await import(pathToFileURL(resolve(root, 'src/data/posts.js')).href)

const payload = {
  version: 1,
  updatedAt: new Date().toISOString(),
  profile,
  posts
}

const distDir = resolve(root, 'dist')
mkdirSync(distDir, { recursive: true })
const file = resolve(distDir, 'content.json')
writeFileSync(file, JSON.stringify(payload, null, 2), 'utf-8')
console.log(`[gen-content-json] written: ${file} (profile + ${posts.length} posts)`)