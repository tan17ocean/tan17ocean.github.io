// ============================================================
// 管理后台认证（纯前端演示级鉴权）
// ------------------------------------------------------------
// 说明：本项目为无后端的静态站（GitHub Pages），登录校验在前端完成，
// 密码以 SHA-256 哈希存储比对（不存明文）。该方案可拦截普通访客、
// 阻止误操作，但无法抵御「查看源码后直接修改 localStorage」的绕过，
// 如需强安全请接后端服务（详见 README「安全说明」）。
// ============================================================

// 允许登录的账号
export const ADMIN_ACCOUNT = '1515618169@qq.com'

// 密码 tjw20040709tjw 的 SHA-256 哈希（非明文）
const PASSWORD_HASH = '97564960bc9ad0f8ccca43c592793f8880f00f1b6039b69b5215a22671ec55ec'

// 会话 Key（sessionStorage：关闭标签页/浏览器后失效）
const SESSION_KEY = 'tan-home-admin-session'

// 计算字符串的 SHA-256 十六进制摘要（Web Crypto API）
export async function sha256Hex(text) {
  const data = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

// 校验账号密码
export async function verifyCredentials(account, password) {
  const acc = (account || '').trim().toLowerCase()
  if (acc !== ADMIN_ACCOUNT || !password) return false
  const hash = await sha256Hex(password)
  return hash === PASSWORD_HASH
}

// 登录：写入会话
export function setSession() {
  sessionStorage.setItem(SESSION_KEY, String(Date.now()))
}

// 退出：清除会话
export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY)
}

// 是否已登录
export function isLoggedIn() {
  return Boolean(sessionStorage.getItem(SESSION_KEY))
}