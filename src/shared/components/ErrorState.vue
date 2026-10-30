<template>
  <div class="alert alert-danger" role="alert">
    <strong>Could not load this view.</strong>
    <div>{{ message }}</div>
    <button v-if="retry" type="button" class="btn btn-sm btn-outline-danger mt-2" @click="retry()">
      Try again
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ message: string; retry?: () => void }>();
</script>
