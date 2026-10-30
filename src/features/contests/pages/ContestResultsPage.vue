<template>
  <section>
    <LoadingState v-if="loading" label="Loading results..." />
    <ErrorState v-else-if="error" :message="error" :retry="load" />
    <template v-else-if="results">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ results.contest.name }} Results</h1>
          <p class="page-kicker">{{ results.teams.length }} ranked teams</p>
        </div>
        <RouterLink class="btn btn-outline-secondary" :to="`/contests/${results.contest.id}/map`">
          <Map :size="16" />
          Map
        </RouterLink>
      </div>
      <EmptyState
        v-if="!results.teams.length"
        title="No results yet"
        message="Teams appear here after they have started."
      />
      <div v-for="(teams, className) in grouped" v-else :key="className" class="panel mb-3">
        <h2 class="h5">{{ className }}</h2>
        <DataTable>
          <template #head>
            <th>#</th>
            <th>Team</th>
            <th>Members</th>
            <th>Score</th>
            <th>Finish</th>
          </template>
          <tr v-for="(team, index) in teams" :key="team.id">
            <td>{{ index + 1 }}</td>
            <td>
              <RouterLink :to="`/contests/${results.contest.id}/results/${team.id}`">
                {{ team.name }}
              </RouterLink>
            </td>
            <td>{{ team.memberNames }}</td>
            <td>{{ team.finalScore }}</td>
            <td>{{ formatDateTime(team.finishDT) }}</td>
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
import type { ContestResults } from '@/app/types/domain';
import DataTable from '@/shared/components/DataTable.vue';
import EmptyState from '@/shared/components/EmptyState.vue';
import ErrorState from '@/shared/components/ErrorState.vue';
import LoadingState from '@/shared/components/LoadingState.vue';
import { getErrorMessage } from '@/shared/api/errors';
import { formatDateTime } from '@/shared/utils/dates';
import { groupResultsByClass } from '@/shared/utils/rankings';
import { getContestResults } from '../services/contest.service';

const route = useRoute();
const results = ref<ContestResults | null>(null);
const loading = ref(false);
const error = ref('');
const grouped = computed(() => (results.value ? groupResultsByClass(results.value.teams) : {}));

async function load(id = String(route.params.contestId)) {
  const isCurrent = () => id === String(route.params.contestId);
  loading.value = true;
  error.value = '';
  try {
    const loadedResults = await getContestResults(id);
    if (!isCurrent()) return;
    results.value = loadedResults;
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
    results.value = null;
    void load(String(id));
  },
  { immediate: true }
);
</script>
