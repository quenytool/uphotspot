/**
 * 日报生成器
 * 基于历史快照生成每日热点摘要、关键词和平台分布
 */

import { getSnapshot, type SnapshotItem } from './snapshotStorage'

export interface DailyReport {
  date: string
  generatedAt: string
  summary: string
  topTopics: TopicSummary[]
  keywords: KeywordInfo[]
  platformDistribution: PlatformInfo[]
  sourceTimeline: TimelineEntry[]
  hotItems: SnapshotItem[]
  stats: DailyStats
}

export interface TopicSummary {
  title: string
  sources: string[]
  totalHeat: number
  rank: number
}

export interface KeywordInfo {
  word: string
  count: number
  sources: string[]
  trend: 'rising' | 'stable' | 'falling'
}

export interface PlatformInfo {
  source: string
  count: number
  totalHeat: number
  topItem?: SnapshotItem
  percentage: number
}

export interface TimelineEntry {
  hour: string
  topics: string[]
}

export interface DailyStats {
  totalItems: number
  totalHeat: number
  avgHeat: number
  peakHour: string
  peakTopics: string[]
}

// 停用词
const STOP_WORDS = new Set([
  '的', '了', '是', '在', '和', '与', '对', '为', '有', '我', '你', '他', '她', '它',
  '这', '那', '就', '也', '都', '要', '会', '能', '可以', '不', '没', '一个', '没有',
  '什么', '怎么', '如何', '为什么', '吗', '呢', '吧', '啊', '哦', '嗯', '啦', '呀',
  '已经', '正在', '开始', '结束', '进行', '发生', '出现', '发现', '使用', '通过',
  '关于', '根据', '按照', '为了', '由于', '对于', '被', '把', '让', '给', '向',
  '热搜', '热门', '话题', '事件', '最新', '今日', '昨天', '今天',
])

function parseHeat(heat?: string): number {
  if (!heat) return 0
  const str = heat.replace(/[,亿万亿]/g, '')
  if (str.includes('万')) return parseFloat(str) * 10000
  if (str.includes('亿')) return parseFloat(str) * 100000000
  return parseFloat(str) || 0
}

// 提取关键词
function extractKeywords(text: string): string[] {
  const keywords: Map<string, number> = new Map()

  // 中文
  const chineseChars = text.match(/[一-龥]{2,4}/g) || []
  for (const phrase of chineseChars) {
    if (STOP_WORDS.has(phrase)) continue
    keywords.set(phrase, (keywords.get(phrase) || 0) + 1)
  }

  // 英文
  const englishWords = text.match(/[a-zA-Z]{2,}/g) || []
  for (const word of englishWords) {
    if (STOP_WORDS.has(word.toLowerCase())) continue
    keywords.set(word, (keywords.get(word) || 0) + 1)
  }

  return Array.from(keywords.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
}

// 生成日报
export async function generateDailyReport(date: string): Promise<DailyReport | null> {
  const snapshot = await getSnapshot(date)
  if (!snapshot) return null

  // 收集所有数据
  const allItems: SnapshotItem[] = []
  const platformHeat: Record<string, { count: number; totalHeat: number; items: SnapshotItem[] }> = {}

  for (const [source, sourceData] of Object.entries(snapshot.sources)) {
    if (!sourceData) continue

    platformHeat[source] = { count: 0, totalHeat: 0, items: [] }

    for (const item of sourceData.data) {
      const heat = parseHeat(item.heat)
      allItems.push({ ...item, source })
      platformHeat[source].count++
      platformHeat[source].totalHeat += heat
      platformHeat[source].items.push(item)
    }
  }

  // 提取关键词
  const allTitles = allItems.map(i => i.title)
  const keywordMap = new Map<string, { count: number; sources: Set<string> }>()

  for (const item of allItems) {
    const keywords = extractKeywords(item.title)
    for (const kw of keywords) {
      if (!keywordMap.has(kw.word)) {
        keywordMap.set(kw.word, { count: 0, sources: new Set() })
      }
      const entry = keywordMap.get(kw.word)!
      entry.count++
      entry.sources.add(item.source)
    }
  }

  const keywords: KeywordInfo[] = Array.from(keywordMap.entries())
    .map(([word, { count, sources }]) => ({
      word,
      count,
      sources: Array.from(sources),
      trend: 'stable' as const
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)

  // 平台分布
  const totalHeat = Object.values(platformHeat).reduce((sum, p) => sum + p.totalHeat, 0)
  const platformDistribution: PlatformInfo[] = Object.entries(platformHeat)
    .filter(([_, data]) => data.count > 0)
    .map(([source, data]) => ({
      source,
      count: data.count,
      totalHeat: data.totalHeat,
      topItem: data.items.sort((a, b) => parseHeat(b.heat) - parseHeat(a.heat))[0],
      percentage: totalHeat > 0 ? (data.totalHeat / totalHeat) * 100 : 0
    }))
    .sort((a, b) => b.totalHeat - a.totalHeat)

  // 热点话题摘要
  const topItems = allItems
    .sort((a, b) => parseHeat(b.heat) - parseHeat(a.heat))
    .slice(0, 50)

  const topTopics: TopicSummary[] = []
  const usedTitles = new Set<string>()

  for (const item of topItems) {
    if (usedTitles.has(item.title)) continue

    // 找相似标题
    const similar = allItems.filter(i =>
      i.source !== item.source &&
      (i.title.includes(item.title.slice(0, 8)) || item.title.includes(i.title.slice(0, 8)))
    )

    const sources = [item.source, ...similar.map(i => i.source)]
    const uniqueSources = [...new Set(sources)]

    const totalTopicHeat = parseHeat(item.heat) + similar.reduce((sum, i) => sum + parseHeat(i.heat), 0)

    topTopics.push({
      title: item.title.length > 30 ? item.title.slice(0, 30) + '...' : item.title,
      sources: uniqueSources,
      totalHeat: totalTopicHeat,
      rank: topTopics.length + 1
    })

    usedTitles.add(item.title)
    for (const s of similar) usedTitles.add(s.title)

    if (topTopics.length >= 10) break
  }

  // 统计
  const stats: DailyStats = {
    totalItems: allItems.length,
    totalHeat,
    avgHeat: allItems.length > 0 ? totalHeat / allItems.length : 0,
    peakHour: '全天',
    peakTopics: topTopics.slice(0, 3).map(t => t.title)
  }

  // 生成摘要文本
  const topKeyword = keywords[0]?.word || '热点'
  const topSource = platformDistribution[0]?.source || '微博'
  const summary = `上升热点共收录 ${allItems.length} 条热点，总热度值 ${formatHeatValue(totalHeat)}。` +
    `「${topKeyword}」成为今日最热关键词，涉及 ${topTopics[0]?.sources.length || 0} 个平台。` +
    `${topSource} 平台热度最高，占总热量的 ${platformDistribution[0]?.percentage.toFixed(1) || 0}%。` +
    `「${topTopics[0]?.title || '暂无'}」登顶今日热度榜首。`

  return {
    date,
    generatedAt: new Date().toISOString(),
    summary,
    topTopics,
    keywords,
    platformDistribution,
    sourceTimeline: [],
    hotItems: topItems.slice(0, 30),
    stats
  }
}

function formatHeatValue(heat: number): string {
  if (heat >= 100000000) return `${(heat / 100000000).toFixed(1)}亿`
  if (heat >= 10000) return `${(heat / 10000).toFixed(1)}万`
  return heat.toLocaleString()
}
