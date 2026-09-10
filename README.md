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
| 资料编辑 | 修改姓名、签名、Hero 副标题、公告、关于我、统计、技能、项目等，保存后全站（首页/侧栏/页脚）立即刷新 |
| 博客管理 | 新建 / 编辑 / 删除文章（标题、id、日期、分类、标签、摘要、正文），正文支持 `##` 标题 / `-` 列表 / `> ` 引用，自带实时预览 |
| 数据工具 | 导出全部内容为 JSON（备份/迁移）、导入 JSON 覆盖、恢复默认数据（清空本地编辑） |

### 数据存储与生效范围（重要）

- 后台编辑的内容保存在**当前浏览器的 `localStorage`**（key：`tan-home-profile` / `tan-home-posts`），**只对登录的这台设备生效**。
- 要让所有访客看到新内容：在后台「数据工具」中**导出 JSON**，再把其中的 `profile` / `posts` 内容同步回 `src/data/` 对应文件，重新 `npm run build` 并部署（见下节）。
- 任何访客首次打开站点时，读取的都是代码内置的默认数据（`src/data/*.js`），不受后台编辑影响。

### 安全说明

- 本项目为无后端静态站（GitHub Pages），登录校验在前端完成：密码为 SHA-256 哈希比对，可拦截普通访客、防止误操作。
- **无法抵御**「查看源码后直接修改 localStorage / 篡改前端代码」的绕过，属演示级鉴权，不适用于高安全场景。
- 如需强安全：需引入后端服务（登录接口 + 数据库 + 鉴权中间件），或改用 Serverless 函数（如 Cloudflare Workers / 云函数）做密码校验与内容存储，前端只负责渲染。

### 升级路径（无需后端 → 带后端）

1. 把 `verifyCredentials` 的本地哈希比对替换为调用后端登录接口（HTTPS + 返回会话 Token）；
2. 把 `store` 的 localStorage 读写替换为后端 API（内容增删改查）；
3. 前台上线流程不变（构建 → 部署），后台从「本机生效」升级为「全站生效」。

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