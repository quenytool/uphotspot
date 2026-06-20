import { getRecentSnapshots, type Snapshot } from '../utils/snapshotStorage'

interface PlatformStats {
  source: string
  count: number
  totalHeat: number
  avgHeat: number
  percentage: number
}

interface HeatDataPoint {
  time: string
  totalHeat: number
  itemCount: number
}

interface CrawlerStatus {
  source: string
  lastRun: string | null
  status: 'running' | 'success' | 'failed' | 'never'
  itemCount: number
}

export default defineEventHandler(async () => {
  const snapshots = await getRecentSnapshots(7)

  // 计算平台分布
  const platformHeat: Record<string, { count: number; totalHeat: number }> = {}
  let grandTotalHeat = 0
  let totalItems = 0

  for (const snapshot of snapshots) {
    for (const [source, sourceData] of Object.entries(snapshot.sources)) {
      if (!sourceData) continue

      if (!platformHeat[source]) {
        platformHeat[source] = { count: 0, totalHeat: 0 }
      }

      for (const item of sourceData.data) {
        const heat = parseHeat(item.heat)
        platformHeat[source].count++
        platformHeat[source].totalHeat += heat
        grandTotalHeat += heat
        totalItems++
      }
    }
  }

  const platforms: PlatformStats[] = Object.entries(platformHeat)
    .map(([source, data]) => ({
      source,
      count: data.count,
      totalHeat: data.totalHeat,
      avgHeat: data.count > 0 ? data.totalHeat / data.count : 0,
      percentage: grandTotalHeat > 0 ? (data.totalHeat / grandTotalHeat) * 100 : 0
    }))
    .sort((a, b) => b.totalHeat - a.totalHeat)

  // 热度曲线 (按天聚合)
  const dailyHeat: Record<string, { totalHeat: number; itemCount: number }> = {}

  for (const snapshot of snapshots) {
    const date = snapshot.date
    if (!dailyHeat[date]) {
      dailyHeat[date] = { totalHeat: 0, itemCount: 0 }
    }

    for (const sourceData of Object.values(snapshot.sources)) {
      if (!sourceData) continue
      for (const item of sourceData.data) {
        dailyHeat[date].totalHeat += parseHeat(item.heat)
        dailyHeat[date].itemCount++
      }
    }
  }

  const heatCurve: HeatDataPoint[] = Object.entries(dailyHeat)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([time, data]) => ({
      time,
      totalHeat: data.totalHeat,
      itemCount: data.itemCount
    }))

  // 每小时热度趋势 (从最新快照)
  const hourlyHeat: HeatDataPoint[] = []
  if (snapshots.length > 0) {
    const latest = snapshots[snapshots.length - 1]
    const date = latest.date

    for (const [source, sourceData] of Object.entries(latest.sources)) {
      if (!sourceData) continue
      for (const item of sourceData.data) {
        const heat = parseHeat(item.heat)
        // 模拟小时数据 (实际应该按小时存储)
        hourlyHeat.push({
          time: `${source}`,
          totalHeat: heat,
          itemCount: 1
        })
      }
    }
  }

  // 爬虫运行状态 (基于快照文件)
  const crawlerStatus: CrawlerStatus[] = []
  const sources = ['weibo', 'zhihu', 'douyin', 'weixin', 'baidu', 'toutiao', '52pojie', 'hellogithub', 'douban', 'github', 'bilibili', 'hupu', 'tieba', 'juejin', '36kr']

  for (const source of sources) {
    const sourceSnapshots = snapshots.filter(s => s.sources[source])
    const lastSnapshot = sourceSnapshots[sourceSnapshots.length - 1]

    let status: CrawlerStatus['status'] = 'never'
    let itemCount = 0

    if (lastSnapshot) {
      const sourceData = lastSnapshot.sources[source]
      if (sourceData) {
        itemCount = sourceData.count
        status = 'success'
      }
    }

    crawlerStatus.push({
      source,
      lastRun: lastSnapshot?.timestamp || null,
      status,
      itemCount
    })
  }

  return {
    updatedAt: new Date().toISOString(),
    stats: {
      totalItems,
      totalHeat: grandTotalHeat,
      avgHeat: totalItems > 0 ? grandTotalHeat / totalItems : 0,
      snapshotDays: snapshots.length
    },
    platforms,
    heatCurve,
    hourlyBreakdown: platforms.slice(0, 6).map(p => ({
      source: p.source,
      heat: p.totalHeat,
      percentage: p.percentage
    })),
    crawlerStatus
  }
})

function parseHeat(heat?: string): number {
  if (!heat) return 0
  const str = heat.replace(/[,亿万亿]/g, '')
  if (str.includes('万')) return parseFloat(str) * 10000
  if (str.includes('亿')) return parseFloat(str) * 100000000
  return parseFloat(str) || 0
}
