<template>
  <div class="small text-secondary">{{ count }} scan coordinates in route.</div>
</template>

<script setup lang="ts">
defineProps<{ count: number }>();
</script>
