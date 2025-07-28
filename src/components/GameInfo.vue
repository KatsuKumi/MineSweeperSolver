<template>
  <div class="game-info">
    <div class="info-content" v-html="infoMessage"></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  infoMessage: string
}

defineProps<Props>()
</script>

