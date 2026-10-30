<template>
  <section>
    <LoadingState v-if="loading" label="Loading live state..." />
    <ErrorState v-else-if="error" :message="error" :retry="load" />
    <template v-else-if="activation">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ activation.teamName }}</h1>
          <p class="page-kicker">
            {{ activation.contestName }} · {{ activation.contestClassName }}
          </p>
        </div>
        <div class="actions">
          <RouterLink
            v-if="isContestOpen"
            class="btn btn-primary"
            :to="`/user-teams/${activation.userTeamId}/scan`"
          >
            <ScanLine :size="16" />
            Scan
          </RouterLink>
          <span v-else-if="scanStatus" class="text-secondary small">{{ scanStatus }}</span>
          <button class="btn btn-outline-secondary" type="button" @click="load()">
            <RefreshCw :size="16" />
            Refresh
          </button>
        </div>
      </div>
      <div v-if="userTeamStore.lastScanMessage" class="alert alert-info">
        {{ userTeamStore.lastScanMessage }}
      </div>
      <div class="status-grid mb-3">
        <div class="metric">
          <div class="metric-label">Score</div>
          <div class="metric-value">{{ activation.score }}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Bonus</div>
          <div class="metric-value">{{ activation.bonus }}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Penalty</div>
          <div class="metric-value">{{ activation.penalty }}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Final</div>
          <div class="metric-value">{{ activation.finalScore }}</div>
        </div>
      </div>
      <div class="panel">
        <h2 class="h5">Recent markings</h2>
        <EmptyState
          v-if="!activation.markings.length"
          title="Not started"
          :message="emptyStateMessage"
        />
        <DataTable v-else>
          <template #head>
            <th>Time</th>
            <th>Checkpoint</th>
            <th>Type</th>
            <th>Score</th>
          </template>
          <tr v-for="marking in activation.markings" :key="marking.id">
            <td>{{ formatDateTime(marking.dt) }}</td>
            <td>{{ marking.checkPointCPID }}</td>
            <td>{{ checkpointTypeLabels[marking.checkPointType] }}</td>
            <td>{{ marking.score }}</td>
          </tr>
        </DataTable>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { RefreshCw, ScanLine } from 'lucide-vue-next';
import { checkpointTypeLabels } from '@/app/config/constants';
import type { ContestDetails, UserTeamActivation } from '@/app/types/domain';
import { getErrorMessage } from '@/shared/api/errors';
import DataTable from '@/shared/components/DataTable.vue';
import EmptyState from '@/shared/components/EmptyState.vue';
import ErrorState from '@/shared/components/ErrorState.vue';
import LoadingState from '@/shared/components/LoadingState.vue';
import { useNow } from '@/shared/composables/useNow';
import { formatDateTime } from '@/shared/utils/dates';
import { getContest } from '@/features/contests/services/contest.service';
import { useUserTeamStore } from '../stores/userTeam.store';
import { getUserTeam } from '../services/userTeam.service';

const route = useRoute();
const userTeamStore = useUserTeamStore();
const activation = ref<UserTeamActivation | null>(null);
const contest = ref<ContestDetails | null>(null);
const loading = ref(false);
const error = ref('');
const now = useNow();

const isContestOpen = computed(() => {
  if (!contest.value) return false;
  const currentTime = now.value.getTime();
  return (
    new Date(contest.value.openFrom).getTime() <= currentTime &&
    currentTime < new Date(contest.value.openTo).getTime()
  );
});

const scanStatus = computed(() => {
  if (!contest.value) return '';
  const currentTime = now.value.getTime();
  if (currentTime < new Date(contest.value.openFrom).getTime()) {
    return `Opens at ${formatDateTime(contest.value.openFrom)}`;
  }
  if (currentTime >= new Date(contest.value.openTo).getTime()) {
    return 'Contest closed';
  }
  return '';
});

const emptyStateMessage = computed(() => scanStatus.value || 'Scan START to activate the clock.');

async function load(id = String(route.params.userTeamId)) {
  const isCurrent = () => id === String(route.params.userTeamId);
  loading.value = true;
  error.value = '';
  try {
    const loadedActivation = await getUserTeam(id);
    if (!isCurrent()) return;
    const loadedContest = await getContest(loadedActivation.contestId);
    if (!isCurrent()) return;
    activation.value = loadedActivation;
    contest.value = loadedContest;
    userTeamStore.selectContest(loadedActivation.contestId);
    userTeamStore.selectUserTeam(loadedActivation.userTeamId);
  } catch (err) {
    if (!isCurrent()) return;
    error.value = getErrorMessage(err);
  } finally {
    if (isCurrent()) loading.value = false;
  }
}

watch(
  () => route.params.userTeamId,
  (id) => {
    activation.value = null;
    contest.value = null;
    void load(String(id));
  },
  { immediate: true }
);
</script>
