<template>
  <BaseModal
    :model-value="modelValue"
    :title="title"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <p class="mb-0">{{ message }}</p>
    <template #footer>
      <button
        type="button"
        class="btn btn-outline-secondary"
        @click="$emit('update:modelValue', false)"
      >
        Cancel
      </button>
      <button type="button" class="btn btn-danger" @click="$emit('confirm')">
        {{ confirmLabel }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from './BaseModal.vue';

withDefaults(
  defineProps<{ modelValue: boolean; title: string; message: string; confirmLabel?: string }>(),
  {
    confirmLabel: 'Delete'
  }
);
defineEmits<{ 'update:modelValue': [value: boolean]; confirm: [] }>();
</script>
