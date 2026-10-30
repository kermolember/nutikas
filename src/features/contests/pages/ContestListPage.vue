<template>
  <section>
    <div class="page-header">
      <div>
        <h1 class="page-title">Contests</h1>
        <p class="page-kicker">Browse public events, register teams, and follow rankings.</p>
      </div>
      <div class="actions">
        <RouterLink v-if="auth.isOrganiser" class="btn btn-outline-primary" to="/organiser">
          <Shield :size="16" />
          Organiser
        </RouterLink>
      </div>
    </div>

    <LoadingState v-if="loading" label="Loading contests..." />
    <ErrorState v-else-if="error" :message="error" :retry="load" />
    <EmptyState
      v-else-if="!contests.length"
      title="No visible contests"
      message="Published contests will appear here."
    />
    <div v-else class="row g-3">
      <div v-for="contest in contests" :key="contest.id" class="col-12 col-lg-6">
        <article class="panel h-100">
          <div class="d-flex justify-content-between gap-3">
            <h2 class="h5 mb-1">{{ contest.name }}</h2>
            <span
              class="badge align-self-start"
              :class="contest.isOpenForParticipation ? 'text-bg-open' : 'text-bg-closed'"
            >
              {{ contest.isOpenForParticipation ? 'Open' : 'Closed' }}
            </span>
          </div>
          <p class="text-secondary mb-3">
            {{ formatDateTime(contest.openFrom) }} - {{ formatDateTime(contest.openTo) }}
          </p>
          <div class="actions">
            <RouterLink
              v-if="isContestUpcomingOrOpen(contest)"
              class="btn btn-primary btn-sm"
              :to="`/contests/${contest.id}`"
            >
              Details
            </RouterLink>
            <RouterLink
              v-if="contest.hasResults"
              class="btn btn-outline-secondary btn-sm"
              :to="`/contests/${contest.id}/results`"
            >
              Results
            </RouterLink>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Shield } from 'lucide-vue-next';
import { useAuthStore } from '@/app/stores/auth.store';
import type { ContestListItem } from '@/app/types/domain';
import EmptyState from '@/shared/components/EmptyState.vue';
import ErrorState from '@/shared/components/ErrorState.vue';
import LoadingState from '@/shared/components/LoadingState.vue';
import { getErrorMessage } from '@/shared/api/errors';
import { formatDateTime } from '@/shared/utils/dates';
import { getContests } from '../services/contest.service';

const auth = useAuthStore();
const contests = ref<ContestListItem[]>([]);
const loading = ref(false);
const error = ref('');

function isContestUpcomingOrOpen(contest: ContestListItem) {
  return new Date(contest.openTo).getTime() > Date.now();
}

async function load() {
  loading.value = true;
  error.value = '';
  try {
    contests.value = await getContests();
  } catch (err) {
    error.value = getErrorMessage(err);
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>
