<template>
  <div class="qr-sheet">
    <article v-for="code in rendered" :key="code.cpid" class="qr-card">
      <img :src="code.src" :alt="`QR ${code.cpid}`" />
      <h2 class="h6 mt-2 mb-1">{{ code.cpCode }}</h2>
      <div class="small">{{ code.cpid }}</div>
      <div class="small text-secondary">{{ checkpointTypeLabels[code.checkPointType] }}</div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import QRCode from 'qrcode';
import { checkpointTypeLabels } from '@/app/config/constants';
import type { OrganiserCheckPointDetails } from '@/app/types/domain';
import { buildQrPayload } from '@/shared/utils/qr';

const props = defineProps<{ checkpoints: OrganiserCheckPointDetails[] }>();
const rendered = ref<Array<OrganiserCheckPointDetails & { src: string }>>([]);

async function render() {
  rendered.value = await Promise.all(
    props.checkpoints.map(async (checkpoint) => ({
      ...checkpoint,
      src: await QRCode.toDataURL(buildQrPayload(checkpoint), { margin: 1, width: 220 })
    }))
  );
}

onMounted(render);
watch(() => props.checkpoints, render, { deep: true });
</script>
