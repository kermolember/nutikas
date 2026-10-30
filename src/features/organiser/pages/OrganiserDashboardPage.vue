<template>
  <section>
    <div class="page-header">
      <div>
        <h1 class="page-title">Organiser</h1>
        <p class="page-kicker">Contest setup, publication, and operational controls.</p>
      </div>
      <RouterLink class="btn btn-primary" to="/organiser/contests/new">
        <Plus :size="16" />
        New contest
      </RouterLink>
    </div>
    <LoadingState v-if="loading" label="Loading organiser contests..." />
    <ErrorState v-else-if="error" :message="error" :retry="load" />
    <EmptyState
      v-else-if="!contests.length"
      title="No contests"
      message="Create a contest to begin."
    />
    <DataTable v-else>
      <template #head>
        <th>Name</th>
        <th>Organisation</th>
        <th>Open</th>
        <th>Visible</th>
        <th></th>
      </template>
      <tr v-for="contest in contests" :key="contest.id">
        <td>
          <RouterLink :to="`/organiser/contests/${contest.id}`">{{ contest.name }}</RouterLink>
        </td>
        <td>{{ contest.organisationName }}</td>
        <td>{{ formatDateTime(contest.openFrom) }} - {{ formatDateTime(contest.openTo) }}</td>
        <td>{{ formatDateTime(contest.visibleFrom) }}</td>
        <td class="text-end">
          <div class="actions justify-content-end">
            <button
              class="btn btn-sm btn-outline-danger"
              :disabled="isEnded(contest) || endingContestId === contest.id"
              @click="endContest(contest)"
            >
              {{
                isEnded(contest)
                  ? 'Ended'
                  : endingContestId === contest.id
                    ? 'Ending...'
                    : 'End contest'
              }}
            </button>
            <RouterLink
              class="btn btn-sm btn-outline-primary"
              :to="`/organiser/contests/${contest.id}/edit`"
            >
              Edit
            </RouterLink>
          </div>
        </td>
      </tr>
    </DataTable>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Plus } from 'lucide-vue-next';
import type { OrganiserContestDetails } from '@/app/types/domain';
import { getErrorMessage } from '@/shared/api/errors';
import DataTable from '@/shared/components/DataTable.vue';
import EmptyState from '@/shared/components/EmptyState.vue';
import ErrorState from '@/shared/components/ErrorState.vue';
import LoadingState from '@/shared/components/LoadingState.vue';
import { formatDateTime } from '@/shared/utils/dates';
import { organiserService } from '../services/organiser.service';

const contests = ref<OrganiserContestDetails[]>([]);
const loading = ref(false);
const error = ref('');
const endingContestId = ref('');

function isEnded(contest: OrganiserContestDetails) {
  return new Date(contest.openTo).getTime() <= Date.now();
}

async function endContest(contest: OrganiserContestDetails) {
  if (
    !window.confirm(
      `End "${contest.name}" now? This closes participation and reveals team markings.`
    )
  ) {
    return;
  }

  endingContestId.value = contest.id;
  error.value = '';
  try {
    await organiserService.updateContest(contest.id, {
      name: contest.name,
      visibleFrom: contest.visibleFrom,
      openFrom: contest.openFrom,
      openTo: new Date().toISOString(),
      bonusTimeStart: contest.bonusTimeStart,
      bonusTimeEnd: contest.bonusTimeEnd,
      bonusPerMarking: contest.bonusPerMarking,
      organisationId: contest.organisationId
    });
    await load();
  } catch (err) {
    error.value = getErrorMessage(err);
  } finally {
    endingContestId.value = '';
  }
}

async function load() {
  loading.value = true;
  error.value = '';
  try {
    contests.value = await organiserService.contests();
  } catch (err) {
    error.value = getErrorMessage(err);
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>
