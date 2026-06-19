import { analyzeTopics, type TopicCluster } from '../utils/topicAnalysis'
import type { SnapshotItem } from '../utils/snapshotStorage'

const validSources = ['weibo', 'zhihu', 'douyin', 'weixin', 'baidu', 'toutiao', 'v2ex', 'douban', 'github', 'bilibili', 'hupu', 'tieba', 'juejin', '36kr']

const UAPIS_API_HOST = process.env.UAPIS_API_HOST || 'https://uapis.cn'
const UAPIS_API_KEY = process.env.UAPIS_API_KEY || ''

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
          heat: item.hot_value ? Number(item.hot_value).toLocaleString() : '',
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
  if (['github', 'v2ex', 'juejin'].includes(source)) return 'developer'
  if (['douyin', 'bilibili'].includes(source)) return 'ent'
  if (['zhihu', 'tieba', 'douban'].includes(source)) return 'community'
  if (['hupu'].includes(source)) return 'sports'
  if (['36kr'].includes(source)) return 'news'
  return 'news'
}

async function fetchFromMcp(source: string): Promise<any> {
  if (!UAPIS_API_KEY) {
    // 返回 fallback 数据用于测试
    return getFallbackData(source)
  }

  try {
    const response = await fetch(`${UAPIS_API_HOST}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: UAPIS_API_KEY,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'get_misc_hotboard',
          arguments: { type: source },
        },
        id: Date.now(),
      }),
    })

    if (!response.ok) {
      throw new Error(`MCP request failed: ${response.status}`)
    }

    const result: McpResponse = await response.json()
    if (result.error || result.result?.isError) {
      throw new Error('MCP error')
    }

    const dataText = result.result?.content?.[0]?.text || '{}'
    return JSON.parse(dataText)
  } catch {
    return getFallbackData(source)
  }
}

function getFallbackData(source: string): any {
  const fallbackTitles: Record<string, string[]> = {
    weibo: ['多地高温天气持续', '端午假期出行热度攀升', '国产电影新片预售开启', '黄子韬违停事件', '韩国门将巨大失误', '孙兴慜被嘲讽'],
    zhihu: ['高温天气如何应对', '端午假期旅行推荐', '国产电影崛起分析', '如何看待明星违停', '足球比赛失误讨论'],
    douyin: ['高温避暑技巧', '端午出游打卡', '热门电影推荐', '明星热搜合集', '足球精彩瞬间'],
    baidu: ['全国高温预警', '端午出行指南', '暑期档电影', '社会热点追踪'],
    toutiao: ['多地高温持续', '端午假期旅游', '新片上映资讯', '明星热搜话题'],
    weixin: ['高温天气健康提示', '端午出行攻略', '电影市场分析'],
  }

  const titles = fallbackTitles[source] || fallbackTitles.toutiao
  return {
    update_time: new Date().toISOString(),
    list: titles.map((title, idx) => ({
      index: idx,
      title,
      url: '#',
      hot_value: Math.floor(Math.random() * 1000000)
    }))
  }
}
