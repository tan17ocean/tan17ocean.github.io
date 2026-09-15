// ============================================================
// 统计数据管理
// - 访问 / 点赞 / 分享：localStorage 持久化（本机浏览器）
// - 评论：Giscus 使用 GitHub Discussions，评论数通过 GitHub
//   GraphQL API 拉取线上真实数据，并缓存在 localStorage
// ============================================================

const LS_VIEWS = 'tan-home-views'
const LS_LIKES = 'tan-home-likes'
const LS_SHARES = 'tan-home-shares'
const LS_COMMENTS = 'tan-home-comments'

const GITHUB_OWNER = 'tan17ocean'
const GITHUB_REPO = 'tan17ocean.github.io'
const GRAPHQL_URL = 'https://api.github.com/graphql'

// ---------- 辅助 ----------
function load(key, fallback = {}) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) || fallback
  } catch {
    return fallback
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage 不可用时静默失败
  }
}

// ---------- 获取各类统计数据 ----------
export function getViewStats() {
  return load(LS_VIEWS)
}

export function getLikeStats() {
  return load(LS_LIKES, { counts: {}, liked: [] }).counts
}

export function getShareStats() {
  return load(LS_SHARES)
}

export function getCommentStats() {
  return load(LS_COMMENTS)
}

// ---------- 拉取线上评论数（GitHub Discussions） ----------
// 返回 { [postId]: count }，成功后写入 localStorage 缓存
export async function fetchCommentStats(token) {
  if (!token) throw new Error('缺少 GitHub Token，无法读取线上评论统计')
  const result = {}
  let cursor = null
  let hasNext = true

  while (hasNext) {
    const after = cursor ? `, after: "${cursor}"` : ''
    const query = `
      query {
        repository(owner: "${GITHUB_OWNER}", name: "${GITHUB_REPO}") {
          discussions(first: 100${after}) {
            pageInfo { hasNextPage endCursor }
            nodes { title comments { totalCount } }
          }
        }
      }`
    const resp = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ query })
    })
    if (!resp.ok) {
      throw new Error(`GitHub API 请求失败（HTTP ${resp.status}）`)
    }
    const json = await resp.json()
    if (json.errors && json.errors.length) {
      throw new Error(json.errors[0].message || 'GitHub API 返回错误')
    }
    const data = json.data?.repository?.discussions
    if (!data) throw new Error('GitHub API 响应结构异常')
    for (const node of data.nodes) {
      if (node && node.title) result[node.title] = node.comments.totalCount || 0
    }
    hasNext = data.pageInfo.hasNextPage
    cursor = data.pageInfo.endCursor
  }

  save(LS_COMMENTS, result)
  return result
}

// ---------- 聚合文章统计 ----------
export function getAllPostStats(postList) {
  const views = getViewStats()
  const likes = getLikeStats()
  const shares = getShareStats()
  const comments = getCommentStats()

  return postList.map((post) => {
    const id = post.id
    return {
      id,
      title: post.title,
      category: post.category,
      series: post.series || '',
      date: post.date,
      published: post.published !== false,
      views: views[id] || 0,
      likes: likes[id] || 0,
      shares: shares[id] || 0,
      comments: comments[id] || 0,
      total: (views[id] || 0) + (likes[id] || 0) + (shares[id] || 0) + (comments[id] || 0)
    }
  })
}

// ---------- 总计 ----------
export function getTotalStats() {
  const views = getViewStats()
  const likes = getLikeStats()
  const shares = getShareStats()
  const comments = getCommentStats()

  return {
    totalViews: Object.values(views).reduce((a, b) => a + b, 0),
    totalLikes: Object.values(likes).reduce((a, b) => a + b, 0),
    totalShares: Object.values(shares).reduce((a, b) => a + b, 0),
    totalComments: Object.values(comments).reduce((a, b) => a + b, 0),
  }
}