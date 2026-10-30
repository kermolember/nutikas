<template>
  <section>
    <LoadingState v-if="loadingContest" label="Loading contest..." />
    <ErrorState v-else-if="error" :message="error" :retry="loadContest" />
    <template v-else-if="contest">
      <div class="page-header">
        <div>
          <h1 class="page-title">Register Team</h1>
          <p class="page-kicker">{{ contest.name }}</p>
        </div>
      </div>
      <form class="panel" @submit.prevent="submit">
        <div v-if="hasEnded" class="alert alert-warning">
          This contest has ended. Team registration is closed.
        </div>
        <div v-if="submitError" class="alert alert-danger">{{ submitError }}</div>
        <FormField label="Team name">
          <input
            v-model="form.teamName"
            class="form-control"
            maxlength="128"
            :disabled="hasEnded"
            required
          />
        </FormField>
        <FormField label="Members">
          <input
            v-model="form.teamMembers"
            class="form-control"
            maxlength="255"
            :disabled="hasEnded"
            required
          />
        </FormField>
        <FormField label="Class">
          <select v-model="form.contestClassId" class="form-select" :disabled="hasEnded" required>
            <option value="" disabled>Select class</option>
            <option v-for="item in contest.contestClasses" :key="item.id" :value="item.id">
              {{ item.name }}
            </option>
          </select>
        </FormField>
        <button class="btn btn-primary" type="submit" :disabled="saving || hasEnded">
          <Plus :size="16" />
          {{ hasEnded ? 'Registration closed' : saving ? 'Registering...' : 'Register team' }}
        </button>
      </form>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Plus } from 'lucide-vue-next';
import type { ContestDetails } from '@/app/types/domain';
import { getContest } from '@/features/contests/services/contest.service';
import { getErrorMessage } from '@/shared/api/errors';
import ErrorState from '@/shared/components/ErrorState.vue';
import FormField from '@/shared/components/FormField.vue';
import LoadingState from '@/shared/components/LoadingState.vue';
import { useUserTeamStore } from '../stores/userTeam.store';
import { registerTeam } from '../services/userTeam.service';

const route = useRoute();
const router = useRouter();
const store = useUserTeamStore();
const contestId = computed(() => String(route.params.contestId));
const contest = ref<ContestDetails | null>(null);
const loadingContest = ref(false);
const saving = ref(false);
const error = ref('');
const submitError = ref('');
const form = reactive({ teamName: '', teamMembers: '', contestClassId: '' });
const hasEnded = computed(() =>
  contest.value ? new Date(contest.value.openTo).getTime() <= Date.now() : false
);

async function loadContest(id = contestId.value) {
  const isCurrent = () => id === contestId.value;
  loadingContest.value = true;
  error.value = '';
  try {
    const loadedContest = await getContest(id);
    if (!isCurrent()) return;
    contest.value = loadedContest;
    form.contestClassId = loadedContest.contestClasses[0]?.id ?? '';
  } catch (err) {
    if (!isCurrent()) return;
    error.value = getErrorMessage(err);
  } finally {
    if (isCurrent()) loadingContest.value = false;
  }
}

async function submit() {
  if (hasEnded.value) {
    submitError.value = 'This contest has ended. Team registration is closed.';
    return;
  }
  saving.value = true;
  submitError.value = '';
  try {
    const result = await registerTeam(contestId.value, form);
    store.selectContest(contestId.value);
    store.selectUserTeam(result.id);
    await router.push(`/user-teams/${result.id}/live`);
  } catch (err) {
    submitError.value = getErrorMessage(err);
  } finally {
    saving.value = false;
  }
}

watch(
  contestId,
  (id) => {
    contest.value = null;
    submitError.value = '';
    Object.assign(form, { teamName: '', teamMembers: '', contestClassId: '' });
    void loadContest(id);
  },
  { immediate: true }
);
</script>
