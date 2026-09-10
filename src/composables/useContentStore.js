// ============================================================
// 内容数据 Store（响应式 + localStorage 持久化）
// ------------------------------------------------------------
// 全站统一从这里读取 profile / posts：
//   - 首次访问：使用 src/data 下的默认数据
//   - 管理后台保存后：写入 localStorage，刷新后仍生效
//   - 恢复默认：清空 localStorage 并重置为默认数据
// ============================================================
import { reactive } from 'vue'
import { profile as defaultProfile } from '../data/profile'
import { posts as defaultPosts } from '../data/posts'

const LS_PROFILE = 'tan-home-profile'
const LS_POSTS = 'tan-home-posts'

function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return clone(fallback)
    const parsed = JSON.parse(raw)
    if (parsed === null || typeof parsed !== 'object') return clone(fallback)
    return parsed
  } catch {
    return clone(fallback)
  }
}

export const store = reactive({
  profile: load(LS_PROFILE, defaultProfile),
  posts: load(LS_POSTS, defaultPosts)
})

// ---------- 持久化 ----------

export function persistProfile() {
  localStorage.setItem(LS_PROFILE, JSON.stringify(store.profile))
}

export function persistPosts() {
  localStorage.setItem(LS_POSTS, JSON.stringify(store.posts))
}

// 恢复默认数据（清空本地覆盖）
export function resetContent() {
  localStorage.removeItem(LS_PROFILE)
  localStorage.removeItem(LS_POSTS)
  store.profile = clone(defaultProfile)
  store.posts = clone(defaultPosts)
}

// 整体导入（校验结构后覆盖）
export function importContent(data) {
  if (!data || typeof data !== 'object') throw new Error('导入内容不是有效的对象')
  if (data.profile && typeof data.profile === 'object') {
    store.profile = data.profile
    persistProfile()
  }
  if (Array.isArray(data.posts)) {
    store.posts = data.posts
    persistPosts()
  }
}

// 整体导出
export function exportContent() {
  return JSON.stringify({ profile: store.profile, posts: store.posts }, null, 2)
}

// ---------- 派生数据（基于 store.posts 动态计算） ----------

export const allCategories = [...new Set(store.posts.map((p) => p.category))].sort()

export const allTags = [...new Set(store.posts.flatMap((p) => p.tags))].sort()

// 按日期倒序返回文章列表（不改动原数组）
export function sortedPosts() {
  return [...store.posts].sort((a, b) => (a.date < b.date ? 1 : -1))
}

// 按分类统计文章数
export function categoryCounts() {
  const map = {}
  store.posts.forEach((p) => {
    map[p.category] = (map[p.category] || 0) + 1
  })
  return map
}

// 按标签统计文章数
export function tagCounts() {
  const map = {}
  store.posts.forEach((p) => {
    p.tags.forEach((t) => {
      map[t] = (map[t] || 0) + 1
    })
  })
  return map
}

// 按「年份 -> 月份 -> 文章」分组，用于归档页
export function postsByYearMonth() {
  const groups = sortedPosts().reduce((acc, p) => {
    const [year, month] = p.date.split('-')
    acc[year] = acc[year] || {}
    acc[year][month] = acc[year][month] || []
    acc[year][month].push(p)
    return acc
  }, {})
  return groups
}

// 全文搜索：匹配标题 / 摘要 / 正文 / 标签 / 分类（忽略大小写）
export function searchPosts(keyword) {
  const kw = (keyword || '').trim().toLowerCase()
  if (!kw) return []
  return sortedPosts().filter((p) => {
    const haystack = [p.title, p.summary, p.category, ...p.tags, ...p.content]
      .join('\n')
      .toLowerCase()
    return haystack.includes(kw)
  })
}