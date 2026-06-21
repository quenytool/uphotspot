/**
 * 历史快照存储
 * 存储每日热榜快照，用于计算趋势
 */

import fs from 'fs/promises'
import path from 'path'

function getSnapshotDir(): string {
  if (process.env.DATA_DIR) {
    // 禁止绝对路径和父目录跳转
    if (path.isAbsolute(process.env.DATA_DIR) || process.env.DATA_DIR.includes('..')) {
      return path.join(process.cwd(), 'data/snapshots')
    }
    return process.env.DATA_DIR
  }
  // 默认为项目根目录下的 data/snapshots
  return path.join(process.cwd(), 'data/snapshots')
}

const SNAPSHOT_DIR = getSnapshotDir()

export interface SnapshotItem {
  id: string
  title: string
  url: string
  source: string
  rank: number
  heat?: string
  category: string
  createdAt: string
}

export interface Snapshot {
  date: string
  timestamp: string
  sources: Record<string, {
    data: SnapshotItem[]
    count: number
  }>
}

async function ensureDir() {
  try {
    await fs.mkdir(SNAPSHOT_DIR, { recursive: true })
  } catch {}
}

export async function saveSnapshot(source: string, data: SnapshotItem[]): Promise<void> {
  await ensureDir()
  const today = new Date().toISOString().split('T')[0]
  // 白名单校验 source
  if (!/^[a-z0-9]+$/.test(source)) return
  const safeSource = source.replace(/\.\./g, '')
  const filePath = path.join(SNAPSHOT_DIR, `${today}.json`)

  let snapshot: Snapshot
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    snapshot = JSON.parse(content)
  } catch {
    snapshot = {
      date: today,
      timestamp: new Date().toISOString(),
      sources: {}
    }
  }

  snapshot.sources[source] = {
    data: data.slice(0, 100), // 最多保存100条
    count: data.length
  }
  snapshot.timestamp = new Date().toISOString()

  await fs.writeFile(filePath, JSON.stringify(snapshot, null, 2), 'utf-8')
}

export async function getSnapshot(date: string): Promise<Snapshot | null> {
  // 防止路径遍历攻击
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null
  }
  const safeName = date.replace(/\.\./g, '')
  const filePath = path.join(SNAPSHOT_DIR, `${safeName}.json`)
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content)
  } catch {
    return null
  }
}

export async function getRecentSnapshots(days: number = 7): Promise<Snapshot[]> {
  await ensureDir()
  const snapshots: Snapshot[] = []
  const now = new Date()

  for (let i = 0; i < days; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    const snapshot = await getSnapshot(dateStr)
    if (snapshot) {
      snapshots.push(snapshot)
    }
  }

  return snapshots
}

export interface TrendItem extends SnapshotItem {
  risingSpeed: number      // 上升速度 (排名变化/天)
  duration: number         // 在榜天数
  peakRank: number         // 历史最高排名
  trendScore: number       // 综合趋势得分
  firstSeen: string        // 首次出现时间
  lastSeen: string         // 最后出现时间
}

export async function calculateTrends(source?: string, days: number = 7): Promise<TrendItem[]> {
  const snapshots = await getRecentSnapshots(days)
  if (snapshots.length < 2) return []

  // 按时间排序 (旧到新)
  snapshots.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  // 收集所有出现过的 items，追踪其历史
  const itemHistory = new Map<string, {
    item: SnapshotItem
    ranks: { date: string; rank: number }[]
    firstSeen: string
    lastSeen: string
  }>()

  for (const snapshot of snapshots) {
    const sources = source ? { [source]: snapshot.sources[source] } : snapshot.sources
    for (const [src, sourceData] of Object.entries(sources)) {
      if (!sourceData) continue
      for (const item of sourceData.data) {
        const key = `${src}-${item.title}`
        if (!itemHistory.has(key)) {
          itemHistory.set(key, {
            item: { ...item, source: src },
            ranks: [],
            firstSeen: snapshot.date,
            lastSeen: snapshot.date
          })
        }
        const history = itemHistory.get(key)!
        history.ranks.push({ date: snapshot.date, rank: item.rank })
        history.lastSeen = snapshot.date
      }
    }
  }

  // 计算趋势
  const trends: TrendItem[] = []

  for (const [key, history] of itemHistory) {
    if (history.ranks.length < 1) continue

    const ranks = history.ranks
    const latestRank = ranks[ranks.length - 1].rank
    const firstRank = ranks[0].rank

    // 计算上升速度: (首次排名 - 最新排名) / 天数
    // 排名数字越小越热，所以排名下降 = 上升
    const duration = ranks.length
    const rankChange = firstRank - latestRank
    const risingSpeed = duration > 1 ? rankChange / (duration - 1) : 0

    // 峰顶排名 (数字最小 = 最高)
    const peakRank = Math.min(...ranks.map(r => r.rank))

    // 综合趋势得分
    // 考虑: 上升速度(40%) + 在榜时长(30%) + 当前热度(30%)
    const heatNum = parseHeatNumber(history.item.heat)
    const heatScore = Math.min(heatNum / 1000000, 1) // 归一化
    const durationScore = Math.min(duration / 7, 1)  // 归一化到一周
    const trendScore = risingSpeed * 0.4 + durationScore * 0.3 + heatScore * 0.3

    trends.push({
      ...history.item,
      risingSpeed: Math.round(risingSpeed * 10) / 10,
      duration,
      peakRank,
      trendScore: Math.round(trendScore * 100) / 100,
      firstSeen: history.firstSeen,
      lastSeen: history.lastSeen
    })
  }

  // 过滤掉只在某一天出现的噪音
  const significant = trends.filter(t => t.duration >= 1)

  // 按趋势得分排序
  return significant.sort((a, b) => b.trendScore - a.trendScore)
}

function parseHeatNumber(heat?: string): number {
  if (!heat) return 0
  const str = heat.replace(/[,亿万亿]/g, '')
  if (str.includes('万')) return parseFloat(str) * 10000
  if (str.includes('亿')) return parseFloat(str) * 100000000
  return parseFloat(str) || 0
}
