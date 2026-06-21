import { generateDailyReport, type DailyReport } from '../utils/dailyReport'
import { getRecentSnapshots } from '../utils/snapshotStorage'

export default defineEventHandler(async (event): Promise<DailyReport | { error: string }> => {
  const query = getQuery(event)
  const date = query.date as string | undefined

  // 如果没有指定日期，使用今天的快照
  const targetDate = date || new Date().toISOString().split('T')[0]

  let report = await generateDailyReport(targetDate)

  // 如果指定日期没有快照，回退到最近可用的快照
  if (!report) {
    const snapshots = await getRecentSnapshots(7)
    if (snapshots.length > 0) {
      // 按日期排序，取最新的
      snapshots.sort((a, b) => b.date.localeCompare(a.date))
      const latestSnapshot = snapshots[0]
      report = await generateDailyReport(latestSnapshot.date)
    }
  }

  if (!report) {
    // 如果没有任何快照，返回错误
    throw createError({
      statusCode: 404,
      message: '暂无快照数据，请先运行爬虫生成数据。'
    })
  }

  return report
})
