<script setup lang="ts">
import Header from '~/components/Header.vue'
import Footer from '~/components/Footer.vue'
import SourceTag from '~/components/SourceTag.vue'

useSeoMeta({
  title: '看板 - 上升热点',
  description: '查看热榜更新动态和平台趋势。',
})

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

interface DashboardData {
  updatedAt: string
  stats: {
    totalItems: number
    totalHeat: number
    avgHeat: number
    snapshotDays: number
  }
  platforms: PlatformStats[]
  heatCurve: HeatDataPoint[]
  hourlyBreakdown: { source: string; heat: number; percentage: number }[]
  crawlerStatus: CrawlerStatus[]
}

const { data, pending, refresh } = await useFetch<DashboardData>('/api/dashboard', {
  default: () => ({
    updatedAt: '',
    stats: { totalItems: 0, totalHeat: 0, avgHeat: 0, snapshotDays: 0 },
    platforms: [],
    heatCurve: [],
    hourlyBreakdown: [],
    crawlerStatus: []
  })
})

const maxHeat = computed(() => {
  if (!data.value?.hourlyBreakdown?.length) return 1
  return Math.max(...data.value.hourlyBreakdown.map(h => h.heat), 1)
})

function formatHeat(heat: number): string {
  if (heat >= 100000000) return `${(heat / 100000000).toFixed(1)}亿`
  if (heat >= 10000) return `${(heat / 10000).toFixed(1)}万`
  return heat.toLocaleString()
}

function formatTime(isoString: string | null): string {
  if (!isoString) return '从未'
  const date = new Date(isoString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return '刚刚'
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  return `${days}天前`
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'success': return '#52c41a'
    case 'running': return '#1890ff'
    case 'failed': return '#ff4d4f'
    default: return '#d9d9d9'
  }
}

const platformColors: Record<string, string> = {
  weibo: '#e6162d',
  zhihu: '#0066cc',
  douyin: '#161823',
  'qq-news': '#ff4d4f',
  baidu: '#2932e1',
  toutiao: '#ff4d4f',
  '52pojie': '#1a7fc7',
  'douban-group': '#007722',
  'douban-movie': '#ff4f00',
  github: '#333333',
  bilibili: '#fb7299',
  tieba: '#4575c0',
  hupu: '#c80811',
  sspai: '#1e90ff',
  jianshu: '#f09109',
}
</script>

<template>
  <div>
    <Header />
    <main class="container">
      <div class="content-body">
        <div class="page-header">
          <h1 class="page-title">看板</h1>
          <p class="page-desc">观察热榜更新频率、来源分布和趋势变化。</p>
          <button class="refresh-btn" @click="refresh()">
            🔄 刷新
          </button>
        </div>

        <div v-if="pending" class="loading-state card">
          <div class="spinner"></div>
          <span>正在加载看板数据...</span>
        </div>

        <template v-else-if="data">
          <!-- 统计概览 -->
          <div class="stats-row">
            <div class="stat-card">
              <div class="stat-icon">📊</div>
              <div class="stat-info">
                <strong>{{ data.stats.totalItems.toLocaleString() }}</strong>
                <span>总条目</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🔥</div>
              <div class="stat-info">
                <strong>{{ formatHeat(data.stats.totalHeat) }}</strong>
                <span>总热度</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">📈</div>
              <div class="stat-info">
                <strong>{{ formatHeat(data.stats.avgHeat) }}</strong>
                <span>平均热度</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">📅</div>
              <div class="stat-info">
                <strong>{{ data.stats.snapshotDays }}</strong>
                <span>快照天数</span>
              </div>
            </div>
          </div>

          <div class="dashboard-grid">
            <!-- 平台占比 -->
            <section class="card platform-card">
              <h3 class="card-title">📱 平台热度占比</h3>
              <div class="platform-chart">
                <div
                  v-for="platform in data.platforms"
                  :key="platform.source"
                  class="platform-bar-item"
                >
                  <div class="platform-info">
                    <SourceTag :source="platform.source" />
                    <span class="platform-heat">{{ formatHeat(platform.totalHeat) }}</span>
                    <span class="platform-pct">{{ platform.percentage.toFixed(1) }}%</span>
                  </div>
                  <div class="platform-bar-track">
                    <div
                      class="platform-bar-fill"
                      :style="{
                        width: `${platform.percentage}%`,
                        background: platformColors[platform.source] || '#1890ff'
                      }"
                    ></div>
                  </div>
                </div>
              </div>

              <!-- 饼图 -->
              <div class="pie-chart-wrap">
                <div class="pie-chart">
                  <div
                    v-for="(platform, idx) in data.platforms.slice(0, 6)"
                    :key="platform.source"
                    class="pie-slice"
                    :style="{
                      '--pct': platform.percentage,
                      '--color': platformColors[platform.source] || '#1890ff',
                      '--offset': data.platforms.slice(0, idx).reduce((sum, p) => sum + p.percentage, 0)
                    }"
                  ></div>
                </div>
                <div class="pie-legend">
                  <div
                    v-for="platform in data.platforms.slice(0, 6)"
                    :key="platform.source"
                    class="legend-item"
                  >
                    <span
                      class="legend-dot"
                      :style="{ background: platformColors[platform.source] || '#1890ff' }"
                    ></span>
                    <span class="legend-label">{{ platform.source }}</span>
                  </div>
                </div>
              </div>
            </section>

            <!-- 热度曲线 -->
            <section class="card heat-curve-card">
              <h3 class="card-title">📈 热度趋势 (7天)</h3>
              <div class="heat-curve">
                <div class="curve-y-axis">
                  <span>高</span>
                  <span>中</span>
                  <span>低</span>
                </div>
                <div class="curve-chart">
                  <div
                    v-for="(point, idx) in data.heatCurve"
                    :key="point.time"
                    class="curve-bar-wrap"
                  >
                    <div
                      class="curve-bar"
                      :style="{
                        height: `${(point.totalHeat / maxHeat) * 100}%`,
                        background: idx === data.heatCurve.length - 1 ? '#1890ff' : '#91caff'
                      }"
                    >
                      <span class="curve-tooltip">{{ formatHeat(point.totalHeat) }}</span>
                    </div>
                    <span class="curve-label">{{ point.time.slice(5) }}</span>
                  </div>
                </div>
              </div>
              <div class="curve-stats">
                <span>共 {{ data.heatCurve.length }} 天数据</span>
                <span>峰值: {{ formatHeat(Math.max(...data.heatCurve.map(p => p.totalHeat))) }}</span>
              </div>
            </section>

            <!-- 平台热力图 -->
            <section class="card heatmap-card">
              <h3 class="card-title">🔥 各平台热度分布</h3>
              <div class="heatmap">
                <div class="heatmap-row heatmap-header">
                  <span>平台</span>
                  <span>热度条</span>
                  <span>数值</span>
                </div>
                <div
                  v-for="platform in data.hourlyBreakdown"
                  :key="platform.source"
                  class="heatmap-row"
                >
                  <SourceTag :source="platform.source" />
                  <div class="heatmap-bar-wrap">
                    <div
                      class="heatmap-bar"
                      :style="{
                        width: `${(platform.heat / maxHeat) * 100}%`,
                        background: platformColors[platform.source] || '#1890ff'
                      }"
                    ></div>
                  </div>
                  <span class="heatmap-value">{{ formatHeat(platform.heat) }}</span>
                </div>
              </div>
            </section>

            <!-- 爬虫状态 -->
            <section class="card crawler-card">
              <h3 class="card-title">⚙️ 爬虫运行状态</h3>
              <div class="crawler-list">
                <div
                  v-for="crawler in data.crawlerStatus"
                  :key="crawler.source"
                  class="crawler-item"
                >
                  <div class="crawler-info">
                    <span
                      class="crawler-status-dot"
                      :style="{ background: getStatusColor(crawler.status) }"
                    ></span>
                    <SourceTag :source="crawler.source" />
                  </div>
                  <div class="crawler-meta">
                    <span class="crawler-items">{{ crawler.itemCount }} 条</span>
                    <span class="crawler-time">{{ formatTime(crawler.lastRun) }}</span>
                  </div>
                </div>
              </div>
              <div class="crawler-summary">
                <span class="summary-item">
                  <span class="summary-dot" style="background: #52c41a"></span>
                  成功 {{ data.crawlerStatus.filter(c => c.status === 'success').length }}
                </span>
                <span class="summary-item">
                  <span class="summary-dot" style="background: #d9d9d9"></span>
                  未运行 {{ data.crawlerStatus.filter(c => c.status === 'never').length }}
                </span>
              </div>
            </section>
          </div>

          <div class="update-time">
            最后更新: {{ formatTime(data.updatedAt) }}
          </div>
        </template>
      </div>
    </main>
    <Footer />
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.refresh-btn {
  margin-left: auto;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border, #e5e5e5);
  background: var(--card-bg, #fff);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.refresh-btn:hover {
  background: var(--hover-bg, #f5f5f5);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid var(--border, #e5e5e5);
  border-top-color: var(--primary, #1890ff);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: var(--card-bg, #fff);
  border: 1px solid var(--border, #e5e5e5);
  border-radius: 8px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-info strong {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary, #1890ff);
}

.stat-info span {
  font-size: 0.75rem;
  color: var(--text-secondary, #666);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border, #e5e5e5);
}

/* Platform Card */
.platform-chart {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.platform-bar-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.platform-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.platform-heat {
  margin-left: auto;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text, #333);
}

.platform-pct {
  font-size: 0.75rem;
  color: var(--text-secondary, #666);
  min-width: 3.5rem;
  text-align: right;
}

.platform-bar-track {
  height: 0.5rem;
  background: var(--hover-bg, #f5f5f5);
  border-radius: 4px;
  overflow: hidden;
}

.platform-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.pie-chart-wrap {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border, #e5e5e5);
}

.pie-chart {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    #e5e5e5 0deg,
    #e5e5e5 360deg
  );
  position: relative;
  flex-shrink: 0;
}

.pie-slice {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(
    from calc(var(--offset) * 3.6deg),
    var(--color) 0deg,
    var(--color) calc(var(--pct) * 3.6deg),
    transparent calc(var(--pct) * 3.6deg)
  );
}

.pie-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
}

.legend-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
}

/* Heat Curve Card */
.heat-curve {
  display: flex;
  gap: 0.5rem;
  height: 150px;
  margin-bottom: 1rem;
}

.curve-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 0.625rem;
  color: var(--text-tertiary, #999);
  padding: 0.25rem 0;
}

.curve-chart {
  flex: 1;
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  padding-bottom: 1.5rem;
}

.curve-bar-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.curve-bar {
  width: 100%;
  max-width: 40px;
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
  position: relative;
  margin-top: auto;
}

.curve-tooltip {
  position: absolute;
  top: -1.5rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.625rem;
  color: var(--text-secondary, #666);
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s;
}

.curve-bar:hover .curve-tooltip {
  opacity: 1;
}

.curve-label {
  font-size: 0.625rem;
  color: var(--text-tertiary, #999);
  margin-top: 0.5rem;
}

.curve-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--text-secondary, #666);
}

/* Heatmap Card */
.heatmap {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.heatmap-row {
  display: grid;
  grid-template-columns: 80px 1fr 80px;
  align-items: center;
  gap: 0.75rem;
}

.heatmap-header {
  font-size: 0.75rem;
  color: var(--text-secondary, #666);
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border, #e5e5e5);
}

.heatmap-bar-wrap {
  height: 1rem;
  background: var(--hover-bg, #f5f5f5);
  border-radius: 4px;
  overflow: hidden;
}

.heatmap-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.heatmap-value {
  font-size: 0.75rem;
  color: var(--text-secondary, #666);
  text-align: right;
}

/* Crawler Card */
.crawler-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.crawler-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: var(--hover-bg, #f5f5f5);
  border-radius: 6px;
}

.crawler-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.crawler-status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
}

.crawler-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 0.625rem;
  color: var(--text-secondary, #666);
}

.crawler-items {
  font-weight: 500;
}

.crawler-summary {
  display: flex;
  gap: 1.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border, #e5e5e5);
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-secondary, #666);
}

.summary-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
}

.update-time {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.75rem;
  color: var(--text-tertiary, #999);
}

@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .crawler-list {
    grid-template-columns: 1fr;
  }
}
</style>
