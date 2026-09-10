// ---------- 通用工具函数 ----------
import { marked } from 'marked'
import DOMPurify from 'dompurify'

// '2026-09-01' -> '2026 年 9 月 1 日'
export function formatDateCN(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${y} 年 ${Number(m)} 月 ${Number(d)} 日`
}

// 旧版「数组 + 简易标记」正文 -> 标准 Markdown 字符串
// 用于兼容线上 content.json 中已发布的旧数据（渲染前自动转换），
// 以及后台编辑旧文章时回填到编辑器。
// 转换规则：'## ' 标题、'> ' 引用、'- ' 列表项原样保留；
//          普通段落用空行分隔（保持「一段一个 <p>」的既有视觉效果）。
export function legacyBlocksToMarkdown(arr) {
  if (!Array.isArray(arr)) return arr
  const lines = arr.map((s) => String(s).trimEnd())
  const out = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith('## ')) {
      out.push(line)
      out.push('')
      i++
      continue
    }
    if (line.startsWith('> ') || line === '>') {
      const quote = [line.replace(/^>\s?/, '')]
      while (i + 1 < lines.length && lines[i + 1].startsWith('> ')) {
        i++
        quote.push(lines[i].replace(/^>\s?/, ''))
      }
      out.push('> ' + quote.join('\n> '))
      out.push('')
      i++
      continue
    }
    if (line.startsWith('- ')) {
      const items = [line.slice(2)]
      while (i + 1 < lines.length && lines[i + 1].startsWith('- ')) {
        i++
        items.push(lines[i].slice(2))
      }
      out.push(items.map((x) => '- ' + x).join('\n'))
      out.push('')
      i++
      continue
    }
    // 普通段落
    out.push(line)
    out.push('')
    i++
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

// 把文章正文统一为字符串（兼容新旧两种格式）
export function toMarkdownText(content) {
  if (Array.isArray(content)) return legacyBlocksToMarkdown(content)
  return String(content || '')
}

// 按中文字数估算阅读时长（约 300 字/分钟），最少 1 分钟；兼容字符串与旧数组
export function readingTime(content) {
  const md = toMarkdownText(content)
  const plain = md
    .replace(/```[\s\S]*?```/g, ' ')            // 代码块
    .replace(/`[^`\n]*`/g, ' ')                 // 行内代码
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')       // 图片
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')     // 链接（保留文字）
    .replace(/[#>*_~`\-|]/g, '')                 // 常见 Markdown 语法符号
    .replace(/\s+/g, '')
  return Math.max(1, Math.round(plain.length / 300))
}

// Markdown -> 安全 HTML
// - 开启 GFM（表格 / 删除线 / 自动链接）
// - 经 DOMPurify 清洗，防止原始 HTML 注入（站长写作内容 + 发布链路的第二道防线）
export function mdToHtml(md) {
  const raw = marked.parse(toMarkdownText(md), { gfm: true, breaks: false })
  return DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } })
}