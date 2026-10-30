<template>
  <section>
    <div class="page-header">
      <div>
        <h1 class="page-title">Classes</h1>
        <p class="page-kicker">Durations and penalties are seconds.</p>
      </div>
    </div>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    <div class="panel mb-3">
      <form class="form-grid" @submit.prevent="save">
        <FormField label="Name"
          ><input v-model="form.name" class="form-control" required
        /></FormField>
        <FormField label="Order"
          ><input v-model.number="form.orderNr" type="number" class="form-control"
        /></FormField>
        <FormField label="Duration"
          ><input v-model.number="form.duration" type="number" class="form-control"
        /></FormField>
        <FormField label="Max duration"
          ><input v-model.number="form.maxDuration" type="number" class="form-control"
        /></FormField>
        <FormField label="Penalty unit"
          ><input v-model.number="form.overDurationUnit" type="number" class="form-control"
        /></FormField>
        <FormField label="Penalty"
          ><input v-model.number="form.overDurationPenalty" type="number" class="form-control"
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
        ><th>Name</th>
        <th>Order</th>
        <th>Duration</th>
        <th>Penalty</th>
        <th></th
      ></template>
      <tr v-for="item in items" :key="item.id">
        <td>{{ item.name }}</td>
        <td>{{ item.orderNr }}</td>
        <td>{{ item.duration }}</td>
        <td>{{ item.overDurationPenalty }} / {{ item.overDurationUnit }}</td>
        <td class="text-end actions justify-content-end">
          <button class="btn btn-sm btn-outline-primary" @click="edit(item)">Edit</button>
          <button class="btn btn-sm btn-outline-danger" @click="requestRemove(item)">Delete</button>
        </td>
      </tr>
    </DataTable>
    <ConfirmDialog
      v-model="deleteDialogOpen"
      title="Delete class"
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
  OrganiserContestClassUpsertRequest
} from '@/app/types/domain';
import { getErrorMessage } from '@/shared/api/errors';
import ConfirmDialog from '@/shared/components/ConfirmDialog.vue';
import DataTable from '@/shared/components/DataTable.vue';
import FormField from '@/shared/components/FormField.vue';
import LoadingState from '@/shared/components/LoadingState.vue';
import { organiserService } from '../services/organiser.service';

const route = useRoute();
const contestId = computed(() => String(route.params.contestId));
const items = ref<OrganiserContestClassDetails[]>([]);
const loading = ref(false);
const error = ref('');
const editingId = ref('');
const pendingDelete = ref<OrganiserContestClassDetails | null>(null);
const deleteDialogOpen = computed({
  get: () => Boolean(pendingDelete.value),
  set: (value: boolean) => {
    if (!value) pendingDelete.value = null;
  }
});
const deleteMessage = computed(() =>
  pendingDelete.value
    ? `Delete class "${pendingDelete.value.name}"? This cannot be undone.`
    : 'Delete this class? This cannot be undone.'
);
const form = reactive<OrganiserContestClassUpsertRequest>({
  name: '',
  orderNr: 1,
  duration: 3600,
  maxDuration: null,
  overDurationUnit: 60,
  overDurationPenalty: 1
});

function reset() {
  editingId.value = '';
  Object.assign(form, {
    name: '',
    orderNr: 1,
    duration: 3600,
    maxDuration: null,
    overDurationUnit: 60,
    overDurationPenalty: 1
  });
}
function edit(item: OrganiserContestClassDetails) {
  editingId.value = item.id;
  Object.assign(form, {
    name: item.name,
    orderNr: item.orderNr,
    duration: item.duration,
    maxDuration: item.maxDuration,
    overDurationUnit: item.overDurationUnit,
    overDurationPenalty: item.overDurationPenalty
  });
}
async function load(id = contestId.value) {
  const isCurrent = () => id === contestId.value;
  loading.value = true;
  error.value = '';
  try {
    const loadedItems = await organiserService.classes(id);
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
  try {
    editingId.value
      ? await organiserService.updateClass(editingId.value, form)
      : await organiserService.createClass(contestId.value, form);
    reset();
    await load();
  } catch (err) {
    error.value = getErrorMessage(err);
  }
}
function requestRemove(item: OrganiserContestClassDetails) {
  pendingDelete.value = item;
}
async function confirmRemove() {
  if (!pendingDelete.value) return;
  const id = pendingDelete.value.id;
  pendingDelete.value = null;
  try {
    await organiserService.deleteClass(id);
    await load();
  } catch (err) {
    error.value = getErrorMessage(err);
  }
}
watch(
  contestId,
  (id) => {
    reset();
    void load(id);
  },
  { immediate: true }
);
</script>
