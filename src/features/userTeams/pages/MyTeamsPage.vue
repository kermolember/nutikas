<template>
  <section>
    <div class="page-header">
      <div>
        <h1 class="page-title">My Teams</h1>
        <p class="page-kicker">Teams linked to your account in this contest.</p>
      </div>
      <RouterLink
        v-if="!hasEnded"
        class="btn btn-primary"
        :to="`/contests/${contestId}/register-team`"
      >
        <Plus :size="16" />
        Register
      </RouterLink>
      <button v-else class="btn btn-primary" type="button" disabled>
        <Plus :size="16" />
        Registration closed
      </button>
    </div>
    <LoadingState v-if="loading" label="Loading teams..." />
    <ErrorState v-else-if="error" :message="error" :retry="load" />
    <EmptyState
      v-else-if="!teams.length"
      title="No teams yet"
      message="Register a team to start scanning."
    />
    <DataTable v-else>
      <template #head>
        <th>Team</th>
        <th>Members</th>
        <th>Class</th>
        <th>Final</th>
        <th></th>
      </template>
      <tr v-for="team in teams" :key="team.id">
        <td>{{ team.teamName }}</td>
        <td>{{ team.memberNames }}</td>
        <td>{{ team.contestClassName }}</td>
        <td>{{ team.finalScore }}</td>
        <td class="text-end">
          <RouterLink class="btn btn-sm btn-outline-primary" :to="`/user-teams/${team.id}/live`">
            Open
          </RouterLink>
        </td>
      </tr>
    </DataTable>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Plus } from 'lucide-vue-next';
import type { ContestDetails, UserTeamListItem } from '@/app/types/domain';
import { getErrorMessage } from '@/shared/api/errors';
import DataTable from '@/shared/components/DataTable.vue';
import EmptyState from '@/shared/components/EmptyState.vue';
import ErrorState from '@/shared/components/ErrorState.vue';
import LoadingState from '@/shared/components/LoadingState.vue';
import { getContest } from '@/features/contests/services/contest.service';
import { getMyTeams } from '../services/userTeam.service';

const route = useRoute();
const contestId = computed(() => String(route.params.contestId));
const contest = ref<ContestDetails | null>(null);
const teams = ref<UserTeamListItem[]>([]);
const loading = ref(false);
const error = ref('');
const hasEnded = computed(() =>
  contest.value ? new Date(contest.value.openTo).getTime() <= Date.now() : false
);

async function load(id = contestId.value) {
  const isCurrent = () => id === contestId.value;
  loading.value = true;
  error.value = '';
  try {
    const [loadedContest, loadedTeams] = await Promise.all([getContest(id), getMyTeams(id)]);
    if (!isCurrent()) return;
    contest.value = loadedContest;
    teams.value = loadedTeams;
  } catch (err) {
    if (!isCurrent()) return;
    error.value = getErrorMessage(err);
  } finally {
    if (isCurrent()) loading.value = false;
  }
}

watch(
  contestId,
  (id) => {
    contest.value = null;
    teams.value = [];
    void load(id);
  },
  { immediate: true }
);
</script>
