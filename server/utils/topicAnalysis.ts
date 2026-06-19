/**
 * 话题分析引擎
 * 标题聚类、关键词提取、跨平台关联
 */

import type { SnapshotItem } from './snapshotStorage'

export interface TopicItem {
  id: string
  title: string
  keyword: string
  keywords: string[]
  sources: string[]
  items: TopicSourceItem[]
  heat: number
  relatedTerms: string[]
}

export interface TopicSourceItem {
  title: string
  url: string
  source: string
  rank: number
  heat: string
}

export interface TopicCluster {
  id: string
  topic: string
  keywords: string[]
  sources: string[]
  items: TopicSourceItem[]
  totalHeat: number
  sourceCount: number
  sourceHeat: Record<string, number>
}

// 中文停用词
const STOP_WORDS = new Set([
  '的', '了', '是', '在', '和', '与', '对', '为', '有', '我', '你', '他', '她', '它',
  '这', '那', '就', '也', '都', '要', '会', '能', '可以', '不', '没', '一个', '没有',
  '什么', '怎么', '如何', '为什么', '吗', '呢', '吧', '啊', '哦', '嗯', '啦', '呀',
  '说', '看', '想', '知道', '觉得', '应该', '可能', '因为', '所以', '但是', '如果',
  '已经', '正在', '开始', '结束', '进行', '发生', '出现', '发现', '使用', '通过',
  '关于', '根据', '按照', '为了', '由于', '对于', '被', '把', '让', '给', '向',
  '上', '下', '中', '内', '外', '前', '后', '里', '间', '时', '年', '月', '日',
])

// 常见无意义词
const USELESS_WORDS = new Set([
  '热搜', '热门', '话题', '事件', '最新', '今日', '昨天', '今天', '最新消息',
  '官方', '回应', '声明', '来了', '到底', '竟然', '终于', '刚刚', '刚刚消息',
])

// 提取中英文关键词
export function extractKeywords(text: string, topN: number = 5): string[] {
  const keywords: Map<string, number> = new Map()

  // 中文分词 (简单按字符)
  const chineseChars = text.match(/[一-龥]+/g) || []
  for (const phrase of chineseChars) {
    // 提取 2-4 字词组合
    for (let len = 2; len <= 4 && len <= phrase.length; len++) {
      for (let i = 0; i <= phrase.length - len; i++) {
        const word = phrase.slice(i, i + len)
        if (STOP_WORDS.has(word) || USELESS_WORDS.has(word)) continue
        if (word.length < 2) continue
        keywords.set(word, (keywords.get(word) || 0) + 1)
      }
    }
  }

  // 英文分词
  const englishWords = text.match(/[a-zA-Z]{2,}/g) || []
  for (const word of englishWords) {
    const lower = word.toLowerCase()
    if (STOP_WORDS.has(lower)) continue
    keywords.set(word, (keywords.get(word) || 0) + 1)
  }

  // 数字和特殊符号组合
  const numbers = text.match(/#[一-龥a-zA-Z0-9]+/g) || []
  for (const num of numbers) {
    const clean = num.replace(/^#/, '')
    if (clean.length >= 2) {
      keywords.set(clean, (keywords.get(clean) || 0) + 2) // 话题标签权重更高
    }
  }

  // 排序取 topN
  return Array.from(keywords.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word]) => word)
}

// 计算文本相似度 (基于词重叠)
function textSimilarity(text1: string, text2: string): number {
  const words1 = new Set(extractKeywords(text1, 10))
  const words2 = new Set(extractKeywords(text2, 10))

  if (words1.size === 0 || words2.size === 0) return 0

  let intersection = 0
  for (const word of words1) {
    if (words2.has(word)) intersection++
  }

  const union = words1.size + words2.size - intersection
  return intersection / union
}

// 简单聚类 - 使用贪心算法
function clusterItems(items: SnapshotItem[], similarityThreshold: number = 0.3): TopicCluster[] {
  const clusters: TopicCluster[] = []
  const used = new Set<string>()

  for (const item of items) {
    if (used.has(item.id)) continue

    // 找相似项
    const similar: SnapshotItem[] = [item]
    used.add(item.id)

    for (const other of items) {
      if (used.has(other.id)) continue
      if (other.source === item.source) continue // 同一来源不聚类

      const sim = textSimilarity(item.title, other.title)
      if (sim >= similarityThreshold) {
        similar.push(other)
        used.add(other.id)
      }
    }

    // 合并为话题
    if (similar.length >= 1) {
      const allTitles = similar.map(i => i.title)
      const primaryTitle = allTitles[0]
      const keywords = extractKeywords(allTitles.join(' '), 8)

      // 计算各来源热度
      const sourceHeat: Record<string, number> = {}
      let totalHeat = 0
      for (const s of similar) {
        const h = parseHeat(s.heat)
        sourceHeat[s.source] = (sourceHeat[s.source] || 0) + h
        totalHeat += h
      }

      clusters.push({
        id: `topic-${clusters.length}`,
        topic: primaryTitle,
        keywords,
        sources: [...new Set(similar.map(s => s.source))],
        items: similar.map(s => ({
          title: s.title,
          url: s.url,
          source: s.source,
          rank: s.rank,
          heat: s.heat || ''
        })),
        totalHeat,
        sourceCount: [...new Set(similar.map(s => s.source))].length,
        sourceHeat
      })
    }
  }

  return clusters
}

// 解析热度值
function parseHeat(heat?: string): number {
  if (!heat) return 0
  const str = heat.replace(/[,亿万亿]/g, '')
  if (str.includes('万')) return parseFloat(str) * 10000
  if (str.includes('亿')) return parseFloat(str) * 100000000
  return parseFloat(str) || 0
}

// 跨平台关联
export function findCrossPlatformTopics(items: SnapshotItem[]): TopicCluster[] {
  // 按来源分组
  const bySource = new Map<string, SnapshotItem[]>()
  for (const item of items) {
    if (!bySource.has(item.source)) {
      bySource.set(item.source, [])
    }
    bySource.get(item.source)!.push(item)
  }

  // 只处理多来源情况
  if (bySource.size < 2) return []

  const clusters: TopicCluster[] = []

  // 比较不同来源的标题
  const sources = Array.from(bySource.keys())

  for (let i = 0; i < sources.length; i++) {
    for (let j = i + 1; j < sources.length; j++) {
      const sourceA = sources[i]
      const sourceB = sources[j]
      const itemsA = bySource.get(sourceA) || []
      const itemsB = bySource.get(sourceB) || []

      for (const itemA of itemsA.slice(0, 20)) {
        for (const itemB of itemsB.slice(0, 20)) {
          const sim = textSimilarity(itemA.title, itemB.title)
          if (sim >= 0.25) {
            // 检查是否已存在于某个 cluster
            let found = clusters.find(c =>
              c.items.some(it => it.source === sourceA && it.title === itemA.title) ||
              c.items.some(it => it.source === sourceB && it.title === itemB.title)
            )

            if (!found) {
              const keywords = extractKeywords(itemA.title + ' ' + itemB.title, 6)
              const heatA = parseHeat(itemA.heat)
              const heatB = parseHeat(itemB.heat)

              found = {
                id: `cross-${sourceA}-${sourceB}-${clusters.length}`,
                topic: keywords[0] || itemA.title.slice(0, 20),
                keywords,
                sources: [sourceA, sourceB],
                items: [
                  { title: itemA.title, url: itemA.url, source: sourceA, rank: itemA.rank, heat: itemA.heat || '' },
                  { title: itemB.title, url: itemB.url, source: sourceB, rank: itemB.rank, heat: itemB.heat || '' }
                ],
                totalHeat: heatA + heatB,
                sourceCount: 2,
                sourceHeat: { [sourceA]: heatA, [sourceB]: heatB }
              }
              clusters.push(found)
            } else {
              // 添加到现有 cluster
              if (!found.items.some(it => it.source === sourceA && it.title === itemA.title)) {
                found.items.push({ title: itemA.title, url: itemA.url, source: sourceA, rank: itemA.rank, heat: itemA.heat || '' })
                found.totalHeat += parseHeat(itemA.heat)
                found.sourceHeat[sourceA] = (found.sourceHeat[sourceA] || 0) + parseHeat(itemA.heat)
              }
              if (!found.items.some(it => it.source === sourceB && it.title === itemB.title)) {
                found.items.push({ title: itemB.title, url: itemB.url, source: sourceB, rank: itemB.rank, heat: itemB.heat || '' })
                found.totalHeat += parseHeat(itemB.heat)
                found.sourceHeat[sourceB] = (found.sourceHeat[sourceB] || 0) + parseHeat(itemB.heat)
              }
              found.sources = [...new Set(found.items.map(it => it.source))]
              found.sourceCount = found.sources.length
            }
          }
        }
      }
    }
  }

  return clusters
}

// 主函数：分析所有话题
export function analyzeTopics(items: SnapshotItem[]): {
  clusters: TopicCluster[]
  crossPlatform: TopicCluster[]
  allKeywords: { word: string; count: number }[]
} {
  // 提取全局关键词
  const keywordCounts = new Map<string, number>()
  for (const item of items) {
    const keywords = extractKeywords(item.title, 5)
    for (const kw of keywords) {
      keywordCounts.set(kw, (keywordCounts.get(kw) || 0) + 1)
    }
  }

  const allKeywords = Array.from(keywordCounts.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 50)

  // 跨平台关联
  const crossPlatform = findCrossPlatformTopics(items)

  // 普通聚类 (排除已在跨平台的)
  const usedIds = new Set<string>()
  for (const cp of crossPlatform) {
    for (const item of cp.items) {
      usedIds.add(`${item.source}-${item.title}`)
    }
  }

  const remainingItems = items.filter(item =>
    !usedIds.has(`${item.source}-${item.title}`)
  )

  const clusters = clusterItems(remainingItems, 0.3)

  // 合并聚类和跨平台，按热度排序
  const allClusters = [...crossPlatform, ...clusters]
    .sort((a, b) => b.totalHeat - a.totalHeat)

  return { clusters: allClusters, crossPlatform, allKeywords }
}
