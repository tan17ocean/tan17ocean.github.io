// ---------- 通用工具函数 ----------
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import cpp from 'highlight.js/lib/languages/cpp'
import c from 'highlight.js/lib/languages/c'
import css from 'highlight.js/lib/languages/css'
import xml from 'highlight.js/lib/languages/xml'
import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'
import markdown from 'highlight.js/lib/languages/markdown'
import sql from 'highlight.js/lib/languages/sql'
import yaml from 'highlight.js/lib/languages/yaml'
import go from 'highlight.js/lib/languages/go'
import rust from 'highlight.js/lib/languages/rust'
import php from 'highlight.js/lib/languages/php'
import ruby from 'highlight.js/lib/languages/ruby'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('py', python)
hljs.registerLanguage('java', java)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('c++', cpp)
hljs.registerLanguage('c', c)
hljs.registerLanguage('css', css)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('shell', bash)
hljs.registerLanguage('sh', bash)
hljs.registerLanguage('json', json)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('md', markdown)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('yml', yaml)
hljs.registerLanguage('go', go)
hljs.registerLanguage('rust', rust)
hljs.registerLanguage('php', php)
hljs.registerLanguage('ruby', ruby)
hljs.registerLanguage('rb', ruby)

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
// - 给 h1/h2/h3 注入锚点 id，支持 TOC 跳转
// - 代码块经 highlight.js 语法高亮
// - 经 DOMPurify 清洗，防止原始 HTML 注入
export function mdToHtml(md) {
  const renderer = new marked.Renderer()
  // marked v18+: heading renderer 接收 token 对象 { text, depth, tokens }
  renderer.heading = (token) => {
    const { text, depth: level } = token
    if (level >= 1 && level <= 3) {
      const id = text
        .toLowerCase()
        .replace(/<[^>]+>/g, '')
        .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
        .replace(/^-+|-+$/g, '')
      return `<h${level} id="${id}">${text}</h${level}>`
    }
    return `<h${level}>${text}</h${level}>`
  }
  // 代码块高亮
  renderer.code = (token) => {
    const { text, lang } = token
    const validLang = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
    const highlighted = validLang === 'plaintext'
      ? hljs.highlightAuto(text).value
      : hljs.highlight(text, { language: validLang }).value
    return `<pre><code class="hljs language-${validLang}">${highlighted}</code></pre>`
  }
  const raw = marked.parse(toMarkdownText(md), { gfm: true, breaks: false, renderer })
  return DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } })
}

// 提取 TOC（h1/h2/h3）
// 返回 [{ level: 1|2|3, text: string, id: string }]
export function extractToc(md) {
  const text = toMarkdownText(md)
  const tokens = marked.lexer(text)
  const toc = []
  tokens.forEach((token) => {
    if (token.type === 'heading' && (token.depth >= 1 && token.depth <= 3)) {
      const id = token.text
        .toLowerCase()
        .replace(/<[^>]+>/g, '')
        .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
        .replace(/^-+|-+$/g, '')
      toc.push({ level: token.depth, text: token.text, id })
    }
  })
  return toc
}
