<script setup lang="ts">
import { categories } from '~/assets/lib/sources'

const route = useRoute()
const keyword = ref('')

const navItems = [
  { to: '/', label: '首页' },
  { to: '/hot', label: '总榜' },
  { to: '/trending', label: '趋势' },
  { to: '/topics', label: '话题' },
  { to: '/daily', label: '日报' },
  { to: '/dashboard', label: '看板' },
]

function isActive(path: string) {
  return path === '/' ? route.path === '/' : route.path.startsWith(path)
}

function submitSearch() {
  const q = keyword.value.trim()
  if (!q) return
  navigateTo({ path: '/search', query: { q } })
}
</script>

<template>
  <header class="header">
    <div class="container header-inner">
      <NuxtLink to="/" class="logo" aria-label="上升热点首页">
        <img src="/pwa-192x192.png" alt="logo" class="logo-img">
        <span>上升热点</span>
      </NuxtLink>

      <nav class="nav" aria-label="主导航">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="{ active: isActive(item.to) }"
        >
          {{ item.label }}
        </NuxtLink>

        <NuxtLink
          v-for="cat in categories.slice(0, 4)"
          :key="cat.id"
          :to="`/c/${cat.id}`"
          :class="{ active: route.path === `/c/${cat.id}` }"
        >
          {{ cat.name }}
        </NuxtLink>
      </nav>

      <form class="search-box" role="search" @submit.prevent="submitSearch">
        <input
          v-model="keyword"
          type="search"
          placeholder="搜索热点、话题、平台"
          aria-label="搜索热点"
        >
        <button type="submit" aria-label="搜索">⌕</button>
      </form>
    </div>
  </header>
</template>
