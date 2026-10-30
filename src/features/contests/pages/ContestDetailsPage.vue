<template>
  <section>
    <LoadingState v-if="loading" label="Loading contest..." />
    <ErrorState v-else-if="error" :message="error" :retry="load" />
    <template v-else-if="contest">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ contest.name }}</h1>
          <p class="page-kicker">
            {{ formatDateTime(contest.openFrom) }} - {{ formatDateTime(contest.openTo) }}
          </p>
        </div>
        <div class="actions">
          <RouterLink class="btn btn-outline-secondary" :to="`/contests/${contest.id}/results`">
            <Trophy :size="16" />
            Results
          </RouterLink>
          <RouterLink class="btn btn-outline-secondary" :to="`/contests/${contest.id}/my-teams`">
            <Users :size="16" />
            My teams
          </RouterLink>
          <RouterLink
            v-if="!hasEnded"
            class="btn btn-primary"
            :to="`/contests/${contest.id}/register-team`"
          >
            <Plus :size="16" />
            Register team
          </RouterLink>
          <button v-else class="btn btn-primary" type="button" disabled>
            <Plus :size="16" />
            Registration closed
          </button>
        </div>
      </div>
      <div class="panel">
        <h2 class="h5">Classes</h2>
        <DataTable>
          <template #head>
            <th>Name</th>
            <th>Duration</th>
            <th>Max duration</th>
          </template>
          <tr v-for="contestClass in contest.contestClasses" :key="contestClass.id">
            <td>{{ contestClass.name }}</td>
            <td>{{ formatDuration(contestClass.duration) }}</td>
            <td>{{ formatDuration(contestClass.maxDuration) }}</td>
          </tr>
        </DataTable>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Plus, Trophy, Users } from 'lucide-vue-next';
import type { ContestDetails } from '@/app/types/domain';
import DataTable from '@/shared/components/DataTable.vue';
import ErrorState from '@/shared/components/ErrorState.vue';
import LoadingState from '@/shared/components/LoadingState.vue';
import { getErrorMessage } from '@/shared/api/errors';
import { formatDateTime, formatDuration } from '@/shared/utils/dates';
import { getContest } from '../services/contest.service';

const route = useRoute();
const contest = ref<ContestDetails | null>(null);
const loading = ref(false);
const error = ref('');
const hasEnded = computed(() =>
  contest.value ? new Date(contest.value.openTo).getTime() <= Date.now() : false
);

async function load(id = String(route.params.contestId)) {
  const isCurrent = () => id === String(route.params.contestId);
  loading.value = true;
  error.value = '';
  try {
    const loadedContest = await getContest(id);
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
