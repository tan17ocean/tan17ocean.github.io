// ---------- 通用工具函数 ----------

// '2026-09-01' -> '2026 年 9 月 1 日'
export function formatDateCN(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${y} 年 ${Number(m)} 月 ${Number(d)} 日`
}

// 按中文字数估算阅读时长（约 300 字/分钟），最少 1 分钟
export function readingTime(contentArr) {
  const total = contentArr.reduce((n, s) => n + s.length, 0)
  return Math.max(1, Math.round(total / 300))
}

// 将文章 content 段落数组解析为渲染块：
//  '## ' 开头 => h2 小标题；'- ' 开头 => 列表项（连续合并为一个 ul）
//  '> '  开头 => 引用块；其余 => 普通段落
export function parseBlocks(contentArr) {
  const blocks = []
  let listBuffer = null
  const flushList = () => {
    if (listBuffer) {
      blocks.push({ type: 'list', items: listBuffer })
      listBuffer = null
    }
  }
  for (const line of contentArr) {
    if (line.startsWith('## ')) {
      flushList()
      blocks.push({ type: 'h2', text: line.slice(3) })
    } else if (line.startsWith('- ')) {
      listBuffer = listBuffer || []
      listBuffer.push(line.slice(2))
    } else if (line.startsWith('> ')) {
      flushList()
      blocks.push({ type: 'quote', text: line.slice(2) })
    } else {
      flushList()
      blocks.push({ type: 'p', text: line })
    }
  }
  flushList()
  return blocks
}