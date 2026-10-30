<template>
  <section>
    <div class="page-header">
      <div>
        <h1 class="page-title">Markings</h1>
        <p class="page-kicker">Raw marking edits do not recompute team totals.</p>
      </div>
    </div>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    <div class="panel mb-3">
      <div class="form-grid">
        <FormField label="Team filter">
          <select v-model="teamId" class="form-select" @change="reloadFirstPage">
            <option value="">All teams</option>
            <option v-for="team in teams" :key="team.id" :value="team.id">{{ team.name }}</option>
          </select>
        </FormField>
        <FormField label="Page size">
          <select v-model.number="pageSize" class="form-select" @change="reloadFirstPage">
            <option :value="25">25</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </FormField>
      </div>
    </div>
    <div v-if="selected" class="panel mb-3">
      <h2 class="h5">Edit marking</h2>
      <form class="form-grid" @submit.prevent="updateSelected">
        <FormField label="Time"
          ><input v-model="editForm.dt" type="datetime-local" class="form-control" required
        /></FormField>
        <FormField label="Checkpoint">
          <select v-model="editForm.checkPointId" class="form-select" required>
            <option v-for="cp in checkpoints" :key="cp.id" :value="cp.id">{{ cp.cpid }}</option>
          </select>
        </FormField>
        <FormField label="User team ID"
          ><input v-model="editForm.userTeamId" class="form-control" required
        /></FormField>
        <FormField label="Type"
          ><input v-model.number="editForm.markingType" type="number" class="form-control"
        /></FormField>
        <FormField label="Score"
          ><input v-model.number="editForm.score" type="number" class="form-control"
        /></FormField>
        <FormField label="Latitude"
          ><input v-model="editForm.lat" class="form-control"
        /></FormField>
        <FormField label="Longitude"
          ><input v-model="editForm.lon" class="form-control"
        /></FormField>
        <div class="actions align-self-end">
          <button class="btn btn-primary" type="submit"><Save :size="16" /> Save</button>
          <button class="btn btn-outline-secondary" type="button" @click="selected = null">
            Cancel
          </button>
        </div>
      </form>
    </div>
    <LoadingState v-if="loading" />
    <DataTable v-else>
      <template #head
        ><th>Time</th>
        <th>Team</th>
        <th>Checkpoint</th>
        <th>Score</th>
        <th></th
      ></template>
      <tr v-for="marking in pageItems" :key="marking.id">
        <td>{{ formatDateTime(marking.dt) }}</td>
        <td>{{ marking.teamName }}</td>
        <td>{{ marking.checkPointCPID }} / {{ marking.checkPointCPCode }}</td>
        <td>{{ marking.score }}</td>
        <td class="text-end actions justify-content-end">
          <button class="btn btn-sm btn-outline-primary" @click="edit(marking.id)">Edit</button>
          <button class="btn btn-sm btn-outline-danger" @click="requestRemove(marking)">
            Delete
          </button>
        </td>
      </tr>
    </DataTable>
    <div class="actions justify-content-between mt-3">
      <button
        class="btn btn-outline-secondary"
        :disabled="page <= 1"
        @click="
          page--;
          load();
        "
      >
        Previous
      </button>
      <span class="text-secondary">Page {{ page }} of {{ totalPages }}</span>
      <button
        class="btn btn-outline-secondary"
        :disabled="page >= totalPages"
        @click="
          page++;
          load();
        "
      >
        Next
      </button>
    </div>
    <ConfirmDialog
      v-model="deleteDialogOpen"
      title="Delete marking"
      :message="deleteMessage"
      @confirm="confirmRemove"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Save } from 'lucide-vue-next';
import type {
  OrganiserCheckPointDetails,
  OrganiserMarkingDetails,
  OrganiserMarkingListItem,
  OrganiserTeamDetails
} from '@/app/types/domain';
import { getErrorMessage } from '@/shared/api/errors';
import ConfirmDialog from '@/shared/components/ConfirmDialog.vue';
import DataTable from '@/shared/components/DataTable.vue';
import FormField from '@/shared/components/FormField.vue';
import LoadingState from '@/shared/components/LoadingState.vue';
import { formatDateTime, fromInputDateTime, toInputDateTime } from '@/shared/utils/dates';
import { organiserService } from '../services/organiser.service';

const route = useRoute();
const contestId = computed(() => String(route.params.contestId));
const teams = ref<OrganiserTeamDetails[]>([]);
const checkpoints = ref<OrganiserCheckPointDetails[]>([]);
const pageItems = ref<OrganiserMarkingListItem[]>([]);
const selected = ref<OrganiserMarkingDetails | null>(null);
const pendingDelete = ref<OrganiserMarkingListItem | null>(null);
const loading = ref(false);
const error = ref('');
const teamId = ref('');
const page = ref(1);
const pageSize = ref(25);
const totalPages = ref(1);
const editForm = reactive({
  dt: '',
  lat: '',
  lon: '',
  markingType: 0,
  score: 0,
  checkPointId: '',
  userTeamId: ''
});
const deleteDialogOpen = computed({
  get: () => Boolean(pendingDelete.value),
  set: (value: boolean) => {
    if (!value) pendingDelete.value = null;
  }
});
const deleteMessage = computed(() =>
  pendingDelete.value
    ? `Delete marking for "${pendingDelete.value.teamName}" at "${formatDateTime(pendingDelete.value.dt)}"? This cannot be undone.`
    : 'Delete this marking? This cannot be undone.'
);

async function load(id = contestId.value) {
  const isCurrent = () => id === contestId.value;
  loading.value = true;
  error.value = '';
  try {
    const result = await organiserService.markings(id, {
      teamId: teamId.value || undefined,
      page: page.value,
      pageSize: pageSize.value
    });
    if (!isCurrent()) return;
    pageItems.value = result.items;
    totalPages.value = Math.max(1, result.totalPages);
  } catch (err) {
    if (!isCurrent()) return;
    error.value = getErrorMessage(err);
  } finally {
    if (isCurrent()) loading.value = false;
  }
}
async function loadLookups(id = contestId.value) {
  const [loadedTeams, loadedCheckpoints] = await Promise.all([
    organiserService.teams(id),
    organiserService.checkpoints(id)
  ]);
  if (id !== contestId.value) return;
  teams.value = loadedTeams;
  checkpoints.value = loadedCheckpoints;
}
async function reloadFirstPage() {
  page.value = 1;
  await load();
}
async function edit(id: string) {
  try {
    selected.value = await organiserService.marking(id);
    Object.assign(editForm, {
      dt: toInputDateTime(selected.value.dt),
      lat: selected.value.lat ?? '',
      lon: selected.value.lon ?? '',
      markingType: selected.value.markingType,
      score: selected.value.score,
      checkPointId: selected.value.checkPointId,
      userTeamId: selected.value.userTeamId
    });
  } catch (err) {
    error.value = getErrorMessage(err);
  }
}
async function updateSelected() {
  if (!selected.value) return;
  try {
    await organiserService.updateMarking(selected.value.id, {
      dt: fromInputDateTime(editForm.dt)!,
      lat: editForm.lat || null,
      lon: editForm.lon || null,
      markingType: editForm.markingType,
      score: editForm.score,
      checkPointId: editForm.checkPointId,
      userTeamId: editForm.userTeamId
    });
    selected.value = null;
    await load();
  } catch (err) {
    error.value = getErrorMessage(err);
  }
}
function requestRemove(marking: OrganiserMarkingListItem) {
  pendingDelete.value = marking;
}
async function confirmRemove() {
  if (!pendingDelete.value) return;
  const id = pendingDelete.value.id;
  pendingDelete.value = null;
  try {
    await organiserService.deleteMarking(id);
    await load();
  } catch (err) {
    error.value = getErrorMessage(err);
  }
}
watch(
  contestId,
  async (id) => {
    teams.value = [];
    checkpoints.value = [];
    pageItems.value = [];
    selected.value = null;
    pendingDelete.value = null;
    teamId.value = '';
    page.value = 1;
    totalPages.value = 1;
    try {
      await loadLookups(id);
      if (id !== contestId.value) return;
      await load(id);
    } catch (err) {
      if (id === contestId.value) error.value = getErrorMessage(err);
    }
  },
  { immediate: true }
);
</script>
