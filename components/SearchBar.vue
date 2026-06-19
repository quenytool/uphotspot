<script setup lang="ts">
const q = ref('')

function submit() {
  const keyword = q.value.trim()
  if (!keyword) return
  navigateTo({ path: '/search', query: { q: keyword } })
}
</script>

<template>
  <form class="search-bar" role="search" @submit.prevent="submit">
    <div class="search-input-wrap">
      <input
        v-model="q"
        type="search"
        name="q"
        placeholder="搜索热点内容、话题或平台"
        autocomplete="off"
      >
      <button type="submit">搜索</button>
    </div>
  </form>
</template>
