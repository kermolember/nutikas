<template>
  <div class="small text-secondary">{{ count }} checkpoint coordinates available.</div>
</template>

<script setup lang="ts">
defineProps<{ count: number }>();
</script>
