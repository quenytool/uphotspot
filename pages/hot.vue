<script setup lang="ts">
import Header from '~/components/Header.vue'
import Footer from '~/components/Footer.vue'
import HotList from '~/components/HotList.vue'
import type { HotItem } from '~/assets/lib/sources'

useSeoMeta({
  title: '总榜 - 上升热点',
  description: '查看跨平台聚合后的实时热点总榜。',
})

const { data, pending } = await useFetch('/api/all', {
  default: () => ({ data: [] as HotItem[], count: 0, updatedAt: '' }),
})
</script>

<template>
  <div>
    <Header />
    <main class="container">
      <div class="content-body">
        <div class="page-header">
          <h1 class="page-title">总榜</h1>
          <p class="page-desc">跨平台合并展示，快速扫过当前最热的话题。</p>
        </div>

        <div class="card">
          <div v-if="pending" class="loading-state">正在加载热榜...</div>
          <HotList v-else :items="data.data" :show-source="true" :show-time="true" />
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>
