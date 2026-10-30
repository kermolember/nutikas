<template>
  <div v-if="modelValue" class="modal d-block" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title h5">{{ title }}</h2>
          <button
            type="button"
            class="btn-close"
            aria-label="Close"
            @click="$emit('update:modelValue', false)"
          />
        </div>
        <div class="modal-body">
          <slot />
        </div>
        <div v-if="$slots.footer" class="modal-footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </div>
  <div v-if="modelValue" class="modal-backdrop show" />
</template>

<script setup lang="ts">
defineProps<{ modelValue: boolean; title: string }>();
defineEmits<{ 'update:modelValue': [value: boolean] }>();
</script>
