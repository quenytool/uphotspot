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
npm run crawl:qq-news    # 腾讯新闻
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
