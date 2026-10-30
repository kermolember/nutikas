<template>
  <section>
    <div class="page-header">
      <div>
        <h1 class="page-title">Checkpoints</h1>
        <p class="page-kicker">The QR payload is the CPID string.</p>
      </div>
      <RouterLink
        class="btn btn-outline-secondary"
        :to="`/organiser/contests/${contestId}/qr-print`"
      >
        <QrCode :size="16" /> Print QR
      </RouterLink>
    </div>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    <div class="panel mb-3">
      <form class="form-grid" @submit.prevent="save">
        <FormField label="CPID"
          ><input v-model="form.cpid" class="form-control" required
        /></FormField>
        <FormField label="Code">
          <input
            v-model="form.cpCode"
            class="form-control"
            inputmode="numeric"
            pattern="[1-9][0-9]*"
            title="Use a positive whole number."
            required
          />
        </FormField>
        <FormField label="Type">
          <select v-model.number="form.checkPointType" class="form-select">
            <option :value="1">Regular</option>
            <option :value="2">Finish</option>
            <option :value="3">Start</option>
            <option :value="4">No score</option>
          </select>
        </FormField>
        <FormField v-if="form.checkPointType === 1" label="Score"
          ><input v-model.number="form.score" type="number" class="form-control"
        /></FormField>
        <FormField label="Latitude"><input v-model="form.lat" class="form-control" /></FormField>
        <FormField label="Longitude"><input v-model="form.lon" class="form-control" /></FormField>
        <div class="actions align-self-end">
          <button class="btn btn-primary" type="submit">
            <Save :size="16" />{{ editingId ? 'Update' : 'Create' }}
          </button>
          <button class="btn btn-outline-secondary" type="button" @click="reset">Clear</button>
        </div>
      </form>
    </div>
    <div class="row g-3">
      <div class="col-12 col-lg-7">
        <LoadingState v-if="loading" />
        <DataTable v-else>
          <template #head
            ><th>CPID</th>
            <th>Code</th>
            <th>Type</th>
            <th>Score</th>
            <th></th
          ></template>
          <tr v-for="item in items" :key="item.id">
            <td>{{ item.cpid }}</td>
            <td>{{ item.cpCode }}</td>
            <td>{{ checkpointTypeLabels[item.checkPointType] }}</td>
            <td>{{ item.score }}</td>
            <td class="text-end actions justify-content-end">
              <button class="btn btn-sm btn-outline-primary" @click="edit(item)">Edit</button>
              <button class="btn btn-sm btn-outline-danger" @click="requestRemove(item)">
                Delete
              </button>
            </td>
          </tr>
        </DataTable>
      </div>
      <div class="col-12 col-lg-5">
        <LeafletMap
          :checkpoints="mapPoints"
          :selected-point="selectedMapPoint"
          @map-click="setCoordinatesFromMap"
        />
      </div>
    </div>
    <ConfirmDialog
      v-model="deleteDialogOpen"
      title="Delete checkpoint"
      :message="deleteMessage"
      @confirm="confirmRemove"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { QrCode, Save } from 'lucide-vue-next';
import { checkpointTypeLabels } from '@/app/config/constants';
import type {
  OrganiserCheckPointDetails,
  OrganiserCheckPointUpsertRequest
} from '@/app/types/domain';
import { getErrorMessage } from '@/shared/api/errors';
import ConfirmDialog from '@/shared/components/ConfirmDialog.vue';
import DataTable from '@/shared/components/DataTable.vue';
import FormField from '@/shared/components/FormField.vue';
import LeafletMap from '@/shared/components/LeafletMap.vue';
import LoadingState from '@/shared/components/LoadingState.vue';
import { organiserService } from '../services/organiser.service';

const route = useRoute();
const contestId = computed(() => String(route.params.contestId));
const items = ref<OrganiserCheckPointDetails[]>([]);
const loading = ref(false);
const error = ref('');
const editingId = ref('');
const pendingDelete = ref<OrganiserCheckPointDetails | null>(null);
const naturalNumberPattern = /^[1-9]\d*$/;
const form = reactive<OrganiserCheckPointUpsertRequest>({
  cpid: '',
  cpCode: '',
  checkPointType: 1,
  score: 0,
  lat: null,
  lon: null
});
const mapPoints = computed(() =>
  items.value.map((item) => ({
    lat: item.lat,
    lon: item.lon,
    label: item.cpCode,
    type: item.checkPointType,
    score: item.score
  }))
);
const selectedMapPoint = computed(() => ({
  lat: form.lat,
  lon: form.lon,
  label: form.cpCode || (editingId.value ? 'Selected' : 'New'),
  type: form.checkPointType,
  score: form.score
}));
const checkpointPayload = computed<OrganiserCheckPointUpsertRequest>(() => ({
  ...form,
  cpCode: form.cpCode.trim(),
  score: form.checkPointType === 1 ? form.score : 0
}));
const deleteDialogOpen = computed({
  get: () => Boolean(pendingDelete.value),
  set: (value: boolean) => {
    if (!value) pendingDelete.value = null;
  }
});
const deleteMessage = computed(() =>
  pendingDelete.value
    ? `Delete checkpoint "${pendingDelete.value.cpid}"? This cannot be undone.`
    : 'Delete this checkpoint? This cannot be undone.'
);

function reset() {
  editingId.value = '';
  Object.assign(form, { cpid: '', cpCode: '', checkPointType: 1, score: 0, lat: null, lon: null });
}
function edit(item: OrganiserCheckPointDetails) {
  editingId.value = item.id;
  Object.assign(form, {
    cpid: item.cpid,
    cpCode: item.cpCode,
    checkPointType: item.checkPointType,
    score: item.score,
    lat: item.lat,
    lon: item.lon
  });
}
function setCoordinatesFromMap(coords: { lat: number; lon: number }) {
  form.lat = coords.lat.toFixed(6);
  form.lon = coords.lon.toFixed(6);
}
async function load(id = contestId.value) {
  const isCurrent = () => id === contestId.value;
  loading.value = true;
  error.value = '';
  try {
    const loadedItems = await organiserService.checkpoints(id);
    if (!isCurrent()) return;
    items.value = loadedItems;
  } catch (err) {
    if (!isCurrent()) return;
    error.value = getErrorMessage(err);
  } finally {
    if (isCurrent()) loading.value = false;
  }
}
async function save() {
  if (!naturalNumberPattern.test(form.cpCode.trim())) {
    error.value = 'Code must be a natural number.';
    return;
  }
  try {
    editingId.value
      ? await organiserService.updateCheckpoint(editingId.value, checkpointPayload.value)
      : await organiserService.createCheckpoint(contestId.value, checkpointPayload.value);
    reset();
    await load();
  } catch (err) {
    error.value = getErrorMessage(err);
  }
}
function requestRemove(item: OrganiserCheckPointDetails) {
  pendingDelete.value = item;
}
async function confirmRemove() {
  if (!pendingDelete.value) return;
  const id = pendingDelete.value.id;
  pendingDelete.value = null;
  try {
    await organiserService.deleteCheckpoint(id);
    await load();
  } catch (err) {
    error.value = getErrorMessage(err);
  }
}
watch(
  () => form.checkPointType,
  (checkPointType) => {
    if (checkPointType !== 1) form.score = 0;
  }
);
watch(
  contestId,
  (id) => {
    reset();
    void load(id);
  },
  { immediate: true }
);
</script>
