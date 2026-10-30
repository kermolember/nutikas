<template>
  <div class="panel text-center py-5">
    <h2 class="h5">{{ title }}</h2>
    <p class="text-secondary mb-0">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; message: string }>();
</script>
