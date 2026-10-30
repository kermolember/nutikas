<template>
  <section>
    <LoadingState v-if="loading" />
    <ErrorState v-else-if="error" :message="error" :retry="load" />
    <template v-else-if="team">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ team.name }}</h1>
          <p class="page-kicker">{{ team.memberNames }}</p>
        </div>
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
      <div class="row g-3">
        <div class="col-12 col-lg-6">
          <div class="panel">
            <h2 class="h5">Members</h2>
            <form class="d-flex gap-2 mb-3" @submit.prevent="addMember">
              <input
                v-model="memberEmail"
                type="email"
                class="form-control"
                placeholder="email@example.org"
                required
              />
              <button class="btn btn-primary" type="submit"><UserPlus :size="16" /></button>
            </form>
            <DataTable>
              <template #head
                ><th>Email</th>
                <th></th
              ></template>
              <tr v-for="member in team.members" :key="member.userTeamId ?? member.id">
                <td>{{ member.email }}</td>
                <td class="text-end">
                  <button
                    class="btn btn-sm btn-outline-danger"
                    @click="requestRemoveMember(member)"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            </DataTable>
          </div>
        </div>
        <div class="col-12 col-lg-6">
          <form class="panel" @submit.prevent="createMarking">
            <h2 class="h5">On-behalf marking</h2>
            <div
              v-if="markingMessage"
              class="alert"
              :class="markingOk ? 'alert-success' : 'alert-warning'"
            >
              {{ markingMessage }}
            </div>
            <FormField label="Checkpoint">
              <select v-model="markingForm.checkPointId" class="form-select" required>
                <option value="" disabled>Select checkpoint</option>
                <option v-for="cp in checkpoints" :key="cp.id" :value="cp.id">
                  {{ cp.cpid }} / {{ cp.cpCode }}
                </option>
              </select>
            </FormField>
            <FormField label="Time"
              ><input v-model="markingForm.dt" type="datetime-local" class="form-control"
            /></FormField>
            <div class="form-grid">
              <FormField label="Latitude"
                ><input v-model="markingForm.lat" class="form-control"
              /></FormField>
              <FormField label="Longitude"
                ><input v-model="markingForm.lon" class="form-control"
              /></FormField>
            </div>
            <button class="btn btn-primary mt-2" type="submit"><Send :size="16" /> Submit</button>
          </form>
        </div>
      </div>
    </template>
    <ConfirmDialog
      v-model="deleteDialogOpen"
      title="Remove member"
      :message="deleteMessage"
      confirm-label="Remove"
      @confirm="confirmRemoveMember"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Send, UserPlus } from 'lucide-vue-next';
import type {
  OrganiserCheckPointDetails,
  OrganiserTeamDetails,
  OrganiserUserTeamItem
} from '@/app/types/domain';
import { getErrorMessage } from '@/shared/api/errors';
import ConfirmDialog from '@/shared/components/ConfirmDialog.vue';
import DataTable from '@/shared/components/DataTable.vue';
import ErrorState from '@/shared/components/ErrorState.vue';
import FormField from '@/shared/components/FormField.vue';
import LoadingState from '@/shared/components/LoadingState.vue';
import { fromInputDateTime } from '@/shared/utils/dates';
import { organiserService } from '../services/organiser.service';

const route = useRoute();
const team = ref<OrganiserTeamDetails | null>(null);
const checkpoints = ref<OrganiserCheckPointDetails[]>([]);
const pendingDeleteMember = ref<{ id: string; email: string } | null>(null);
const loading = ref(false);
const error = ref('');
const memberEmail = ref('');
const markingMessage = ref('');
const markingOk = ref(false);
const markingForm = reactive({ checkPointId: '', dt: '', lat: '', lon: '' });
const deleteDialogOpen = computed({
  get: () => Boolean(pendingDeleteMember.value),
  set: (value: boolean) => {
    if (!value) pendingDeleteMember.value = null;
  }
});
const deleteMessage = computed(() =>
  pendingDeleteMember.value
    ? `Remove member "${pendingDeleteMember.value.email}" from this team?`
    : 'Remove this member from the team?'
);

async function load(id = String(route.params.teamId)) {
  const isCurrent = () => id === String(route.params.teamId);
  loading.value = true;
  error.value = '';
  try {
    const loadedTeam = await organiserService.team(id);
    if (!isCurrent()) return;
    const loadedCheckpoints = await organiserService.checkpoints(loadedTeam.contestId);
    if (!isCurrent()) return;
    team.value = loadedTeam;
    checkpoints.value = loadedCheckpoints;
    markingForm.checkPointId ||= loadedCheckpoints[0]?.id ?? '';
  } catch (err) {
    if (!isCurrent()) return;
    error.value = getErrorMessage(err);
  } finally {
    if (isCurrent()) loading.value = false;
  }
}
async function addMember() {
  if (!team.value) return;
  try {
    await organiserService.addMember(team.value.id, memberEmail.value);
    memberEmail.value = '';
    await load();
  } catch (err) {
    error.value = getErrorMessage(err);
  }
}
function getMemberUserTeamId(member: OrganiserUserTeamItem): string {
  return member.userTeamId ?? member.id ?? '';
}
function requestRemoveMember(member: OrganiserUserTeamItem) {
  const id = getMemberUserTeamId(member);
  if (!id) {
    error.value = 'Could not remove member: missing user-team id.';
    return;
  }
  pendingDeleteMember.value = { id, email: member.email };
}
async function confirmRemoveMember() {
  if (!pendingDeleteMember.value) return;
  const id = pendingDeleteMember.value.id;
  pendingDeleteMember.value = null;
  try {
    await organiserService.deleteMember(id);
    await load();
  } catch (err) {
    error.value = getErrorMessage(err);
  }
}
async function createMarking() {
  if (!team.value) return;
  try {
    const response = await organiserService.createMarking(team.value.id, {
      checkPointId: markingForm.checkPointId,
      dt: fromInputDateTime(markingForm.dt) ?? undefined,
      lat: markingForm.lat || null,
      lon: markingForm.lon || null
    });
    markingOk.value = response.statusOk;
    markingMessage.value = response.message;
    await load();
  } catch (err) {
    markingOk.value = false;
    markingMessage.value = getErrorMessage(err);
  }
}
watch(
  () => route.params.teamId,
  (id) => {
    team.value = null;
    checkpoints.value = [];
    pendingDeleteMember.value = null;
    markingMessage.value = '';
    markingOk.value = false;
    Object.assign(markingForm, { checkPointId: '', dt: '', lat: '', lon: '' });
    void load(String(id));
  },
  { immediate: true }
);
</script>
