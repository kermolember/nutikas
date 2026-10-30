<template>
  <div>
    <div :id="elementId" class="scanner-box" />
    <div class="actions mt-2">
      <button v-if="!running" type="button" class="btn btn-primary" @click="start">
        <Camera :size="16" />
        Start camera
      </button>
      <button v-else type="button" class="btn btn-outline-secondary" @click="stop">
        <Square :size="16" />
        Stop
      </button>
    </div>
    <div v-if="error" class="alert alert-warning mt-2">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount } from 'vue';
import { Camera, Square } from 'lucide-vue-next';
import { useQrScanner } from '@/shared/composables/useQrScanner';

const props = defineProps<{ elementId?: string }>();
const emit = defineEmits<{ scan: [payload: string] }>();
const elementId = props.elementId || `qr-reader-${Math.random().toString(36).slice(2)}`;
const { running, error, start, stop } = useQrScanner(elementId, (payload) => emit('scan', payload));

onBeforeUnmount(stop);
</script>
