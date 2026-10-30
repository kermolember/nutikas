<template>
  <section>
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ isNew ? 'New Contest' : 'Edit Contest' }}</h1>
        <p class="page-kicker">Times are sent to the API as UTC ISO strings.</p>
      </div>
      <button
        v-if="!isNew"
        class="btn btn-outline-danger"
        type="button"
        :disabled="loading || saving || ending || isEnded"
        @click="endContest"
      >
        {{ isEnded ? 'Ended' : ending ? 'Ending...' : 'End contest' }}
      </button>
    </div>
    <LoadingState v-if="loading" label="Loading form..." />
    <form v-else class="panel" @submit.prevent="submit">
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <FormField label="Name">
        <input v-model="form.name" class="form-control" maxlength="128" required />
      </FormField>
      <div class="form-grid">
        <FormField label="Organisation">
          <select v-model="form.organisationId" class="form-select" required>
            <option value="" disabled>Select organisation</option>
            <option v-for="org in organisations" :key="org.id" :value="org.id">
              {{ org.organisationName }}
            </option>
          </select>
        </FormField>
        <FormField label="Visible from">
          <input
            v-model="dateForm.visibleFrom"
            type="datetime-local"
            class="form-control"
            required
          />
        </FormField>
        <FormField label="Open from">
          <input v-model="dateForm.openFrom" type="datetime-local" class="form-control" required />
        </FormField>
        <FormField label="Open to">
          <input v-model="dateForm.openTo" type="datetime-local" class="form-control" required />
        </FormField>
        <FormField label="Bonus window start">
          <input v-model="dateForm.bonusTimeStart" type="datetime-local" class="form-control" />
        </FormField>
        <FormField label="Bonus window end">
          <input v-model="dateForm.bonusTimeEnd" type="datetime-local" class="form-control" />
        </FormField>
        <FormField label="Bonus per marking">
          <input v-model.number="form.bonusPerMarking" type="number" min="0" class="form-control" />
        </FormField>
      </div>
      <div class="actions mt-3">
        <button class="btn btn-primary" type="submit" :disabled="saving">
          <Save :size="16" />
          {{ saving ? 'Saving...' : 'Save' }}
        </button>
        <RouterLink class="btn btn-outline-secondary" to="/organiser">Cancel</RouterLink>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Save } from 'lucide-vue-next';
import type { OrganisationItem, OrganiserContestUpsertRequest } from '@/app/types/domain';
import { getErrorMessage } from '@/shared/api/errors';
import FormField from '@/shared/components/FormField.vue';
import LoadingState from '@/shared/components/LoadingState.vue';
import { fromInputDateTime, toInputDateTime } from '@/shared/utils/dates';
import { organiserService } from '../services/organiser.service';

const route = useRoute();
const router = useRouter();
const contestId = computed(() => (route.params.contestId ? String(route.params.contestId) : ''));
const isNew = computed(() => !contestId.value);
const loading = ref(false);
const saving = ref(false);
const ending = ref(false);
const error = ref('');
const organisations = ref<OrganisationItem[]>([]);
const form = reactive({ name: '', organisationId: '', bonusPerMarking: 0 });
const dateForm = reactive({
  visibleFrom: toInputDateTime(new Date().toISOString()),
  openFrom: toInputDateTime(new Date().toISOString()),
  openTo: toInputDateTime(new Date(Date.now() + 3600000).toISOString()),
  bonusTimeStart: '',
  bonusTimeEnd: ''
});
const isEnded = computed(() => {
  const openTo = fromInputDateTime(dateForm.openTo);
  return openTo ? new Date(openTo).getTime() <= Date.now() : false;
});

function resetForm() {
  const now = new Date();
  form.name = '';
  form.organisationId = '';
  form.bonusPerMarking = 0;
  dateForm.visibleFrom = toInputDateTime(now.toISOString());
  dateForm.openFrom = toInputDateTime(now.toISOString());
  dateForm.openTo = toInputDateTime(new Date(now.getTime() + 3600000).toISOString());
  dateForm.bonusTimeStart = '';
  dateForm.bonusTimeEnd = '';
}

function payload(): OrganiserContestUpsertRequest {
  return {
    name: form.name,
    organisationId: form.organisationId,
    visibleFrom: fromInputDateTime(dateForm.visibleFrom)!,
    openFrom: fromInputDateTime(dateForm.openFrom)!,
    openTo: fromInputDateTime(dateForm.openTo)!,
    bonusTimeStart: fromInputDateTime(dateForm.bonusTimeStart),
    bonusTimeEnd: fromInputDateTime(dateForm.bonusTimeEnd),
    bonusPerMarking: form.bonusPerMarking || 0
  };
}

async function load(id = contestId.value) {
  const isCurrent = () => id === contestId.value;
  loading.value = true;
  error.value = '';
  try {
    resetForm();
    const loadedOrganisations = await organiserService.organisations();
    if (!isCurrent()) return;
    organisations.value = loadedOrganisations;
    form.organisationId = loadedOrganisations[0]?.id ?? '';
    if (id) {
      const contest = await organiserService.contest(id);
      if (!isCurrent()) return;
      form.name = contest.name;
      form.organisationId = contest.organisationId;
      form.bonusPerMarking = contest.bonusPerMarking;
      dateForm.visibleFrom = toInputDateTime(contest.visibleFrom);
      dateForm.openFrom = toInputDateTime(contest.openFrom);
      dateForm.openTo = toInputDateTime(contest.openTo);
      dateForm.bonusTimeStart = toInputDateTime(contest.bonusTimeStart);
      dateForm.bonusTimeEnd = toInputDateTime(contest.bonusTimeEnd);
    }
  } catch (err) {
    if (!isCurrent()) return;
    error.value = getErrorMessage(err);
  } finally {
    if (isCurrent()) loading.value = false;
  }
}

async function submit() {
  saving.value = true;
  error.value = '';
  try {
    const saved = isNew.value
      ? await organiserService.createContest(payload())
      : await organiserService.updateContest(contestId.value, payload());
    await router.push(`/organiser/contests/${saved.id}`);
  } catch (err) {
    error.value = getErrorMessage(err);
  } finally {
    saving.value = false;
  }
}

async function endContest() {
  if (
    !window.confirm('End this contest now? This closes participation and reveals team markings.')
  ) {
    return;
  }

  saving.value = true;
  ending.value = true;
  error.value = '';
  try {
    dateForm.openTo = toInputDateTime(new Date().toISOString());
    const saved = await organiserService.updateContest(contestId.value, payload());
    dateForm.openTo = toInputDateTime(saved.openTo);
  } catch (err) {
    error.value = getErrorMessage(err);
  } finally {
    ending.value = false;
    saving.value = false;
  }
}

watch(
  contestId,
  (id) => {
    void load(id);
  },
  { immediate: true }
);
</script>
