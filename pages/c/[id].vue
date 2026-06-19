<script setup lang="ts">
import Header from '~/components/Header.vue'
import Footer from '~/components/Footer.vue'
import HotList from '~/components/HotList.vue'
import { categories, type HotItem } from '~/assets/lib/sources'

const route = useRoute()
const categoryId = route.params.id as string
const category = computed(() => categories.find(item => item.id === categoryId) || { id: categoryId, name: categoryId, icon: '📰' })

useSeoMeta({
  title: () => `${category.value.name} - 上升热点`,
  description: () => `查看${category.value.name}相关热点。`,
})

const { data, pending } = await useFetch('/api/all', {
  default: () => ({ data: [] as HotItem[], count: 0, updatedAt: '' }),
})

const list = computed(() => data.value.data.filter(item => item.category === categoryId))
</script>

<template>
  <div>
    <Header />
    <main class="container">
      <div class="content-body">
        <div class="page-header">
          <h1 class="page-title">{{ category.icon }} {{ category.name }}</h1>
          <p class="page-desc">按分类聚合相关热点，适合快速定位你关心的方向。</p>
        </div>

        <div class="card">
          <div v-if="pending" class="loading-state">正在加载热榜...</div>
          <HotList v-else :items="list" :show-source="true" :show-time="true" />
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>
