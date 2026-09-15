// ============================================================
// 内容数据 Store（响应式 + 远程优先 + 本地回退）
// ------------------------------------------------------------
// 全站统一从这里读取 profile / posts，数据来源优先级：
//   1) 远程 content.json（后台发布到 gh-pages 分支，全站可见）
//   2) 本地 localStorage 缓存（离线或远程不可用时的回退）
//   3) src/data 内置默认数据（兜底）
//
// 访客停留页面时轻量轮询远程 content.json，一旦有更新
// （updatedAt 变化）即全站响应式刷新，无需手动刷新页面。
// ============================================================
import { reactive } from 'vue'
import { profile as defaultProfile } from '../data/profile'
import { posts as defaultPosts } from '../data/posts'

const LS_PROFILE = 'tan-home-profile'
const LS_POSTS = 'tan-home-posts'
const DATA_URL = './content.json'
const POLL_INTERVAL = 60000 // 访客轮询间隔

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
  posts: load(LS_POSTS, defaultPosts),
  remoteUpdatedAt: '',
  remoteReady: false
})

// 已发布文章（前台只展示这些）
function publishedPosts() {
  return store.posts.filter((p) => p.published !== false)
}

// 草稿文章（仅后台可见）
function draftPosts() {
  return store.posts.filter((p) => p.published === false)
}

// ---------- 本地持久化（作为离线缓存） ----------

export function persistProfile() {
  try {
    localStorage.setItem(LS_PROFILE, JSON.stringify(store.profile))
  } catch {
    /* 隐私模式等场景下忽略 */
  }
}

export function persistPosts() {
  try {
    localStorage.setItem(LS_POSTS, JSON.stringify(store.posts))
  } catch {
    /* ignore */
  }
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

// ---------- 远程数据 ----------

async function fetchRemote() {
  const res = await fetch(`${DATA_URL}?v=${Date.now()}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`remote ${res.status}`)
  return res.json()
}

function applyPayload(payload) {
  if (!payload || typeof payload !== 'object') throw new Error('bad payload')
  if (!payload.profile || typeof payload.profile !== 'object') throw new Error('bad profile')
  if (!Array.isArray(payload.posts)) throw new Error('bad posts')
  store.profile = payload.profile
  store.posts = payload.posts
  store.remoteUpdatedAt = payload.updatedAt || ''
  store.remoteReady = true
  persistProfile()
  persistPosts()
}

/**
 * 加载远程内容（页面启动时调用一次）。
 * 成功返回 true；失败（网络/格式）返回 false，保持现有本地/默认数据。
 */
export async function loadRemote() {
  try {
    const payload = await fetchRemote()
    applyPayload(payload)
    return true
  } catch {
    return false
  }
}

// ---------- 访客轮询（后台编辑时暂停，避免打断） ----------

let pollTimer = null

export function startPolling() {
  stopPolling()
  pollTimer = setInterval(async () => {
    // 管理后台编辑场景不轮询，避免中途覆盖
    try {
      if (location.hash.startsWith('#/admin')) return
    } catch {
      /* ignore */
    }
    try {
      const payload = await fetchRemote()
      if (!payload || typeof payload !== 'object') return
      if (!payload.updatedAt || payload.updatedAt === store.remoteUpdatedAt) return
      applyPayload(payload)
    } catch {
      /* 网络抖动忽略，下一轮再试 */
    }
  }, POLL_INTERVAL)
}

export function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

// ---------- 派生数据（基于已发布文章动态计算，前台专用） ----------

export const allCategories = [...new Set(publishedPosts().map((p) => p.category))].sort()

export const allTags = [...new Set(publishedPosts().flatMap((p) => p.tags))].sort()

// 获取所有系列名称（去重排序）
export function allSeries() {
  return [...new Set(publishedPosts().map((p) => p.series).filter(Boolean))].sort()
}

// 获取某系列下的已发布文章，按 seriesOrder 排序
export function getSeriesPosts(seriesName) {
  if (!seriesName) return []
  return publishedPosts()
    .filter((p) => p.series === seriesName)
    .sort((a, b) => (a.seriesOrder || 0) - (b.seriesOrder || 0))
}

// 按置顶优先 + 日期倒序返回已发布文章列表（前台专用）
export function sortedPosts() {
  return [...publishedPosts()].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return a.date < b.date ? 1 : -1
  })
}

// 按分类统计已发布文章数
export function categoryCounts() {
  const map = {}
  publishedPosts().forEach((p) => {
    map[p.category] = (map[p.category] || 0) + 1
  })
  return map
}

// 按标签统计已发布文章数
export function tagCounts() {
  const map = {}
  publishedPosts().forEach((p) => {
    p.tags.forEach((t) => {
      map[t] = (map[t] || 0) + 1
    })
  })
  return map
}

// 按「年份 -> 月份 -> 文章」分组，用于归档页（只含已发布）
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

// 全文搜索：只搜索已发布文章
export function searchPosts(keyword) {
  const kw = (keyword || '').trim().toLowerCase()
  if (!kw) return []
  return sortedPosts().filter((p) => {
    const body = Array.isArray(p.content) ? p.content : [p.content || '']
    const haystack = [p.title, p.summary, p.category, ...p.tags, ...body]
      .join('\n')
      .toLowerCase()
    return haystack.includes(kw)
  })
}