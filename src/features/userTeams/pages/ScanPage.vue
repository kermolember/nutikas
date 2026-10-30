<template>
  <section>
    <div class="page-header">
      <div>
        <h1 class="page-title">Scan Checkpoint</h1>
        <p class="page-kicker">Camera scan with manual CPID fallback.</p>
      </div>
      <RouterLink class="btn btn-outline-secondary" :to="`/user-teams/${userTeamId}/live`">
        Live state
      </RouterLink>
    </div>
    <LoadingState v-if="loadingWindow" label="Checking contest window..." />
    <ErrorState v-else-if="windowError" :message="windowError" :retry="loadScanWindow" />
    <div v-else-if="!isContestOpen" class="panel">
      <p class="text-secondary small mb-0">{{ scanStatus }}</p>
    </div>
    <div v-else class="row g-3">
      <div class="col-12 col-lg-7">
        <QrScanner @scan="handleScan" />
      </div>
      <div class="col-12 col-lg-5">
        <form class="panel" @submit.prevent="submitManual">
          <div v-if="message" class="alert" :class="ok ? 'alert-success' : 'alert-warning'">
            {{ message }}
          </div>
          <FormField label="Checkpoint ID">
            <input v-model="manual" class="form-control" placeholder="OPEN-CP-1" />
          </FormField>
          <button class="btn btn-primary" type="submit" :disabled="saving">
            <Send :size="16" />
            {{ saving ? 'Submitting...' : 'Submit marking' }}
          </button>
          <p v-if="geo.error" class="text-secondary small mt-3 mb-0">{{ geo.error }}</p>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Send } from 'lucide-vue-next';
import type { ContestDetails } from '@/app/types/domain';
import { getContest } from '@/features/contests/services/contest.service';
import FormField from '@/shared/components/FormField.vue';
import QrScanner from '@/shared/components/QrScanner.vue';
import ErrorState from '@/shared/components/ErrorState.vue';
import LoadingState from '@/shared/components/LoadingState.vue';
import { getErrorMessage } from '@/shared/api/errors';
import { useGeolocation } from '@/shared/composables/useGeolocation';
import { useNow } from '@/shared/composables/useNow';
import { formatDateTime } from '@/shared/utils/dates';
import { parseQrPayload } from '@/shared/utils/qr';
import { useUserTeamStore } from '../stores/userTeam.store';
import { getUserTeam } from '../services/userTeam.service';
import { submitMarking } from '../services/marking.service';

const route = useRoute();
const router = useRouter();
const userTeamStore = useUserTeamStore();
const userTeamId = computed(() => String(route.params.userTeamId));
const geo = useGeolocation();
const contest = ref<ContestDetails | null>(null);
const loadingWindow = ref(false);
const windowError = ref('');
const manual = ref('');
const saving = ref(false);
const message = ref('');
const ok = ref(false);
const now = useNow();

const isContestOpen = computed(() => {
  if (!contest.value) return false;
  const currentTime = now.value.getTime();
  return (
    new Date(contest.value.openFrom).getTime() <= currentTime &&
    currentTime < new Date(contest.value.openTo).getTime()
  );
});

const scanStatus = computed(() => {
  if (!contest.value) return '';
  const currentTime = now.value.getTime();
  if (currentTime < new Date(contest.value.openFrom).getTime()) {
    return `Opens at ${formatDateTime(contest.value.openFrom)}`;
  }
  if (currentTime >= new Date(contest.value.openTo).getTime()) {
    return 'Contest closed';
  }
  return '';
});

async function loadScanWindow(id = userTeamId.value) {
  const isCurrent = () => id === userTeamId.value;
  loadingWindow.value = true;
  windowError.value = '';
  try {
    const activation = await getUserTeam(id);
    if (!isCurrent()) return;
    const loadedContest = await getContest(activation.contestId);
    if (!isCurrent()) return;
    contest.value = loadedContest;
    userTeamStore.selectContest(activation.contestId);
    userTeamStore.selectUserTeam(activation.userTeamId);
  } catch (err) {
    if (!isCurrent()) return;
    windowError.value = getErrorMessage(err);
  } finally {
    if (isCurrent()) loadingWindow.value = false;
  }
}

async function submitPayload(payload: string) {
  if (!isContestOpen.value) {
    ok.value = false;
    message.value = scanStatus.value;
    return;
  }
  const parsedPayload = parseQrPayload(payload);
  if (!parsedPayload.checkPointId) return;
  saving.value = true;
  message.value = '';
  try {
    const hasQrLocation = Boolean(parsedPayload.lat && parsedPayload.lon);
    const location = hasQrLocation
      ? { lat: parsedPayload.lat, lon: parsedPayload.lon }
      : await geo.capture();
    const response = await submitMarking({
      checkPointId: parsedPayload.checkPointId,
      userTeamId: userTeamId.value,
      lat: location.lat,
      lon: location.lon,
      dt: new Date().toISOString()
    });
    ok.value = response.statusOk;
    message.value = response.message;
    userTeamStore.setLastScanMessage(response.message);
    if (response.result) {
      await router.push(`/user-teams/${userTeamId.value}/live`);
    }
  } catch (err) {
    ok.value = false;
    message.value = getErrorMessage(err);
  } finally {
    saving.value = false;
  }
}

function handleScan(payload: string) {
  if (!saving.value && isContestOpen.value) void submitPayload(payload);
}

function submitManual() {
  void submitPayload(manual.value);
}

watch(
  userTeamId,
  (id) => {
    contest.value = null;
    message.value = '';
    void loadScanWindow(id);
  },
  { immediate: true }
);
</script>
