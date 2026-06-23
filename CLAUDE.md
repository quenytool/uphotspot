

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
# 今日热榜 (NewsNow)

聚合全网热点的热榜网站，使用 Nitro SSR 框架构建。

## 技术栈

- **框架**: Nitro + Vue 3
- **语言**: TypeScript
- **爬虫**: Puppeteer
- **部署**: Vercel

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 爬取热榜数据
npm run crawl:weibo
npm run crawl:zhihu

# 构建
npm run build

# 预览
npm run preview
```

## 项目结构

```
newsnow/
├── src/
│   ├── routes/          # 页面路由
│   ├── components/      # Vue 组件
│   ├── lib/             # 工具函数
│   └── styles/          # 样式
├── scripts/
│   └── sources/         # 各平台爬虫
├── public/              # 静态资源
└── docs/                # 文档
```

## 爬虫命令

```bash
npm run crawl:weibo     # 微博
npm run crawl:zhihu     # 知乎
npm run crawl:douyin    # 抖音
npm run crawl:weixin     # 微信
npm run crawl:baidu     # 百度
npm run crawl:toutiao    # 头条
npm run crawl:all        # 所有平台
```

## 部署

项目配置为部署到 Vercel：

```bash
npm run build
```

将 `dist` 目录部署到 Vercel 即可。

## SEO

- SSR 服务器端渲染，搜索引擎友好
- 自动生成 sitemap.xml
- 支持 Open Graph
- 支持 opensearch.xml

## AdSense 接入

1. 申请 Google AdSense
2. 在 `public/ads.txt` 填入您的发布商 ID
3. 在 `src/app.html` 填入您的 AdSense ID
4. 确保已添加必要页面：about, privacy, terms
