export interface HotItem {
  id: string
  title: string
  url: string
  source: string
  rank: number
  heat?: string
  category: string
  tags?: string[]
  createdAt: string
}

export interface HotSource {
  id: string
  name: string
  slug: string
  url: string
  category: string
  icon: string
  color: string
  description: string
}

export const sources: HotSource[] = [
  { id: 'weibo', name: '微博', slug: 'weibo', url: '/n/weibo', category: 'social', icon: '🔥', color: '#e6162d', description: '实时热搜与社会话题' },
  { id: 'zhihu', name: '知乎', slug: 'zhihu', url: '/n/zhihu', category: 'community', icon: '💬', color: '#0066cc', description: '问答社区高关注讨论' },
  { id: 'douyin', name: '抖音', slug: 'douyin', url: '/n/douyin', category: 'video', icon: '🎬', color: '#161823', description: '短视频热门趋势' },
  { id: 'qq-news', name: '腾讯新闻', slug: 'qq-news', url: '/n/qq-news', category: 'news', icon: '🔵', color: '#ff4d4f', description: '腾讯新闻热点资讯' },
  { id: 'sspai', name: '少数派', slug: 'sspai', url: '/n/sspai', category: 'developer', icon: '✍️', color: '#1e90ff', description: '效率工具与数字生活' },
  { id: 'jianshu', name: '简书', slug: 'jianshu', url: '/n/jianshu', category: 'community', icon: '📝', color: '#f09109', description: '写作社区与生活记录' },
  { id: 'baidu', name: '百度', slug: 'baidu', url: '/n/baidu', category: 'search', icon: '🔎', color: '#2932e1', description: '搜索热榜与全网关注' },
  { id: 'toutiao', name: '头条', slug: 'toutiao', url: '/n/toutiao', category: 'news', icon: '📰', color: '#ff4d4f', description: '资讯平台热门新闻' },
  { id: '52pojie', name: '吾爱破解', slug: '52pojie', url: '/n/52pojie', category: 'developer', icon: '🔧', color: '#1a7fc7', description: '破解技术交流社区' },
  { id: 'hellogithub', name: 'HelloGitHub', slug: 'hellogithub', url: '/n/hellogithub', category: 'developer', icon: '📙', color: '#ff6a00', description: 'GitHub 开源项目月刊' },
  { id: 'quenytool', name: 'GitHub 热榜', slug: 'quenytool', url: '/n/quenytool', category: 'developer', icon: '⭐', color: '#f09109', description: 'GitHub 趋势热榜每日精选' },
  { id: 'douban-group', name: '豆瓣小组', slug: 'douban-group', url: '/n/douban-group', category: 'community', icon: '🎭', color: '#007722', description: '豆瓣小组讨论话题' },
  { id: 'douban-movie', name: '豆瓣电影', slug: 'douban-movie', url: '/n/douban-movie', category: 'ent', icon: '🎬', color: '#ff4f00', description: '豆瓣电影热榜与影评' },
  { id: 'github', name: 'GitHub', slug: 'github', url: '/n/github', category: 'developer', icon: '⌘', color: '#333333', description: '开源项目趋势' },
  { id: 'bilibili', name: 'B 站', slug: 'bilibili', url: '/n/bilibili', category: 'video', icon: '📺', color: '#fb7299', description: '视频社区热门内容' },
  { id: 'tieba', name: '贴吧', slug: 'tieba', url: '/n/tieba', category: 'community', icon: '💬', color: '#4575c0', description: '兴趣社区热帖' },
  { id: 'hupu', name: '虎扑', slug: 'hupu', url: '/n/hupu', category: 'sports', icon: '🏀', color: '#c80811', description: '体育与直男社区热点' },
  { id: 'juejin', name: '掘金', slug: 'juejin', url: '/n/juejin', category: 'developer', icon: '💎', color: '#1e80ff', description: '技术博客与开发者社区' },
  { id: '36kr', name: '36氪', slug: '36kr', url: '/n/36kr', category: 'news', icon: '⚡', color: '#f晓5d00', description: '科技商业资讯与创业趋势' },
]

export const categories = [
  { id: 'news', name: '综合', icon: '📰' },
  { id: 'tech', name: '科技', icon: '💻' },
  { id: 'ent', name: '娱乐', icon: '🎭' },
  { id: 'community', name: '社区', icon: '💬' },
  { id: 'shopping', name: '消费', icon: '🛒' },
  { id: 'finance', name: '财经', icon: '💹' },
  { id: 'developer', name: '开发', icon: '⚙' },
  { id: 'brief', name: '简报', icon: '📌' },
  { id: 'ai', name: 'AI', icon: '🤖' },
]

export function getSourceById(id: string): HotSource | undefined {
  return sources.find(s => s.id === id || s.slug === id)
}

export function getSourceColor(source: string): string {
  const s = getSourceById(source)
  return s?.color || '#1890ff'
}
