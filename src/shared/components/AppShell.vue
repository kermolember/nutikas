<template>
  <div class="app-shell">
    <AppNavbar />
    <main class="app-main">
      <RouterView />
    </main>
    <div class="toast-container position-fixed top-0 end-0 p-3">
      <div
        v-for="toast in ui.toasts"
        :key="toast.id"
        class="toast show align-items-center border-0 mb-2"
        :class="`text-bg-${toast.kind}`"
        role="status"
      >
        <div class="d-flex">
          <div class="toast-body">{{ toast.message }}</div>
          <button
            type="button"
            class="btn-close btn-close-white me-2 m-auto"
            aria-label="Close"
            @click="ui.removeToast(toast.id)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useUiStore } from '@/app/stores/ui.store';
import AppNavbar from './AppNavbar.vue';

const ui = useUiStore();
</script>
