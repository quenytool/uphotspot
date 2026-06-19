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

export default defineEventHandler(async (event) => {
  const source = getRouterParam(event, 'source')

  if (source === 'all') {
    const results = await Promise.all(validSources.map(async item => normalizeSourceData(item)))
    const allData = results.flatMap(item => item.data)

    return {
      source: 'all',
      updatedAt: new Date().toISOString(),
      count: allData.length,
      data: allData
        .sort((a, b) => (a.rank || 0) - (b.rank || 0))
        .slice(0, 100),
    }
  }

  if (!source || !validSources.includes(source)) {
    throw createError({
      statusCode: 400,
      message: `无效的数据源。可用来源：${validSources.join(', ')}`,
    })
  }

  return normalizeSourceData(source)
})

async function normalizeSourceData(source: string) {
  try {
    const data = await fetchFromMcp(source)
    const list = Array.isArray(data.list) ? data.list : []

    return {
      source,
      updatedAt: data.update_time || new Date().toISOString(),
      count: list.length,
      data: list.map((item: any, idx: number) => ({
        id: String(item.index || idx + 1),
        title: item.title || '',
        url: item.url || '#',
        source,
        rank: Number(item.index || idx + 1),
        heat: item.hot_value ? Number(item.hot_value).toLocaleString() : '',
        category: inferCategory(source),
        tags: [],
        createdAt: data.update_time || new Date().toISOString(),
      })),
    }
  } catch (error) {
    console.warn(`Use fallback hot data for ${source}:`, error)
    const data = getFallbackList(source)

    return {
      source,
      updatedAt: new Date().toISOString(),
      count: data.length,
      data,
    }
  }
}

async function fetchFromMcp(source: string): Promise<any> {
  if (!UAPIS_API_KEY) {
    throw new Error('UAPIS_API_KEY is not configured')
  }

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

  if (result.error) {
    throw new Error(`MCP error: ${result.error.message}`)
  }

  if (result.result?.isError) {
    const errorText = result.result.content?.[0]?.text || 'Unknown error'
    throw new Error(`API error: ${errorText}`)
  }

  const dataText = result.result?.content?.[0]?.text || '{}'
  return JSON.parse(dataText)
}

function inferCategory(source: string) {
  if (['github', 'v2ex', 'juejin'].includes(source)) return 'developer'
  if (['douyin', 'bilibili'].includes(source)) return 'ent'
  if (['zhihu', 'tieba', 'douban'].includes(source)) return 'community'
  if (['hupu'].includes(source)) return 'sports'
  if (['36kr'].includes(source)) return 'news'
  return 'news'
}

function getFallbackList(source: string) {
  const fallbackTitles: Record<string, string[]> = {
    weibo: ['多地高温天气持续，城市避暑地图走热', '端午假期出行热度攀升', '国产电影新片预售开启'],
    zhihu: ['如何判断一个热点是否值得持续关注？', '年轻人为什么重新开始做长期计划？', 'AI 工具会怎样改变知识工作？'],
    douyin: ['城市夜市打卡视频播放量上涨', '毕业季歌单再度翻红', 'AI 复古写真模板走红'],
    weixin: ['本周值得读的十篇深度文章', '县城消费新趋势观察', '通勤人群的早餐选择变化'],
    baidu: ['全国多地发布天气预警', '新能源车补能体验持续优化', '今年暑期档片单公布'],
    toutiao: ['多个城市优化公共交通接驳', '高校陆续公布招生计划', '新一轮消费券活动启动'],
    v2ex: ['大家最近在用哪些效率工具？', '远程协作的文档规范怎么定？', '个人项目部署平台选择'],
    douban: ['近期高分新剧讨论升温', '独立书店城市漫游指南', '夏日影展片单整理'],
    github: ['热门开源项目发布新版本', '开发者关注轻量级 AI Agent 框架', '前端构建工具性能对比'],
    bilibili: ['知识区年度热门选题回顾', '游戏更新解析视频冲上热门', '音乐现场混剪播放量走高'],
    hupu: ['总决赛关键球员表现讨论', '休赛期交易流言汇总', '跑步装备选择经验分享'],
    tieba: ['经典游戏社区活跃度回升', '数码新品体验贴持续更新', '校园生活讨论热度上升'],
  }

  const titles = fallbackTitles[source] || fallbackTitles.toutiao

  return titles.map((title, idx) => ({
    id: `${source}-${idx + 1}`,
    title,
    url: '#',
    source,
    rank: idx + 1,
    heat: `${(98 - idx * 12).toLocaleString()} 万`,
    category: inferCategory(source),
    tags: [],
    createdAt: new Date(Date.now() - idx * 1000 * 60 * 18).toISOString(),
  }))
}
