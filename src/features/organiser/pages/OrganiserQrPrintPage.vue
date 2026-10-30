<template>
  <section>
    <div class="page-header">
      <div>
        <h1 class="page-title">QR Print Sheet</h1>
        <p class="page-kicker">
          Each code encodes the checkpoint CPID and saved coordinates when available.
        </p>
      </div>
      <button class="btn btn-primary no-print" @click="printPage">
        <Printer :size="16" /> Print
      </button>
    </div>
    <LoadingState v-if="loading" />
    <ErrorState v-else-if="error" :message="error" :retry="load" />
    <QrCodePrintSheet v-else :checkpoints="items" />
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Printer } from 'lucide-vue-next';
import type { OrganiserCheckPointDetails } from '@/app/types/domain';
import { getErrorMessage } from '@/shared/api/errors';
import ErrorState from '@/shared/components/ErrorState.vue';
import LoadingState from '@/shared/components/LoadingState.vue';
import QrCodePrintSheet from '@/shared/components/QrCodePrintSheet.vue';
import { organiserService } from '../services/organiser.service';

const route = useRoute();
const items = ref<OrganiserCheckPointDetails[]>([]);
const loading = ref(false);
const error = ref('');

async function load(id = String(route.params.contestId)) {
  const isCurrent = () => id === String(route.params.contestId);
  loading.value = true;
  error.value = '';
  try {
    const loadedItems = await organiserService.checkpoints(id);
    if (!isCurrent()) return;
    items.value = loadedItems;
  } catch (err) {
    if (!isCurrent()) return;
    error.value = getErrorMessage(err);
  } finally {
    if (isCurrent()) loading.value = false;
  }
}
function printPage() {
  window.print();
}
watch(
  () => route.params.contestId,
  (id) => {
    items.value = [];
    void load(String(id));
  },
  { immediate: true }
);
</script>
