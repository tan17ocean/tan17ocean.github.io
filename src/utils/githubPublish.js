// ============================================================
// GitHub 发布模块（Contents API）
// ------------------------------------------------------------
// 后台「保存并发布」时，把站点内容写成 content.json 提交到
// gh-pages 分支，GitHub Pages 自动重新部署后全站访客可见。
//
// 安全边界：
//   - GitHub 令牌由用户在后台「发布设置」填写，仅存本机浏览器
//     localStorage（key: tan-home-gh-token），不进入代码/日志。
//   - 令牌需要仓库的 Contents 读写权限（fine-grained token）。
// ============================================================

const REPO = 'tan17ocean/tan17ocean.github.io'
const BRANCH = 'gh-pages'
const PATH = 'content.json'
const LS_TOKEN = 'tan-home-gh-token'
const API = 'https://api.github.com'

// ---------- 令牌管理（localStorage） ----------

export function getGhToken() {
  try {
    return (localStorage.getItem(LS_TOKEN) || '').trim()
  } catch {
    return ''
  }
}

export function setGhToken(token) {
  localStorage.setItem(LS_TOKEN, (token || '').trim())
}

export function clearGhToken() {
  localStorage.removeItem(LS_TOKEN)
}

// 只返回尾号，用于界面识别当前已配置令牌，不暴露完整令牌
export function tokenTail() {
  const t = getGhToken()
  return t ? `••••${t.slice(-4)}` : ''
}

// ---------- GitHub API ----------

async function ghFetch(pathname, options = {}) {
  const token = getGhToken()
  const res = await fetch(`${API}${pathname}`, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  })
  return res
}

// 读取线上 content.json 的当前 sha（不存在返回 null）
async function getCurrentSha() {
  const res = await ghFetch(`/repos/${REPO}/contents/${PATH}?ref=${BRANCH}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`读取线上内容失败（HTTP ${res.status}）`)
  const data = await res.json()
  return data.sha || null
}

// 把 UTF-8 字符串编码为 base64（GitHub contents API 要求）
function toBase64(str) {
  const bytes = new TextEncoder().encode(str)
  let bin = ''
  bytes.forEach((b) => {
    bin += String.fromCharCode(b)
  })
  return btoa(bin)
}

/**
 * 发布内容：将 profile + posts 写入 gh-pages 分支的 content.json。
 * 成功返回 GitHub API 返回的对象；失败抛出带可读信息的 Error。
 */
export async function publishContent(profile, posts) {
  const token = getGhToken()
  if (!token) {
    throw new Error('尚未配置 GitHub 令牌，请先在「发布设置」中填写')
  }

  const payload = {
    version: 1,
    updatedAt: new Date().toISOString(),
    profile,
    posts
  }

  const body = {
    message: `content: 更新站点内容 ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`,
    content: toBase64(JSON.stringify(payload, null, 2)),
    branch: BRANCH
  }

  // 线上文件已存在时必须带上 sha，否则 API 拒绝覆盖
  const sha = await getCurrentSha()
  if (sha) body.sha = sha

  const res = await ghFetch(`/repos/${REPO}/contents/${PATH}`, {
    method: 'PUT',
    body: JSON.stringify(body)
  })

  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    const raw = json.message || `发布失败（HTTP ${res.status}）`
    if (res.status === 401 || (json.message || '').includes('Bad credentials')) {
      throw new Error('GitHub 令牌无效或已过期，请到「发布设置」更新令牌')
    }
    if (res.status === 403 && (json.message || '').includes('rate limit')) {
      throw new Error('GitHub API 速率受限，请稍后再试')
    }
    if (res.status === 422) {
      throw new Error('提交被拒绝：线上内容可能刚被改动，请刷新页面后重试')
    }
    throw new Error(raw)
  }
  return json
}

// 校验令牌是否可用（GET 用户信息），返回 true / false
export async function verifyToken() {
  const token = getGhToken()
  if (!token) return false
  const res = await ghFetch('/user')
  return res.ok
}