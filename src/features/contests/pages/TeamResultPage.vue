<template>
  <section>
    <LoadingState v-if="loading" label="Loading team result..." />
    <ErrorState v-else-if="error" :message="error" :retry="load" />
    <template v-else-if="team">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ team.name }}</h1>
          <p class="page-kicker">{{ team.memberNames }} · {{ team.contestClassName }}</p>
        </div>
        <RouterLink
          class="btn btn-outline-secondary"
          :to="`/contests/${contestId}/map?teamId=${team.id}`"
        >
          <Map :size="16" />
          Map
        </RouterLink>
      </div>
      <div class="status-grid mb-3">
        <div class="metric">
          <div class="metric-label">Score</div>
          <div class="metric-value">{{ team.score }}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Bonus</div>
          <div class="metric-value">{{ team.bonus }}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Penalty</div>
          <div class="metric-value">{{ team.penalty }}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Final</div>
          <div class="metric-value">{{ team.finalScore }}</div>
        </div>
      </div>
      <div class="panel">
        <h2 class="h5">Markings</h2>
        <EmptyState
          v-if="!team.markings.length"
          title="No marking trail visible"
          message="The API hides per-checkpoint visits until the contest closes."
        />
        <DataTable v-else>
          <template #head>
            <th>Time</th>
            <th>Checkpoint</th>
            <th>Type</th>
            <th>Score</th>
            <th>GPS</th>
          </template>
          <tr v-for="marking in team.markings" :key="marking.id">
            <td>{{ formatDateTime(marking.dt) }}</td>
            <td>{{ marking.checkPointCPID }} / {{ marking.checkPointCPCode }}</td>
            <td>{{ checkpointTypeLabels[marking.checkPointType] }}</td>
            <td>{{ marking.score }}</td>
            <td>{{ marking.lat && marking.lon ? `${marking.lat}, ${marking.lon}` : '-' }}</td>
          </tr>
        </DataTable>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Map } from 'lucide-vue-next';
import { checkpointTypeLabels } from '@/app/config/constants';
import type { TeamResultDetail } from '@/app/types/domain';
import DataTable from '@/shared/components/DataTable.vue';
import EmptyState from '@/shared/components/EmptyState.vue';
import ErrorState from '@/shared/components/ErrorState.vue';
import LoadingState from '@/shared/components/LoadingState.vue';
import { getErrorMessage } from '@/shared/api/errors';
import { formatDateTime } from '@/shared/utils/dates';
import { getTeamResult } from '../services/contest.service';

const route = useRoute();
const contestId = computed(() => String(route.params.contestId));
const teamId = computed(() => String(route.params.teamId));
const team = ref<TeamResultDetail | null>(null);
const loading = ref(false);
const error = ref('');

async function load(requestContestId = contestId.value, requestTeamId = teamId.value) {
  const isCurrent = () => requestContestId === contestId.value && requestTeamId === teamId.value;
  loading.value = true;
  error.value = '';
  try {
    const loadedTeam = await getTeamResult(requestContestId, requestTeamId);
    if (!isCurrent()) return;
    team.value = loadedTeam;
  } catch (err) {
    if (!isCurrent()) return;
    error.value = getErrorMessage(err);
  } finally {
    if (isCurrent()) loading.value = false;
  }
}

watch(
  [contestId, teamId],
  ([requestContestId, requestTeamId]) => {
    team.value = null;
    void load(requestContestId, requestTeamId);
  },
  { immediate: true }
);
</script>
