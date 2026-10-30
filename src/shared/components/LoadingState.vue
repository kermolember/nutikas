<template>
  <div class="panel text-center py-5">
    <div class="spinner-border text-primary" role="status" />
    <p class="mt-3 mb-0 text-secondary">{{ label }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label?: string }>();
</script>
