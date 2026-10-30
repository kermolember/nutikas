<template>
  <label class="form-label w-100">
    <span class="d-block mb-1">{{ label }}</span>
    <slot />
    <span v-if="hint" class="form-text">{{ hint }}</span>
  </label>
</template>

<script setup lang="ts">
defineProps<{ label: string; hint?: string }>();
</script>
