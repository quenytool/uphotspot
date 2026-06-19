<script setup lang="ts">
import { getSourceById } from '~/assets/lib/sources'

const props = defineProps<{
  source: string
}>()

const sourceInfo = computed(() => getSourceById(props.source))
</script>

<template>
  <span class="tag source-tag" :style="{ '--source-color': sourceInfo?.color || '#1890ff' }">
    <span class="source-dot" />
    {{ sourceInfo?.name || source }}
  </span>
</template>
