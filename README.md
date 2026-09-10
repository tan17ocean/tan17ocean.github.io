# tan17ocean 个人主页

个人博客主页，结构参考 Butterfly 风格的博客布局（首页 + 博客文章区），配色与视觉风格参考 JetBrains（蓝紫渐变、简洁大气）。

技术栈：**Vue 3 + Vue Router + Vite**，零 UI 依赖，纯手写样式。

## 快速开始

```bash
npm install     # 安装依赖
npm run dev     # 开发预览（默认 http://localhost:5174）
npm run build   # 构建产物到 dist/
npm run preview # 本地预览构建产物
```

## 目录结构

```
personal-home/
├── index.html                 # 入口 HTML（含主题防闪烁脚本）
├── vite.config.js             # base:'./'，可直接部署到 GitHub Pages
├── package.json
└── src/
    ├── main.js                # 应用入口（注册路由、v-reveal 指令、全局样式、后台样式）
    ├── App.vue                # 布局：SiteHeader + 路由出口 + SiteFooter
    ├── router/index.js        # hash 路由：/ /posts /post/:id /archives /tags /search /login /admin
    ├── data/
    │   ├── profile.js         # ★ 默认个人信息（名字、技能、项目、时间线、联系方式）
    │   └── posts.js           # ★ 默认博客文章数据（仅数组，派生函数已迁至 store）
    ├── composables/
    │   ├── useTheme.js        # 深浅主题
    │   ├── useTypewriter.js   # 打字机
    │   └── useContentStore.js # ★ 内容 Store：全站统一读取 profile/posts + localStorage 持久化 + 派生数据
    ├── directives/reveal.js   # v-reveal 滚动渐入动画
    ├── utils/
    │   ├── auth.js            # ★ 管理后台认证（账号校验、SHA-256、会话）
    │   ├── format.js          # 日期/阅读时长/区块解析/搜索
    │   └── scroll.js
    ├── styles/
    │   ├── main.css           # JetBrains 风格全局样式（浅色/深色双主题 + 响应式）
    │   └── admin.css          # ★ 登录页与管理后台样式
    ├── components/            # SiteHeader / SiteFooter / SideBar / BlogLayout / PostCard
    │   └── home/              # Hero / About / Skills / Projects / Timeline / Contact
    └── views/                 # Home / Posts / PostDetail / Archives / Tags / Search / Login / Admin
```

## 内容管理后台

站点内置一个登录式管理后台，供站点所有者（管理员）在网页端直接编辑资料、管理博客、导入导出数据，前台全站实时生效。

- 地址：`#/admin`（顶栏「管理」入口，登录后可见）
- 账号 / 密码：见 `src/utils/auth.js`（密码以 SHA-256 哈希存储，不存明文）
- 会话：`sessionStorage` 保存，关闭标签页 / 浏览器后自动失效，刷新页面不会掉登录

### 后台功能

| 模块 | 说明 |
| --- | --- |
| 资料编辑 | 修改姓名、签名、Hero 副标题、公告、关于我、统计、技能、项目等，「保存并发布」后全站访客可见 |
| 博客管理 | 新建 / 编辑 / 删除文章（标题、id、日期、分类、标签、摘要、正文），正文支持 `##` 标题 / `-` 列表 / `> ` 引用，自带实时预览，保存即发布到线上 |
| 数据工具 | 导出全部内容为 JSON（备份/迁移）、导入 JSON 覆盖、恢复默认数据（清空本地编辑） |
| 发布设置 | 配置 GitHub 发布令牌（仅存本机浏览器）、校验 / 清除令牌、手动「立即发布当前内容」 |

### 数据存储与生效范围（重要）

- 后台点击「保存并发布」后，内容会写入 **GitHub 仓库 gh-pages 分支的 `content.json`**（GitHub Contents API，自动提交、带更新时间），GitHub Pages 检测到更新后自动重新部署，**约 1-2 分钟后所有访客可见**。
- 站点运行时数据来源优先级：线上 `content.json`（远程）→ 本机 `localStorage` 缓存（离线回退）→ 代码内置默认数据（`src/data/*.js` 兜底）。
- 访客停留在页面时会**每分钟自动轮询** `content.json`，内容有更新则全站即时刷新，无需手动刷新页面。
- 本地 `localStorage`（key：`tan-home-profile` / `tan-home-posts`）现在仅作为发布前的草稿与离线回退缓存，不再决定访客看到的内容。

### 发布令牌（GitHub Token）

- 后台「发布设置」需填写一次 GitHub 令牌，用于向仓库提交内容，要求 **repo 内容读写权限**：
  GitHub → Settings → Developer settings → Fine-grained personal access tokens → 新建 →
  仓库选择 `tan17ocean/tan17ocean.github.io` → Repository permissions → Contents: **Read and write** → 生成。
- 令牌只保存在**配置它的那台浏览器的 `localStorage`**（key：`tan-home-gh-token`），可以随时清除；**不写入代码、日志或交付文件**。
- 令牌失效 / 被撤销后，后台发布会提示错误，重新填写即可恢复。

### 安全说明

- 本项目为无后端静态站（GitHub Pages）：登录校验在前端完成（密码 SHA-256 哈希比对，可拦截普通访客、防止误操作）；内容发布通过 GitHub 令牌直接提交仓库。
- **无法抵御**「查看源码后直接修改 localStorage / 简化登录 / 用他人令牌调用 API」等绕过手段，属演示级方案，不适用于高安全、多人协管场景。
- 发布令牌具有仓库写权限，请妥善保管：不要在公共电脑上保存令牌、定期轮换；撤销令牌后后台将无法发布（重新填写新令牌即可）。
- 如需强安全：引入后端服务（登录接口 + 数据库 + 鉴权中间件），前端只负责渲染。

### 升级路径（需要更强能力时）

- **强鉴权 / 多人协管**：把 `verifyCredentials` 的本地哈希比对替换为后端登录接口（HTTPS + 会话 Token），内容写入改为带鉴权的后端 API；
- **实时推送 / 免部署延迟**：引入 Serverless（Cloudflare Workers / 云函数）或托管数据库（Supabase 等），前台通过 WebSocket / 订阅实时同步，不再依赖 GitHub Pages 部署周期（当前周期约 1-2 分钟）。

## 替换为你的内容

### 1. 默认个人信息 — `src/data/profile.js`

- `name`：你的名字（Hero 大标题、页头品牌、页脚版权会同步）
- `heroSubtitles`：Hero 打字机轮播的副标题，可加多条
- `stats`：关于区统计数字（文章数/标签数/项目数）
- `skills`：技能分组（前端 / 后端 / 工具）
- `projects`：占位项目，替换为真实项目（`link` 留空会自动隐藏跳转）
- `timeline`：时间线条目
- `contact`：邮箱、GitHub 必填；`wechat` / `bilibili` 等留空字符串即自动隐藏该按钮
- `notice`：侧边栏公告

### 2. 默认博客文章 — `src/data/posts.js`

按现有字段结构替换即可：`id / title / date / category / tags / summary / content`。
`date` 用 `'YYYY-MM-DD'` 字符串；`content` 支持 `##` 标题、`-` 列表、`> ` 引用和普通段落。

博客文章区（列表、分类筛选、标签、归档、搜索、上一篇/下一篇）全部由这份数据驱动，替换数据即完成内容更新。

### 3. 头像 — 侧边栏 `SideBar.vue`

优先读取 `profile.avatar`（图片路径，放入 `public/` 如 `public/avatar.png`）；
未配置时自动显示名字首字母的渐变占位头像。

## 部署

构建产物在 `dist/`，`base: './'` 已配置，可直接部署到 GitHub Pages / 任意静态托管：

```bash
npm run build
```

GitHub Pages 部署方式（main 分支存源码、gh-pages 分支存构建产物）：

```bash
npm run build
git subtree push --prefix dist origin gh-pages   # 或手动将 dist 内容推送到 gh-pages 分支
```