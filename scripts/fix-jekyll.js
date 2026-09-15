// ============================================================
// 构建后修复：重命名 dist/assets 中 _ 开头的文件，避免 GitHub Pages Jekyll 丢弃
// ============================================================
import { readdir, readFile, writeFile, rename } from 'fs/promises'
import { join } from 'path'

const assetsDir = 'dist/assets'

async function fix() {
  const files = await readdir(assetsDir)
  const badFiles = files.filter(f => f.startsWith('_') && f.endsWith('.js'))
  if (badFiles.length === 0) {
    console.log('[fix-jekyll] 没有 _ 开头的 JS 文件需要修复')
    return
  }

  for (const oldName of badFiles) {
    const newName = oldName.slice(1) // 去掉开头的 _
    const oldPath = join(assetsDir, oldName)
    const newPath = join(assetsDir, newName)
    await rename(oldPath, newPath)
    console.log(`[fix-jekyll] ${oldName} -> ${newName}`)
  }

  // 替换所有 .js 文件中的引用（重命名后重新获取最新目录列表，避免读到已重命名的旧文件）
  const jsFiles = (await readdir(assetsDir)).filter(f => !f.startsWith('_') && f.endsWith('.js'))
  for (const f of jsFiles) {
    const path = join(assetsDir, f)
    let content = await readFile(path, 'utf-8')
    let changed = false
    for (const oldName of badFiles) {
      const newName = oldName.slice(1)
      if (content.includes(oldName)) {
        content = content.split(oldName).join(newName)
        changed = true
      }
    }
    if (changed) {
      await writeFile(path, content)
      console.log(`[fix-jekyll] 已更新引用: ${f}`)
    }
  }
}

fix().catch(e => {
  console.error('[fix-jekyll] 错误:', e.message)
  process.exit(1)
})
