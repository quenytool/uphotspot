/**
 * 本地全文搜索索引
 * 基于 Fuse.js 实现模糊搜索
 */

import Fuse from 'fuse.js'
import { getRecentSnapshots, type SnapshotItem } from './snapshotStorage'

interface SearchItem {
  id: string
  title: string
  url: string
  source: string
  rank: number
  heat: string
  category: string
  createdAt: string
  date: string
}

interface SearchResult {
  id: string
  title: string
  url: string
  source: string
  rank: number
  heat: string
  category: string
  createdAt: string
  score: number
}

let fuseInstance: Fuse<SearchItem> | null = null
let lastIndexTime = 0
const INDEX_TTL = 5 * 60 * 1000 // 5分钟缓存

const fuseOptions: Fuse.IFuseOptions<SearchItem> = {
  keys: [
    { name: 'title', weight: 0.7 },
    { name: 'source', weight: 0.2 },
    { name: 'category', weight: 0.1 },
  ],
  threshold: 0.4,
  includeScore: true,
  minMatchCharLength: 2,
  shouldSort: true,
  ignoreLocation: true,
}

async function buildIndex(): Promise<Fuse<SearchItem>> {
  const snapshots = await getRecentSnapshots(7)
  const items: SearchItem[] = []

  for (const snapshot of snapshots) {
    for (const [source, sourceData] of Object.entries(snapshot.sources)) {
      if (!sourceData) continue
      for (const item of sourceData.data) {
        items.push({
          ...item,
          date: snapshot.date,
        })
      }
    }
  }

  // 去重：同标题同来源只保留最新
  const seen = new Map<string, SearchItem>()
  for (const item of items) {
    const key = `${item.source}-${item.title}`
    if (!seen.has(key)) {
      seen.set(key, item)
    }
  }

  return new Fuse(Array.from(seen.values()), fuseOptions)
}

export async function getSearchIndex(): Promise<Fuse<SearchItem> | null> {
  try {
    const now = Date.now()
    if (!fuseInstance || now - lastIndexTime > INDEX_TTL) {
      fuseInstance = await buildIndex()
      lastIndexTime = now
    }
    return fuseInstance
  } catch (e) {
    console.error('Failed to build search index:', e)
    return null
  }
}

export async function search(query: string, limit = 20): Promise<SearchResult[]> {
  if (!query || query.length < 2) {
    return []
  }

  const fuse = await getSearchIndex()
  if (!fuse) {
    return []
  }

  const results = fuse.search(query, { limit })

  return results.map(r => ({
    ...r.item,
    score: r.score ?? 0,
  }))
}

// 手动刷新索引
export async function refreshIndex(): Promise<void> {
  fuseInstance = await buildIndex()
  lastIndexTime = Date.now()
}
