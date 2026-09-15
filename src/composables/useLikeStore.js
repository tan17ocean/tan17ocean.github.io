// ============================================================
// 点赞数据管理（localStorage 持久化）
// ============================================================
const LS_LIKES = 'tan-home-likes'

function loadLikes() {
  try {
    const raw = localStorage.getItem(LS_LIKES)
    if (!raw) return { counts: {}, liked: [] }
    const data = JSON.parse(raw)
    return { counts: data.counts || {}, liked: data.liked || [] }
  } catch {
    return { counts: {}, liked: [] }
  }
}

function saveLikes(data) {
  try {
    localStorage.setItem(LS_LIKES, JSON.stringify(data))
  } catch {
    /* ignore */
  }
}

export function getLikeCount(postId) {
  return loadLikes().counts[postId] || 0
}

export function isLiked(postId) {
  return loadLikes().liked.includes(postId)
}

export function toggleLike(postId) {
  const data = loadLikes()
  const idx = data.liked.indexOf(postId)
  let count = data.counts[postId] || 0

  if (idx > -1) {
    data.liked.splice(idx, 1)
    count = Math.max(0, count - 1)
  } else {
    data.liked.push(postId)
    count += 1
  }

  data.counts[postId] = count
  saveLikes(data)
  return { liked: idx === -1, count }
}

// 供后台统计页读取全部文章的点赞数
export function getAllLikeStats() {
  return loadLikes().counts
}