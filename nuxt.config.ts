export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },

  app: {
    head: {
      title: '上升热点 - 聚合全网热点',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '上升热点聚合微博、知乎、抖音、微信、百度、头条等平台热点，帮助你快速浏览全网正在发生的事。' },
        { name: 'keywords', content: '上升热点, 热门新闻, 热搜, 热榜, 新闻聚合, 微博热搜, 知乎热榜, 抖音热点' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: '上升热点' },
        { property: 'og:description', content: '聚合全网热点，快速看清正在发生的事。' },
        { property: 'og:url', content: process.env.NUXT_PUBLIC_SITE_URL || 'https://newsnow.example.com' },
      ],
      link: [
        { rel: 'search', type: 'application/opensearchdescription+xml', href: '/opensearch.xml', title: '上升热点' },
      ],
      script: [
        { async: true, src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2579756571711911', crossorigin: 'anonymous' },
      ],
    },
  },

  css: ['~/assets/css/global.css'],

  routeRules: {
    '/': { prerender: true },
    '/c/**': { swr: 300 },
    '/n/**': { swr: 300 },
  },

  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://newsnow.example.com',
    },
  },
})
