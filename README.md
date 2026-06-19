# 今日热榜

聚合全网热点的热榜网站。

## 功能

- 🔥 实时热榜：聚合微博、知乎、抖音、微信、百度、头条等平台
- 📰 分类浏览：综合、科技、娱乐、社区等分类
- 🔔 热榜追踪：关注话题获取更新提醒
- 📅 历史日历：查看历史热榜
- 🔍 聚合搜索：跨平台搜索

## 技术栈

- **前端框架**: Nitro + Vue 3
- **语言**: TypeScript
- **爬虫**: Puppeteer
- **部署**: Vercel

## 快速开始

```bash
# 安装依赖
npm install

# 开发
npm run dev

# 爬取数据
npm run crawl:weibo
npm run crawl:zhihu

# 构建
npm run build
```

## SEO

- SSR 服务器端渲染
- 自动生成 sitemap.xml
- 支持 Open Graph
- AdSense 页面齐全

## 部署

项目已配置 Vercel 部署，直接 push 到 GitHub 即可自动部署。

## License

MIT
