import { analyzeTopics, type TopicCluster } from '../utils/topicAnalysis'
import type { SnapshotItem } from '../utils/snapshotStorage'
import { UapiClient } from 'uapi-sdk-typescript'

const validSources = ['weibo', 'zhihu', 'douyin', 'qq-news', 'baidu', 'toutiao', '52pojie', 'hellogithub', 'douban-group', 'douban-movie', 'github', 'bilibili', 'hupu', 'tieba', 'juejin', '36kr', 'sspai', 'jianshu']

const UAPIS_API_KEY = process.env.UAPIS_API_KEY || ''
const uapiClient = UAPIS_API_KEY ? new UapiClient('https://uapis.cn', UAPIS_API_KEY) : null

interface McpResponse {
  jsonrpc: string
  id: number | string
  result?: {
    isError: boolean
    content: Array<{ type: string; text: string }>
  }
  error?: {
    code: number
    message: string
  }
}

export default defineEventHandler(async (event): Promise<{
  source: string
  updatedAt: string
  count: number
  clusters: TopicCluster[]
  crossPlatform: TopicCluster[]
  keywords: { word: string; count: number }[]
}> => {
  const query = getQuery(event)
  const source = query.source as string | undefined
  const sourcesToFetch = source ? [source] : validSources

  // 收集所有数据
  const allItems: SnapshotItem[] = []

  for (const src of sourcesToFetch) {
    try {
      const srcData = await fetchFromMcp(src)
      const list = Array.isArray(srcData.list) ? srcData.list : []
      for (const item of list) {
        allItems.push({
          id: `${src}-${item.index || 0}`,
          title: item.title || '',
          url: item.url || '#',
          source: src,
          rank: Number(item.index || 0) + 1,
          heat: (item.hot_value && !isNaN(Number(item.hot_value))) ? Number(item.hot_value).toLocaleString() : '',
          category: inferCategory(src),
          createdAt: srcData.update_time || new Date().toISOString()
        })
      }
    } catch (error) {
      console.warn(`Failed to fetch ${src}:`, error)
    }
  }

  // 分析话题
  const result = analyzeTopics(allItems)

  return {
    source: source || 'all',
    updatedAt: new Date().toISOString(),
    count: result.clusters.length,
    clusters: result.clusters.slice(0, 50),
    crossPlatform: result.crossPlatform.slice(0, 20),
    keywords: result.allKeywords.slice(0, 30)
  }
})

function inferCategory(source: string): string {
  if (['github', '52pojie', 'juejin', 'sspai'].includes(source)) return 'developer'
  if (['douyin', 'bilibili'].includes(source)) return 'ent'
  if (['zhihu', 'tieba', 'douban-group', 'jianshu'].includes(source)) return 'community'
  if (['hupu'].includes(source)) return 'sports'
  if (['36kr', 'qq-news', 'douban-movie'].includes(source)) return 'news'
  return 'news'
}

async function fetchFromMcp(source: string): Promise<any> {
  if (!uapiClient) {
    return getFallbackData(source)
  }

  try {
    const response = await uapiClient.misc.getMiscHotboard({ type: source as any })
    return response
  } catch {
    return getFallbackData(source)
  }
}

function buildFallbackSearchUrl(source: string, title: string): string {
  const query = encodeURIComponent(title)
  const searchUrls: Record<string, string> = {
    weibo: `https://s.weibo.com/weibo?q=${query}`,
    zhihu: `https://www.zhihu.com/search?type=content&q=${query}`,
    douyin: `https://www.douyin.com/search/${query}`,
    'qq-news': `https://search.qq.com/news?q=${query}`,
    baidu: `https://www.baidu.com/s?wd=${query}`,
    toutiao: `https://so.toutiao.com/search?keyword=${query}`,
    '52pojie': `https://www.52pojie.cn/search.php?mod=forum&q=${query}`,
    hellogithub: `https://github.com/search?q=${query}&s=stars&type=repositories`,
    'douban-group': `https://www.douban.com/search?q=${query}`,
    'douban-movie': `https://movie.douban.com/subject_search?q=${query}`,
    github: `https://github.com/search?q=${query}`,
    bilibili: `https://search.bilibili.com/all?keyword=${query}`,
    tieba: `https://tieba.baidu.com/f/search/res?ie=utf-8&qw=${query}`,
    hupu: `https://bbs.hupu.com/search?q=${query}`,
    juejin: `https://juejin.cn/search?query=${query}`,
    '36kr': `https://36kr.com/search/articles/${query}`,
    sspai: `https://sspai.com/search?q=${query}`,
    jianshu: `https://www.jianshu.com/search?q=${query}`,
  }
  return searchUrls[source] || `https://www.baidu.com/s?wd=${query}`
}

function getFallbackData(source: string): any {
  const fallbackTitles: Record<string, string[]> = {
    weibo: ['多地高温天气持续', '端午假期出行热度攀升', '国产电影新片预售开启', '黄子韬违停事件', '韩国门将巨大失误', '孙兴慜被嘲讽'],
    zhihu: ['高温天气如何应对', '端午假期旅行推荐', '国产电影崛起分析', '如何看待明星违停', '足球比赛失误讨论'],
    douyin: ['高温避暑技巧', '端午出游打卡', '热门电影推荐', '明星热搜合集', '足球精彩瞬间'],
    baidu: ['全国高温预警', '端午出行指南', '暑期档电影', '社会热点追踪'],
    toutiao: ['多地高温持续', '端午假期旅游', '新片上映资讯', '明星热搜话题'],
    'qq-news': ['高温天气健康提示', '端午出行攻略', '电影市场分析'],
    'douban-group': ['近期高分新剧讨论升温', '独立书店城市漫游指南', '夏日影展片单整理'],
    'douban-movie': ['近期院线电影推荐', '高分影视作品盘点', '经典电影重温'],
  }

  const titles = fallbackTitles[source] || fallbackTitles.toutiao
  return {
    update_time: new Date().toISOString(),
    list: titles.map((title, idx) => ({
      index: idx,
      title,
      url: buildFallbackSearchUrl(source, title),
      hot_value: Math.floor(Math.random() * 1000000)
    }))
  }
}
