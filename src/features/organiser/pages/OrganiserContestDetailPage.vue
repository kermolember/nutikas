<template>
  <section>
    <LoadingState v-if="loading" label="Loading contest..." />
    <ErrorState v-else-if="error" :message="error" :retry="load" />
    <template v-else-if="contest">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ contest.name }}</h1>
          <p class="page-kicker">{{ contest.organisationName }}</p>
        </div>
        <div class="actions">
          <RouterLink
            class="btn btn-outline-primary"
            :to="`/organiser/contests/${contest.id}/edit`"
          >
            <Pencil :size="16" />
            Edit
          </RouterLink>
          <RouterLink
            class="btn btn-outline-secondary"
            :to="`/organiser/contests/${contest.id}/qr-print`"
          >
            <QrCode :size="16" />
            QR
          </RouterLink>
        </div>
      </div>
      <div class="status-grid mb-3">
        <div class="metric">
          <div class="metric-label">Visible</div>
          <div>{{ formatDateTime(contest.visibleFrom) }}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Open from</div>
          <div>{{ formatDateTime(contest.openFrom) }}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Open to</div>
          <div>{{ formatDateTime(contest.openTo) }}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Bonus</div>
          <div>{{ contest.bonusPerMarking }}</div>
        </div>
      </div>
      <div class="panel">
        <div class="actions">
          <RouterLink
            class="btn btn-outline-primary"
            :to="`/organiser/contests/${contest.id}/classes`"
            >Classes</RouterLink
          >
          <RouterLink
            class="btn btn-outline-primary"
            :to="`/organiser/contests/${contest.id}/checkpoints`"
            >Checkpoints</RouterLink
          >
          <RouterLink
            class="btn btn-outline-primary"
            :to="`/organiser/contests/${contest.id}/teams`"
            >Teams</RouterLink
          >
          <RouterLink
            class="btn btn-outline-primary"
            :to="`/organiser/contests/${contest.id}/markings`"
            >Markings</RouterLink
          >
        </div>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Pencil, QrCode } from 'lucide-vue-next';
import type { OrganiserContestDetails } from '@/app/types/domain';
import { getErrorMessage } from '@/shared/api/errors';
import ErrorState from '@/shared/components/ErrorState.vue';
import LoadingState from '@/shared/components/LoadingState.vue';
import { formatDateTime } from '@/shared/utils/dates';
import { organiserService } from '../services/organiser.service';

const route = useRoute();
const contest = ref<OrganiserContestDetails | null>(null);
const loading = ref(false);
const error = ref('');

async function load(id = String(route.params.contestId)) {
  const isCurrent = () => id === String(route.params.contestId);
  loading.value = true;
  error.value = '';
  try {
    const loadedContest = await organiserService.contest(id);
    if (!isCurrent()) return;
    contest.value = loadedContest;
  } catch (err) {
    if (!isCurrent()) return;
    error.value = getErrorMessage(err);
  } finally {
    if (isCurrent()) loading.value = false;
  }
}

watch(
  () => route.params.contestId,
  (id) => {
    contest.value = null;
    void load(String(id));
  },
  { immediate: true }
);
</script>
