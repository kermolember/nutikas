<template>
  <section>
    <div class="page-header">
      <div>
        <h1 class="page-title">Teams</h1>
        <p class="page-kicker">Create teams and correct totals when needed.</p>
      </div>
    </div>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    <div class="panel mb-3">
      <form class="form-grid" @submit.prevent="save">
        <FormField label="Name"
          ><input v-model="form.name" class="form-control" required
        /></FormField>
        <FormField label="Members"
          ><input v-model="form.memberNames" class="form-control" required
        /></FormField>
        <FormField label="Class">
          <select v-model="form.contestClassId" class="form-select" required>
            <option value="" disabled>Select class</option>
            <option v-for="item in classes" :key="item.id" :value="item.id">{{ item.name }}</option>
          </select>
        </FormField>
        <FormField label="Start"
          ><input v-model="dateForm.startDT" type="datetime-local" class="form-control"
        /></FormField>
        <FormField label="Finish"
          ><input v-model="dateForm.finishDT" type="datetime-local" class="form-control"
        /></FormField>
        <FormField label="Score"
          ><input v-model.number="form.score" type="number" class="form-control"
        /></FormField>
        <FormField label="Bonus"
          ><input v-model.number="form.bonus" type="number" class="form-control"
        /></FormField>
        <FormField label="Penalty"
          ><input v-model.number="form.penalty" type="number" class="form-control"
        /></FormField>
        <FormField label="Final"
          ><input v-model.number="form.finalScore" type="number" class="form-control"
        /></FormField>
        <div class="actions align-self-end">
          <button class="btn btn-primary" type="submit">
            <Save :size="16" />{{ editingId ? 'Update' : 'Create' }}
          </button>
          <button class="btn btn-outline-secondary" type="button" @click="reset">Clear</button>
        </div>
      </form>
    </div>
    <LoadingState v-if="loading" />
    <DataTable v-else>
      <template #head
        ><th>Team</th>
        <th>Class</th>
        <th>Members</th>
        <th>Final</th>
        <th></th
      ></template>
      <tr v-for="team in teams" :key="team.id">
        <td>
          <RouterLink :to="`/organiser/teams/${team.id}`">{{ team.name }}</RouterLink>
        </td>
        <td>{{ team.contestClassName }}</td>
        <td>{{ team.memberNames }}</td>
        <td>{{ team.finalScore }}</td>
        <td class="text-end actions justify-content-end">
          <button class="btn btn-sm btn-outline-primary" @click="edit(team)">Edit</button>
          <button class="btn btn-sm btn-outline-danger" @click="requestRemove(team)">Delete</button>
        </td>
      </tr>
    </DataTable>
    <ConfirmDialog
      v-model="deleteDialogOpen"
      title="Delete team"
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
  OrganiserContestClassDetails,
  OrganiserTeamDetails,
  OrganiserTeamUpsertRequest
} from '@/app/types/domain';
import { getErrorMessage } from '@/shared/api/errors';
import ConfirmDialog from '@/shared/components/ConfirmDialog.vue';
import DataTable from '@/shared/components/DataTable.vue';
import FormField from '@/shared/components/FormField.vue';
import LoadingState from '@/shared/components/LoadingState.vue';
import { fromInputDateTime, toInputDateTime } from '@/shared/utils/dates';
import { organiserService } from '../services/organiser.service';

const route = useRoute();
const contestId = computed(() => String(route.params.contestId));
const teams = ref<OrganiserTeamDetails[]>([]);
const classes = ref<OrganiserContestClassDetails[]>([]);
const loading = ref(false);
const error = ref('');
const editingId = ref('');
const pendingDelete = ref<OrganiserTeamDetails | null>(null);
const dateForm = reactive({ startDT: '', finishDT: '' });
const form = reactive<OrganiserTeamUpsertRequest>({
  name: '',
  memberNames: '',
  contestClassId: '',
  startDT: null,
  finishDT: null,
  score: 0,
  bonus: 0,
  penalty: 0,
  finalScore: 0
});
const deleteDialogOpen = computed({
  get: () => Boolean(pendingDelete.value),
  set: (value: boolean) => {
    if (!value) pendingDelete.value = null;
  }
});
const deleteMessage = computed(() =>
  pendingDelete.value
    ? `Delete team "${pendingDelete.value.name}"? This cannot be undone.`
    : 'Delete this team? This cannot be undone.'
);

function buildPayload(): OrganiserTeamUpsertRequest {
  return {
    ...form,
    startDT: fromInputDateTime(dateForm.startDT),
    finishDT: fromInputDateTime(dateForm.finishDT)
  };
}
function reset() {
  editingId.value = '';
  Object.assign(form, {
    name: '',
    memberNames: '',
    contestClassId: classes.value[0]?.id ?? '',
    startDT: null,
    finishDT: null,
    score: 0,
    bonus: 0,
    penalty: 0,
    finalScore: 0
  });
  dateForm.startDT = '';
  dateForm.finishDT = '';
}
function edit(team: OrganiserTeamDetails) {
  editingId.value = team.id;
  Object.assign(form, {
    name: team.name,
    memberNames: team.memberNames,
    contestClassId: team.contestClassId,
    startDT: team.startDT,
    finishDT: team.finishDT,
    score: team.score,
    bonus: team.bonus,
    penalty: team.penalty,
    finalScore: team.finalScore
  });
  dateForm.startDT = toInputDateTime(team.startDT);
  dateForm.finishDT = toInputDateTime(team.finishDT);
}
async function load(id = contestId.value) {
  const isCurrent = () => id === contestId.value;
  loading.value = true;
  error.value = '';
  try {
    const [loadedClasses, loadedTeams] = await Promise.all([
      organiserService.classes(id),
      organiserService.teams(id)
    ]);
    if (!isCurrent()) return;
    classes.value = loadedClasses;
    teams.value = loadedTeams;
    if (!form.contestClassId) form.contestClassId = loadedClasses[0]?.id ?? '';
  } catch (err) {
    if (!isCurrent()) return;
    error.value = getErrorMessage(err);
  } finally {
    if (isCurrent()) loading.value = false;
  }
}
async function save() {
  try {
    editingId.value
      ? await organiserService.updateTeam(editingId.value, buildPayload())
      : await organiserService.createTeam(contestId.value, buildPayload());
    reset();
    await load();
  } catch (err) {
    error.value = getErrorMessage(err);
  }
}
function requestRemove(team: OrganiserTeamDetails) {
  pendingDelete.value = team;
}
async function confirmRemove() {
  if (!pendingDelete.value) return;
  const id = pendingDelete.value.id;
  pendingDelete.value = null;
  try {
    await organiserService.deleteTeam(id);
    await load();
  } catch (err) {
    error.value = getErrorMessage(err);
  }
}
watch(
  contestId,
  (id) => {
    teams.value = [];
    classes.value = [];
    reset();
    void load(id);
  },
  { immediate: true }
);
</script>
