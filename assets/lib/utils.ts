export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date

  if (Number.isNaN(d.getTime())) {
    return '刚刚'
  }

  const now = new Date()
  const diff = Math.max(0, now.getTime() - d.getTime())
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`

  return d.toLocaleDateString('zh-CN')
}

export function formatNumber(num: number): string {
  if (num >= 100000000) {
    return `${(num / 100000000).toFixed(1)} 亿`
  }

  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)} 万`
  }

  return num.toString()
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return `${text.substring(0, length)}...`
}
