<script setup lang="ts">
import type { HotItem } from '~/assets/lib/sources'
import { formatTime } from '~/assets/lib/utils'
import SourceTag from './SourceTag.vue'

defineProps<{
  items: HotItem[]
  showSource?: boolean
  showTime?: boolean
}>()
</script>

<template>
  <div v-if="items.length" class="hot-list">
    <article
      v-for="(item, index) in items"
      :key="`${item.source}-${item.id}-${index}`"
      class="hot-item"
    >
      <div :class="['hot-rank', { top: index < 3 }]">
        {{ item.rank || index + 1 }}
      </div>

      <div class="hot-content">
        <a :href="item.url" class="hot-title" target="_blank" rel="nofollow noopener">
          {{ item.title }}
        </a>

        <div class="hot-meta">
          <SourceTag v-if="showSource" :source="item.source" />
          <span v-if="item.heat">热度 {{ item.heat }}</span>
          <span v-if="showTime">{{ formatTime(item.createdAt) }}</span>
        </div>
      </div>
    </article>
  </div>

  <div v-else class="empty-state">
    <strong>暂时没有热榜数据</strong>
    <span>稍后刷新，或先检查 API Key 与爬虫任务配置。</span>
  </div>
</template>
