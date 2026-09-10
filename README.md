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
    ├── main.js                # 应用入口（注册路由、v-reveal 指令、全局样式）
    ├── App.vue                # 布局：SiteHeader + 路由出口 + SiteFooter
    ├── router/index.js        # hash 路由：/ /posts /post/:id /archives /tags /search
    ├── data/
    │   ├── profile.js         # ★ 个人信息（名字、技能、项目、时间线、联系方式）
    │   └── posts.js           # ★ 博客文章数据（替换为你的真实文章）
    ├── composables/           # useTheme（深浅主题）、useTypewriter（打字机）
    ├── directives/reveal.js   # v-reveal 滚动渐入动画
    ├── utils/                 # format.js（日期/阅读时长/区块解析/搜索）、scroll.js
    ├── styles/main.css        # JetBrains 风格全局样式（浅色/深色双主题 + 响应式）
    ├── components/            # SiteHeader / SiteFooter / SideBar / BlogLayout / PostCard
    │   └── home/              # Hero / About / Skills / Projects / Timeline / Contact
    └── views/                 # Home / Posts / PostDetail / Archives / Tags / Search
```

## 替换为你的内容

### 1. 个人信息 — `src/data/profile.js`

- `name`：你的名字（Hero 大标题、页头品牌、页脚版权会同步）
- `heroSubtitles`：Hero 打字机轮播的副标题，可加多条
- `stats`：关于区统计数字（文章数/标签数/项目数）
- `skills`：技能分组（前端 / 后端 / 工具）
- `projects`：占位项目，替换为真实项目（`link` 留空会自动隐藏跳转）
- `timeline`：时间线条目
- `contact`：邮箱、GitHub 必填；`wechat` / `bilibili` 等留空字符串即自动隐藏该按钮
- `notice`：侧边栏公告

### 2. 博客文章 — `src/data/posts.js`

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