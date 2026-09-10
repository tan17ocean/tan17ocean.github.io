<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  store,
  persistProfile,
  persistPosts,
  resetContent,
  importContent,
  exportContent,
  loadRemote
} from '../composables/useContentStore'
import { clearSession } from '../utils/auth'
import { parseBlocks } from '../utils/format'
import {
  publishContent,
  getGhToken,
  setGhToken,
  clearGhToken,
  tokenTail,
  verifyToken,
  diagnosePublish
} from '../utils/githubPublish'

const router = useRouter()

// ---------- 通用 ----------
const activeTab = ref('profile')
const toast = reactive({ show: false, text: '', kind: 'ok' })
let toastTimer = null
function notify(text, kind = 'ok') {
  toast.text = text
  toast.kind = kind
  toast.show = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.show = false), 2600)
}
function confirmAction(msg) {
  return window.confirm(msg)
}

// 发布状态：false 可点击；true 表示正在提交
const publishing = ref(false)

// 保存到本地 + 发布到线上（全站访客可见）
async function publishAll(silent = false) {
  if (publishing.value) return false
  publishing.value = true
  try {
    await publishContent(JSON.parse(JSON.stringify(store.profile)), JSON.parse(JSON.stringify(store.posts)))
    recordPubResult(true, '')
    if (lastDiag.value) lastDiag.value = null
    if (!silent) notify('已发布到线上，所有访客约 1-2 分钟内可见')
    return true
  } catch (e) {
    recordPubResult(false, e.message)
    if (!silent) notify(e.message, 'err')
    else console.warn('[publish]', e)
    return false
  } finally {
    publishing.value = false
  }
}

// ---------- 发布结果与诊断 ----------
const PUBS_KEY = 'tan-home-last-pub'
const lastPub = ref(null)
const lastDiag = ref(null)
const diagnosing = ref(false)
function recordPubResult(ok, err) {
  const item = { ok, err: err || '', time: new Date().toLocaleTimeString('zh-CN', { hour12: false }) }
  lastPub.value = item
  try {
    localStorage.setItem(PUBS_KEY, JSON.stringify(item))
  } catch {
    /* ignore */
  }
}
try {
  const raw = localStorage.getItem(PUBS_KEY)
  if (raw) lastPub.value = JSON.parse(raw)
} catch {
  /* ignore */
}
async function runDiag() {
  diagnosing.value = true
  try {
    lastDiag.value = await diagnosePublish()
  } catch (e) {
    lastDiag.value = [{ name: '诊断执行失败', ok: false, detail: String(e.message || e) }]
  } finally {
    diagnosing.value = false
  }
}

// ---------- 发布设置 ----------
const tokenInput = ref('')
const tokenSaved = ref(!!getGhToken())

function saveToken() {
  const t = tokenInput.value.trim()
  if (!t) return notify('请输入 GitHub 令牌', 'err')
  setGhToken(t)
  tokenInput.value = ''
  tokenSaved.value = true
  notify('令牌已保存到本机浏览器')
}
function removeToken() {
  if (!confirmAction('确定清除已保存的 GitHub 令牌吗？之后发布操作需要重新填写。')) return
  clearGhToken()
  tokenSaved.value = false
  notify('令牌已清除')
}
async function checkToken() {
  if (!getGhToken()) return notify('尚未保存令牌', 'err')
  const ok = await verifyToken()
  notify(ok ? '令牌有效，可用发布' : '令牌无效或已过期，请重新填写', ok ? 'ok' : 'err')
}

// ---------- 资料编辑 ----------
const profileForm = ref(null)
function initProfileForm() {
  profileForm.value = JSON.parse(JSON.stringify(store.profile))
}
initProfileForm()

const skillGroups = computed(() =>
  Object.entries(profileForm.value.skills || {}).map(([key, tags]) => ({ key, tags: (tags || []).join(', ') }))
)
function setSkillGroups(list) {
  const obj = {}
  list.forEach((g) => {
    if (g.key.trim()) obj[g.key.trim()] = g.tags.split(/[,，]/).map((t) => t.trim()).filter(Boolean)
  })
  profileForm.value.skills = obj
}
const skillGroupsEdit = ref([])
function resetSkillGroupsEdit() {
  skillGroupsEdit.value = skillGroups.value.map((g) => ({ ...g }))
}
resetSkillGroupsEdit()

async function saveProfile() {
  setSkillGroups(skillGroupsEdit.value)
  // 规整：projects.tags 若是字符串则转数组；heroSubtitles 保持字符串数组
  ;(profileForm.value.projects || []).forEach((p) => {
    if (typeof p.tags === 'string') {
      p.tags = p.tags.split(/[,，]/).map((t) => t.trim()).filter(Boolean)
    }
  })
  store.profile = JSON.parse(JSON.stringify(profileForm.value))
  persistProfile()
  const ok = await publishAll()
  if (ok) store.remoteUpdatedAt = new Date().toISOString()
  if (!ok) notify('资料已保存到本机，但发布失败，请检查「发布设置」后重试', 'err')
}

// 统计 / 项目 / 时间线 的动态行操作
function addRow(field, emptyRow) {
  profileForm.value[field].push({ ...emptyRow })
}
function removeRow(field, index) {
  profileForm.value[field].splice(index, 1)
}
function addSkillGroup() {
  skillGroupsEdit.value.push({ key: '', tags: '' })
}
function removeSkillGroup(index) {
  skillGroupsEdit.value.splice(index, 1)
}

// ---------- 博客管理 ----------
const postList = computed(() =>
  [...store.posts].sort((a, b) => (a.date < b.date ? 1 : -1))
)
const editing = ref(null)
const isNew = ref(false)

function slugify(text) {
  return (text || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]/g, '')
    .replace(/-+/g, '-')
    .slice(0, 48)
}

function newPost() {
  isNew.value = true
  editing.value = {
    id: '',
    title: '',
    date: new Date().toISOString().slice(0, 10),
    category: '技术笔记',
    tags: [],
    summary: '',
    content: []
  }
  fillForm()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function editPost(p) {
  isNew.value = false
  editing.value = JSON.parse(JSON.stringify(p))
  fillForm()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelEdit() {
  editing.value = null
}

const form = reactive({
  title: '',
  id: '',
  date: '',
  category: '',
  summary: '',
  contentText: ''
})

// 正文实时预览块
const contentBlocks = computed(() => parseBlocks(form.contentText.split('\n')))

function fillForm() {
  form.title = editing.value.title
  form.id = editing.value.id
  form.date = editing.value.date
  form.category = editing.value.category
  form.summary = editing.value.summary
  form.contentText = (editing.value.content || []).join('\n')
  savedTags.value = (editing.value.tags || []).join(', ')
}

// 保存文章
const savedTags = ref('')
async function savePost() {
  const title = form.title.trim()
  if (!title) return notify('请填写文章标题', 'err')
  if (!form.date) return notify('请填写发布日期', 'err')
  if (!form.category.trim()) return notify('请填写分类', 'err')

  const rawId = form.id.trim() || slugify(title) || `post-${Date.now()}`
  const id = slugify(rawId)
  const duplicate = store.posts.find((p) => p.id === id && (!editing.value || p.id !== editing.value.id))
  if (duplicate) return notify('文章 id 重复，请更换（自动生成建议）', 'err')

  const tags = savedTags.value.split(/[,，]/).map((t) => t.trim()).filter(Boolean)
  const content = form.contentText
    .split('\n')
    .map((l) => l.trimEnd())
    .filter((l) => l.trim() !== '')

  const postData = {
    id,
    title,
    date: form.date,
    category: form.category.trim(),
    tags,
    summary: form.summary.trim(),
    content
  }

  if (isNew.value) {
    store.posts.push(postData)
    notify('文章已保存')
  } else {
    const idx = store.posts.findIndex((p) => p.id === editing.value.id)
    if (idx >= 0) store.posts.splice(idx, 1, postData)
    notify('文章已更新')
  }
  persistPosts()
  editing.value = null
  const ok = await publishAll()
  if (ok) store.remoteUpdatedAt = new Date().toISOString()
  if (!ok) notify('文章已保存到本机，但发布失败，请检查「发布设置」后重试', 'err')
}

async function deletePost(p) {
  if (!confirmAction(`确定删除文章《${p.title}》吗？此操作不可撤销。`)) return
  const idx = store.posts.findIndex((x) => x.id === p.id)
  if (idx >= 0) {
    store.posts.splice(idx, 1)
    persistPosts()
  }
  const ok = await publishAll()
  if (ok) store.remoteUpdatedAt = new Date().toISOString()
  notify(ok ? '文章已删除并发布到线上' : '文章已从本机删除，但发布失败，请检查「发布设置」后重试', 'err')
}

function toggleTagPreview(text) {
  savedTags.value = text
}

// ---------- 数据工具 ----------
function downloadExport() {
  const blob = new Blob([exportContent()], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `tan17ocean-content-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  notify('已导出 JSON 数据文件')
}

function onImportFile(e) {
  const file = e.target.files && e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result)
      importContent(data)
      initProfileForm()
      resetSkillGroupsEdit()
      notify('数据已导入，全站已生效')
    } catch {
      notify('导入失败：文件不是有效的 JSON 数据', 'err')
    }
  }
  reader.readAsText(file)
  e.target.value = ''
}

function restoreDefault() {
  if (!confirmAction('确定恢复默认数据吗？当前所有编辑内容将被清空。')) return
  resetContent()
  initProfileForm()
  resetSkillGroupsEdit()
  notify('已恢复默认数据')
}

function logout() {
  clearSession()
  router.replace('/')
}

// 进入后台时同步一次远程最新内容（线上发布过但本机缓存的旧数据会被覆盖）
loadRemote().then(() => {
  initProfileForm()
  resetSkillGroupsEdit()
})
</script>

<template>
  <div class="admin-page">
    <!-- 顶部栏 -->
    <div class="admin-topbar">
      <div class="admin-topbar-inner">
        <div class="admin-brand">
          <span class="brand-dot"></span>
          <span>管理后台</span>
        </div>
        <div class="admin-topbar-actions">
          <router-link to="/" class="admin-text-btn">返回站点</router-link>
          <button type="button" class="admin-text-btn danger" @click="logout">退出登录</button>
        </div>
      </div>
    </div>

    <div class="admin-body">
      <!-- Tab 导航 -->
      <nav class="admin-tabs">
        <button
          type="button"
          class="admin-tab"
          :class="{ active: activeTab === 'profile' }"
          @click="activeTab = 'profile'"
        >
          资料编辑
        </button>
        <button
          type="button"
          class="admin-tab"
          :class="{ active: activeTab === 'posts' }"
          @click="activeTab = 'posts'"
        >
          博客管理
        </button>
        <button
          type="button"
          class="admin-tab"
          :class="{ active: activeTab === 'data' }"
          @click="activeTab = 'data'"
        >
          数据工具
        </button>
        <button
          type="button"
          class="admin-tab"
          :class="{ active: activeTab === 'publish' }"
          @click="activeTab = 'publish'"
        >
          发布设置
        </button>
      </nav>

      <!-- 资料编辑 -->
      <section v-if="activeTab === 'profile'" class="admin-section">
        <h2 class="admin-section-title">个人资料</h2>
        <p class="admin-section-desc">修改后点击「保存并发布」，内容将写入 GitHub 仓库，所有访客约 1-2 分钟内可见。</p>

        <div class="admin-grid">
          <div class="admin-card">
            <h3 class="admin-card-title">基本信息</h3>
            <label class="admin-field">
              <span>署名名称</span>
              <input v-model.trim="profileForm.name" class="admin-input" />
            </label>
            <label class="admin-field">
              <span>一句话签名</span>
              <input v-model.trim="profileForm.tagline" class="admin-input" />
            </label>
            <label class="admin-field">
              <span>Hero 副标题（每行一条，打字机轮播）</span>
              <textarea
                :value="(profileForm.heroSubtitles || []).join('\n')"
                class="admin-textarea"
                rows="3"
                @input="profileForm.heroSubtitles = $event.target.value.split('\n')"
              ></textarea>
            </label>
            <label class="admin-field">
              <span>头像图片链接（留空则用名字首字母）</span>
              <input v-model.trim="profileForm.avatar" class="admin-input" />
            </label>
            <label class="admin-field">
              <span>侧栏公告</span>
              <textarea v-model.trim="profileForm.notice" class="admin-textarea" rows="2"></textarea>
            </label>
          </div>

          <div class="admin-card">
            <h3 class="admin-card-title">关于我（每行一段）</h3>
            <label class="admin-field">
              <textarea
                :value="(profileForm.bio || []).join('\n')"
                class="admin-textarea"
                rows="5"
                @input="profileForm.bio = $event.target.value.split('\n')"
              ></textarea>
            </label>
            <h4 class="admin-card-sub">数据指标（value / label）</h4>
            <div v-for="(s, i) in profileForm.stats" :key="i" class="admin-row">
              <input v-model.trim="s.value" class="admin-input" placeholder="数值，如 3+" />
              <input v-model.trim="s.label" class="admin-input" placeholder="说明，如 年经验" />
              <button type="button" class="admin-icon-btn" title="删除" @click="removeRow('stats', i)">✕</button>
            </div>
            <button type="button" class="btn btn-ghost btn-sm" @click="addRow('stats', { value: '', label: '' })">+ 添加指标</button>
          </div>

          <div class="admin-card">
            <h3 class="admin-card-title">技能分组</h3>
            <div v-for="(g, i) in skillGroupsEdit" :key="i" class="admin-row">
              <input v-model.trim="g.key" class="admin-input" placeholder="分组名，如 前端" />
              <input v-model.trim="g.tags" class="admin-input" placeholder="技能，逗号分隔" />
              <button type="button" class="admin-icon-btn" title="删除" @click="removeSkillGroup(i)">✕</button>
            </div>
            <button type="button" class="btn btn-ghost btn-sm" @click="addSkillGroup">+ 添加分组</button>
          </div>

          <div class="admin-card">
            <h3 class="admin-card-title">项目展示</h3>
            <div v-for="(p, i) in profileForm.projects" :key="i" class="admin-project">
              <div class="admin-row">
                <input v-model.trim="p.name" class="admin-input" placeholder="项目名称" />
                <button type="button" class="admin-icon-btn" title="删除" @click="removeRow('projects', i)">✕</button>
              </div>
              <textarea v-model.trim="p.desc" class="admin-textarea" rows="2" placeholder="项目描述"></textarea>
              <div class="admin-row">
                <input
                  :value="(p.tags || []).join(', ')"
                  class="admin-input"
                  placeholder="标签，逗号分隔"
                  @input="p.tags = $event.target.value.split(/[,，]/).map((t) => t.trim()).filter(Boolean)"
                />
                <input v-model.trim="p.link" class="admin-input" placeholder="链接（可选）" />
              </div>
            </div>
            <button type="button" class="btn btn-ghost btn-sm" @click="addRow('projects', { name: '', desc: '', tags: [], link: '' })">+ 添加项目</button>
          </div>

          <div class="admin-card">
            <h3 class="admin-card-title">经历时间线</h3>
            <div v-for="(t, i) in profileForm.timeline" :key="i" class="admin-project">
              <div class="admin-row">
                <input v-model.trim="t.date" class="admin-input" placeholder="日期，如 2026 — 至今" />
                <button type="button" class="admin-icon-btn" title="删除" @click="removeRow('timeline', i)">✕</button>
              </div>
              <input v-model.trim="t.title" class="admin-input" placeholder="标题" />
              <textarea v-model.trim="t.desc" class="admin-textarea" rows="2" placeholder="描述"></textarea>
            </div>
            <button type="button" class="btn btn-ghost btn-sm" @click="addRow('timeline', { date: '', title: '', desc: '' })">+ 添加经历</button>
          </div>

          <div class="admin-card">
            <h3 class="admin-card-title">联系方式与站点信息</h3>
            <div class="admin-row">
              <input v-model.trim="profileForm.contact.email" class="admin-input" placeholder="邮箱" />
              <input v-model.trim="profileForm.contact.github" class="admin-input" placeholder="GitHub 链接" />
            </div>
            <div class="admin-row">
              <input v-model.trim="profileForm.contact.twitter" class="admin-input" placeholder="Twitter（留空不显示）" />
              <input v-model.trim="profileForm.contact.juejin" class="admin-input" placeholder="掘金（留空不显示）" />
            </div>
            <hr class="admin-divider" />
            <label class="admin-field">
              <span>站点标题 / 副标题 / 描述</span>
              <div class="admin-row">
                <input v-model.trim="profileForm.site.title" class="admin-input" />
                <input v-model.trim="profileForm.site.subtitle" class="admin-input" />
              </div>
              <input v-model.trim="profileForm.site.description" class="admin-input" />
            </label>
          </div>
        </div>

        <div class="admin-savebar">
          <button type="button" class="btn btn-primary btn-lg" :disabled="publishing" @click="saveProfile">
            {{ publishing ? '发布中…' : '保存并发布' }}
          </button>
          <span class="admin-save-hint">保存后将写入 GitHub 仓库，全站访客约 1-2 分钟生效</span>
        </div>
      </section>

      <!-- 博客管理 -->
      <section v-if="activeTab === 'posts'" class="admin-section">
        <div class="admin-section-head">
          <div>
            <h2 class="admin-section-title">博客管理</h2>
            <p class="admin-section-desc">共 {{ store.posts.length }} 篇文章，可新建、编辑或删除。</p>
          </div>
          <button type="button" class="btn btn-primary" @click="newPost">+ 新建文章</button>
        </div>

        <!-- 文章列表 -->
        <div v-if="!editing" class="admin-post-table-wrap">
          <table class="admin-post-table">
            <thead>
              <tr>
                <th>标题</th>
                <th>分类</th>
                <th>日期</th>
                <th>标签</th>
                <th class="col-ops">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in postList" :key="p.id">
                <td>
                  <router-link :to="`/post/${p.id}`" class="admin-post-title">{{ p.title }}</router-link>
                </td>
                <td>{{ p.category }}</td>
                <td>{{ p.date }}</td>
                <td class="admin-tag-cell">{{ (p.tags || []).join(' / ') }}</td>
                <td class="col-ops">
                  <button type="button" class="admin-mini-btn" @click="editPost(p)">编辑</button>
                  <button type="button" class="admin-mini-btn danger" @click="deletePost(p)">删除</button>
                </td>
              </tr>
              <tr v-if="!postList.length">
                <td colspan="5" class="admin-empty">还没有文章，点击右上角「新建文章」开始写作。</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 文章编辑表单 -->
        <div v-else class="admin-card admin-post-editor">
          <h3 class="admin-card-title">{{ isNew ? '新建文章' : '编辑文章' }}</h3>
          <div class="admin-grid two">
            <label class="admin-field">
              <span>标题 *</span>
              <input v-model.trim="form.title" class="admin-input" placeholder="文章标题" @input="form.id = slugify(form.title)" />
            </label>
            <label class="admin-field">
              <span>文章 id（路由地址，自动生成可改）</span>
              <input v-model.trim="form.id" class="admin-input" placeholder="如 hello-world" />
            </label>
            <label class="admin-field">
              <span>发布日期 *（YYYY-MM-DD）</span>
              <input v-model="form.date" class="admin-input" type="date" />
            </label>
            <label class="admin-field">
              <span>分类 *</span>
              <input v-model.trim="form.category" class="admin-input" placeholder="如 技术笔记" />
            </label>
            <label class="admin-field">
              <span>标签（逗号分隔）</span>
              <input v-model="savedTags" class="admin-input" placeholder="如 Vue, Vite, 前端" @input="toggleTagPreview($event.target.value)" />
            </label>
          </div>
          <label class="admin-field">
            <span>摘要</span>
            <textarea v-model.trim="form.summary" class="admin-textarea" rows="2" placeholder="列表页展示的摘要"></textarea>
          </label>
          <label class="admin-field">
            <span>正文（每行一段；## 标题 / - 列表 / &gt; 引用）</span>
            <textarea v-model="form.contentText" class="admin-textarea mono" rows="14" placeholder="## 小标题&#10;普通段落…&#10;- 列表项一&#10;- 列表项二&#10;&gt; 引用内容"></textarea>
          </label>
          <div class="admin-editor-actions">
            <button v-if="isNew" type="button" class="btn btn-primary" :disabled="publishing" @click="savePost">
              {{ publishing ? '发布中…' : '发布文章' }}
            </button>
            <button v-else type="button" class="btn btn-primary" :disabled="publishing" @click="savePost">
              {{ publishing ? '发布中…' : '保存修改' }}
            </button>
            <button type="button" class="btn btn-ghost" @click="cancelEdit">取消</button>
          </div>

          <!-- 实时预览 -->
          <div class="admin-preview">
            <h4 class="admin-card-sub">正文预览</h4>
            <div class="admin-preview-body">
              <template v-if="contentBlocks.length">
                <template v-for="(b, i) in contentBlocks" :key="i">
                  <h2 v-if="b.type === 'h2'">{{ b.text }}</h2>
                  <ul v-else-if="b.type === 'list'">
                    <li v-for="(it, j) in b.items" :key="j">{{ it }}</li>
                  </ul>
                  <blockquote v-else-if="b.type === 'quote'">{{ b.text }}</blockquote>
                  <p v-else>{{ b.text }}</p>
                </template>
              </template>
              <p v-else class="admin-empty">预览区：开始输入正文后此处实时渲染。</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 数据工具 -->
      <section v-if="activeTab === 'data'" class="admin-section">
        <h2 class="admin-section-title">数据工具</h2>
        <p class="admin-section-desc">本地编辑的数据可通过导出迁移到其他浏览器，或用于提交到代码仓库发布。</p>

        <div class="admin-grid two">
          <div class="admin-card">
            <h3 class="admin-card-title">导出数据</h3>
            <p class="admin-card-text">将当前全部内容（资料 + 文章）导出为 JSON 文件，便于备份或迁移。</p>
            <button type="button" class="btn btn-primary" @click="downloadExport">导出 JSON</button>
          </div>
          <div class="admin-card">
            <h3 class="admin-card-title">导入数据</h3>
            <p class="admin-card-text">选择之前导出的 JSON 文件，覆盖当前浏览器中的内容。</p>
            <label class="btn btn-ghost admin-file-btn">
              选择 JSON 文件
              <input type="file" accept=".json,application/json" hidden @change="onImportFile" />
            </label>
          </div>
        </div>

        <div class="admin-card danger-card">
          <h3 class="admin-card-title">恢复默认数据</h3>
          <p class="admin-card-text">清空所有本地编辑，恢复到代码内置的默认资料与示例文章。</p>
          <button type="button" class="btn danger-btn" @click="restoreDefault">恢复默认数据</button>
        </div>

        <div class="admin-card">
          <h3 class="admin-card-title">发布说明</h3>
          <p class="admin-card-text">
            本站为 GitHub Pages 静态站：后台「保存并发布」会把内容直接写入仓库的
            <code>content.json</code> 并自动部署，<b>所有访客约 1-2 分钟内可见</b>；
            访客页面每分钟自动检查更新。发布依赖 GitHub 令牌，请到「发布设置」中配置。
          </p>
        </div>
      </section>

      <!-- 发布设置 -->
      <section v-if="activeTab === 'publish'" class="admin-section">
        <h2 class="admin-section-title">发布设置</h2>
        <p class="admin-section-desc">配置 GitHub 令牌后，「保存并发布」会把内容写入仓库，所有访客都能看到。</p>

        <div class="admin-grid two">
          <div class="admin-card">
            <h3 class="admin-card-title">GitHub 令牌</h3>
            <p class="admin-card-text">
              后台发布需要 GitHub 令牌（<b>repo 内容读写权限</b>：fine-grained token 勾选 Contents: Read and write）。
              令牌仅保存在<b>本机浏览器</b>，不进入站点代码、日志或交付文件。
            </p>
            <label class="admin-field">
              <span>当前状态：{{ tokenSaved ? `已保存（${tokenTail()}）` : '未配置' }}</span>
              <input
                v-model.trim="tokenInput"
                type="password"
                class="admin-input"
                placeholder="粘贴 GitHub 令牌（ghp_… 或 github_pat_…）"
                autocomplete="off"
              />
            </label>
            <div class="admin-row">
              <button type="button" class="btn btn-primary" @click="saveToken">保存令牌</button>
              <button v-if="tokenSaved" type="button" class="btn btn-ghost" @click="checkToken">校验</button>
              <button v-if="tokenSaved" type="button" class="btn danger-btn" @click="removeToken">清除</button>
            </div>
            <p class="admin-card-text">
              获取方式：GitHub → Settings → Developer settings → Fine-grained personal access tokens →
              新建 → 仓库选择 <code>tan17ocean/tan17ocean.github.io</code> → 权限勾选
              <code>Contents: Read and write</code> → 生成后粘贴到此处。
            </p>
          </div>

          <div class="admin-card">
            <h3 class="admin-card-title">立即发布当前内容</h3>
            <p class="admin-card-text">
              把本机当前全部内容（资料 + 文章）立即推送到线上。适合首次配置令牌后，
              或本地保存成功但线上未更新的情况下手动触发。
            </p>
            <button type="button" class="btn btn-primary" :disabled="publishing" @click="publishAll()">
              {{ publishing ? '发布中…' : '立即发布到线上' }}
            </button>
          </div>
        </div>

        <div class="admin-grid two">
          <div class="admin-card">
            <h3 class="admin-card-title">最近发布结果</h3>
            <p v-if="!lastPub" class="admin-card-text">尚未发布过。完成一次「保存并发布」后，这里会显示结果。</p>
            <template v-else>
              <p class="admin-card-text" :class="lastPub.ok ? 'pub-ok' : 'pub-err'">
                {{ lastPub.time }} {{ lastPub.ok ? '发布成功，全站访客约 1-2 分钟内可见' : '发布失败' }}
              </p>
              <p v-if="!lastPub.ok && lastPub.err" class="admin-card-text pub-err detail">
                失败原因：{{ lastPub.err }}
              </p>
              <p class="admin-card-text">本记录保存在本机浏览器，仅用于问题排查。</p>
            </template>
          </div>

          <div class="admin-card">
            <h3 class="admin-card-title">一键诊断</h3>
            <p class="admin-card-text">
              逐项检查「网络可达、令牌有效、线上版本读取」等 publish 链路环节，
              快速定位发布失败的原因。
            </p>
            <button type="button" class="btn btn-ghost" :disabled="diagnosing" @click="runDiag">
              {{ diagnosing ? '诊断中…' : '开始诊断' }}
            </button>
            <div v-if="lastDiag" class="diag-list">
              <div v-for="(d, i) in lastDiag" :key="i" class="diag-item">
                <span class="diag-dot" :class="d.ok ? 'ok' : 'err'"></span>
                <span class="diag-name">{{ d.name }}</span>
                <span class="diag-detail">{{ d.detail }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="admin-card">
          <h3 class="admin-card-title">发布原理与生效时间</h3>
          <p class="admin-card-text">
            每次点击「保存并发布」：内容写入仓库 gh-pages 分支的 <code>content.json</code>（带更新时间，GitHub 自动提交），
            GitHub Pages 检测到分支更新后自动重新部署，约 1-2 分钟后<b>全站访客</b>拉取到新内容；
            访客停留在页面时也会每分钟自动检查更新并即时刷新，无需手动刷新。
          </p>
        </div>
      </section>
    </div>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toast.show" class="admin-toast" :class="toast.kind">{{ toast.text }}</div>
    </transition>
  </div>
</template>