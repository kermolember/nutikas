<template>
  <section>
    <LoadingState v-if="loading" label="Loading map data..." />
    <ErrorState v-else-if="error" :message="error" :retry="load" />
    <template v-else>
      <div class="page-header">
        <div>
          <h1 class="page-title">Event Map</h1>
          <p class="page-kicker">Routes use marking coordinates returned by the API.</p>
        </div>
      </div>
      <MapFilters>
        <FormField label="Team">
          <select v-model="selectedTeamId" class="form-select" @change="loadTeam()">
            <option value="">Select team</option>
            <option v-for="team in results?.teams ?? []" :key="team.id" :value="team.id">
              {{ team.name }}
            </option>
          </select>
        </FormField>
      </MapFilters>
      <div class="panel mb-3">
        <RouteLayer :count="routePoints.length" />
      </div>
      <LeafletMap :route="routePoints" />
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import type { ContestResults, TeamResultDetail } from '@/app/types/domain';
import { getErrorMessage } from '@/shared/api/errors';
import ErrorState from '@/shared/components/ErrorState.vue';
import FormField from '@/shared/components/FormField.vue';
import LeafletMap from '@/shared/components/LeafletMap.vue';
import LoadingState from '@/shared/components/LoadingState.vue';
import { hasCoordinate } from '@/shared/utils/coordinates';
import { getContestResults, getTeamResult } from '@/features/contests/services/contest.service';
import MapFilters from '../components/MapFilters.vue';
import RouteLayer from '../components/RouteLayer.vue';

const route = useRoute();
const contestId = computed(() => String(route.params.contestId));
const results = ref<ContestResults | null>(null);
const team = ref<TeamResultDetail | null>(null);
const selectedTeamId = ref(String(route.query.teamId || ''));
const loading = ref(false);
const error = ref('');

const routePoints = computed(() =>
  (team.value?.markings ?? []).filter(hasCoordinate).map((marking) => ({
    lat: marking.lat,
    lon: marking.lon,
    label: marking.checkPointCPID,
    type: marking.checkPointType,
    score: marking.score
  }))
);

async function loadTeam(requestContestId = contestId.value, requestTeamId = selectedTeamId.value) {
  team.value = null;
  if (!requestTeamId) return;
  const loadedTeam = await getTeamResult(requestContestId, requestTeamId);
  if (requestContestId !== contestId.value || requestTeamId !== selectedTeamId.value) return;
  team.value = loadedTeam;
}

async function load(requestContestId = contestId.value, requestTeamId = selectedTeamId.value) {
  const isCurrent = () => requestContestId === contestId.value;
  loading.value = true;
  error.value = '';
  try {
    const loadedResults = await getContestResults(requestContestId);
    if (!isCurrent()) return;
    results.value = loadedResults;
    const nextTeamId = requestTeamId || loadedResults.teams[0]?.id || '';
    selectedTeamId.value = nextTeamId;
    await loadTeam(requestContestId, nextTeamId);
  } catch (err) {
    if (!isCurrent()) return;
    error.value = getErrorMessage(err);
  } finally {
    if (isCurrent()) loading.value = false;
  }
}

watch(
  () => [route.params.contestId, route.query.teamId],
  ([, queryTeamId]) => {
    results.value = null;
    team.value = null;
    selectedTeamId.value = String(queryTeamId || '');
    void load(contestId.value, selectedTeamId.value);
  },
  { immediate: true }
);
</script>
