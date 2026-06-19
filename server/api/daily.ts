import { generateDailyReport, type DailyReport } from '../utils/dailyReport'

export default defineEventHandler(async (event): Promise<DailyReport | { error: string }> => {
  const query = getQuery(event)
  const date = query.date as string | undefined

  // 如果没有指定日期，使用今天的快照
  const targetDate = date || new Date().toISOString().split('T')[0]

  const report = await generateDailyReport(targetDate)

  if (!report) {
    // 如果没有指定日期的快照，返回错误
    if (!date) {
      throw createError({
        statusCode: 404,
        message: '今日快照尚未生成，请稍后再试或指定其他日期。'
      })
    }
    throw createError({
      statusCode: 404,
      message: `日期 ${date} 的快照不存在。`
    })
  }

  return report
})
