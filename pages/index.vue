<script setup lang="ts">
import Header from '~/components/Header.vue'
import Footer from '~/components/Footer.vue'
import HotList from '~/components/HotList.vue'
import { sources, categories, type HotItem } from '~/assets/lib/sources'
import { formatTime } from '~/assets/lib/utils'

useSeoMeta({
  title: '上升热点 - 聚合全网热点',
  description: '上升热点聚合微博、知乎、抖音、微信、百度、头条等平台热点，帮助你快速浏览全网正在发生的事。',
  ogTitle: '上升热点',
  ogDescription: '聚合全网热点，快速看清正在发生的事。',
})

const { data: hotData, pending, error, refresh } = await useFetch('/api/all', {
  default: () => ({ data: [], count: 0, updatedAt: '' }),
})

const displayList = computed<HotItem[]>(() => hotData.value?.data?.slice(0, 16) || [])
const topStory = computed(() => displayList.value[0])
const updatedAt = computed(() => hotData.value?.updatedAt ? formatTime(hotData.value.updatedAt) : '刚刚')
const sourceCount = computed(() => new Set(displayList.value.map(item => item.source)).size)
</script>

<template>
  <div>
    <Header />

    <main>
      <section class="hero">
        <div class="container hero-inner">
          <div class="hero-copy">
            <p class="eyebrow">全网热点聚合</p>
            <h1>上升热点</h1>
            <p class="hero-desc">
              把分散在各个平台的热搜、热议和新鲜事收进一个页面，少一点来回切换，多一点判断力。
            </p>

            <div class="hero-actions">
              <NuxtLink to="/hot" class="btn">查看总榜</NuxtLink>
              <button class="btn btn-ghost" type="button" @click="refresh()">刷新数据</button>
            </div>
          </div>

          <div class="hero-panel">
            <div class="panel-label">当前头条</div>
            <NuxtLink v-if="topStory" :to="topStory.url" class="top-story" target="_blank">
              <span class="top-rank">1</span>
              <span>{{ topStory.title }}</span>
            </NuxtLink>
            <p v-else class="muted">正在等待热榜数据。</p>
          </div>
        </div>
      </section>

      <section class="container content-body">
        <div class="stats-grid">
          <div class="stat-card">
            <strong>{{ hotData?.count || displayList.length }}</strong>
            <span>条热点</span>
          </div>
          <div class="stat-card">
            <strong>{{ sourceCount || sources.length }}</strong>
            <span>个来源</span>
          </div>
          <div class="stat-card">
            <strong>{{ updatedAt }}</strong>
            <span>最近更新</span>
          </div>
        </div>

        <div class="source-strip">
          <NuxtLink
            v-for="source in sources.slice(0, 8)"
            :key="source.id"
            :to="`/n/${source.id}`"
            class="source-chip"
            :style="{ '--source-color': source.color }"
          >
            <span>{{ source.icon }}</span>
            <span>{{ source.name }}</span>
          </NuxtLink>
        </div>

        <div class="layout-grid">
          <section>
            <div class="section-header">
              <div>
                <h2 class="section-title">实时热榜</h2>
                <p class="section-desc">跨平台合并排序，优先展示正在升温的话题。</p>
              </div>
              <NuxtLink to="/hot" class="section-more">完整榜单 →</NuxtLink>
            </div>

            <div class="card">
              <div v-if="pending" class="loading-state">正在加载热榜...</div>
              <div v-else-if="error" class="empty-state">
                <strong>接口暂时不可用</strong>
                <span>已保留页面结构，请检查服务端日志或 API 配置。</span>
              </div>
              <HotList v-else :items="displayList" :show-source="true" :show-time="true" />
            </div>
          </section>

          <aside class="side-column">
            <section class="card compact-card">
              <h2 class="section-title">分类浏览</h2>
              <div class="category-list">
                <NuxtLink
                  v-for="category in categories"
                  :key="category.id"
                  :to="`/c/${category.id}`"
                  class="category-link"
                >
                  <span>{{ category.icon }}</span>
                  <span>{{ category.name }}</span>
                </NuxtLink>
              </div>
            </section>

            <section class="card compact-card">
              <h2 class="section-title">更多来源</h2>
              <div class="mini-source-list">
                <NuxtLink
                  v-for="source in sources.slice(8)"
                  :key="source.id"
                  :to="`/n/${source.id}`"
                >
                  <span>{{ source.icon }} {{ source.name }}</span>
                  <small>{{ source.description }}</small>
                </NuxtLink>
              </div>
            </section>
          </aside>
        </div>

        <div class="ad-placeholder">广告位 (AdSense)</div>
      </section>
    </main>

    <Footer />
  </div>
</template>
