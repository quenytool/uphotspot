<script setup lang="ts">
import Header from '~/components/Header.vue'
import Footer from '~/components/Footer.vue'
import HotList from '~/components/HotList.vue'
import { getSourceById, type HotItem } from '~/assets/lib/sources'

const route = useRoute()
const sourceId = route.params.source as string
const source = computed(() => getSourceById(sourceId))

useSeoMeta({
  title: () => source.value ? `${source.value.name}热榜 - 上升热点` : '热榜 - 上升热点',
  description: () => source.value ? `${source.value.name}最新热门内容与趋势。` : '查看最新热门内容与趋势。',
})

const { data, pending } = await useFetch(`/api/${sourceId}`, {
  default: () => ({ data: [] as HotItem[], count: 0, updatedAt: '' }),
})
</script>

<template>
  <div>
    <Header />
    <main class="container">
      <div class="content-body">
        <div class="page-header">
          <h1 class="page-title">{{ source?.icon }} {{ source?.name || sourceId }}热榜</h1>
          <p class="page-desc">{{ source?.description || '查看该平台最新热门内容。' }}</p>
        </div>

        <div class="card">
          <div v-if="pending" class="loading-state">正在加载热榜...</div>
          <HotList v-else :items="data.data" :show-source="false" :show-time="true" />
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>
