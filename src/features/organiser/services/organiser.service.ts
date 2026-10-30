import type { PagedResponse } from '@/app/types/api';
import type {
  Id,
  MarkingResponse,
  OrganisationItem,
  OrganiserCheckPointDetails,
  OrganiserCheckPointUpsertRequest,
  OrganiserContestClassDetails,
  OrganiserContestClassUpsertRequest,
  OrganiserContestDetails,
  OrganiserContestUpsertRequest,
  OrganiserMarkingCreateRequest,
  OrganiserMarkingDetails,
  OrganiserMarkingListItem,
  OrganiserMarkingUpdateRequest,
  OrganiserTeamDetails,
  OrganiserTeamUpsertRequest,
  OrganiserUserTeamItem
} from '@/app/types/domain';
import { apiRequest } from '@/shared/api/http';

export const organiserService = {
  organisations: () => apiRequest<OrganisationItem[]>('/api/v1/organiser/Organisations'),
  contests: () => apiRequest<OrganiserContestDetails[]>('/api/v1/organiser/Contests'),
  contest: (id: Id) => apiRequest<OrganiserContestDetails>(`/api/v1/organiser/Contests/${id}`),
  createContest: (payload: OrganiserContestUpsertRequest) =>
    apiRequest<OrganiserContestDetails>('/api/v1/organiser/Contests', {
      method: 'POST',
      body: payload
    }),
  updateContest: (id: Id, payload: OrganiserContestUpsertRequest) =>
    apiRequest<OrganiserContestDetails>(`/api/v1/organiser/Contests/${id}`, {
      method: 'PUT',
      body: payload
    }),
  deleteContest: (id: Id) =>
    apiRequest<null>(`/api/v1/organiser/Contests/${id}`, { method: 'DELETE' }),
  classes: (contestId: Id) =>
    apiRequest<OrganiserContestClassDetails[]>(
      `/api/v1/organiser/contests/${contestId}/contest-classes`
    ),
  createClass: (contestId: Id, payload: OrganiserContestClassUpsertRequest) =>
    apiRequest<OrganiserContestClassDetails>(
      `/api/v1/organiser/contests/${contestId}/contest-classes`,
      { method: 'POST', body: payload }
    ),
  updateClass: (id: Id, payload: OrganiserContestClassUpsertRequest) =>
    apiRequest<OrganiserContestClassDetails>(`/api/v1/organiser/contest-classes/${id}`, {
      method: 'PUT',
      body: payload
    }),
  deleteClass: (id: Id) =>
    apiRequest<null>(`/api/v1/organiser/contest-classes/${id}`, { method: 'DELETE' }),
  checkpoints: (contestId: Id) =>
    apiRequest<OrganiserCheckPointDetails[]>(
      `/api/v1/organiser/contests/${contestId}/check-points`
    ),
  createCheckpoint: (contestId: Id, payload: OrganiserCheckPointUpsertRequest) =>
    apiRequest<OrganiserCheckPointDetails>(`/api/v1/organiser/contests/${contestId}/check-points`, {
      method: 'POST',
      body: payload
    }),
  updateCheckpoint: (id: Id, payload: OrganiserCheckPointUpsertRequest) =>
    apiRequest<OrganiserCheckPointDetails>(`/api/v1/organiser/check-points/${id}`, {
      method: 'PUT',
      body: payload
    }),
  deleteCheckpoint: (id: Id) =>
    apiRequest<null>(`/api/v1/organiser/check-points/${id}`, { method: 'DELETE' }),
  teams: (contestId: Id) =>
    apiRequest<OrganiserTeamDetails[]>(`/api/v1/organiser/contests/${contestId}/teams`),
  team: (id: Id) => apiRequest<OrganiserTeamDetails>(`/api/v1/organiser/Teams/${id}`),
  createTeam: (contestId: Id, payload: OrganiserTeamUpsertRequest) =>
    apiRequest<OrganiserTeamDetails>(`/api/v1/organiser/contests/${contestId}/teams`, {
      method: 'POST',
      body: payload
    }),
  updateTeam: (id: Id, payload: OrganiserTeamUpsertRequest) =>
    apiRequest<OrganiserTeamDetails>(`/api/v1/organiser/Teams/${id}`, {
      method: 'PUT',
      body: payload
    }),
  deleteTeam: (id: Id) => apiRequest<null>(`/api/v1/organiser/Teams/${id}`, { method: 'DELETE' }),
  members: (teamId: Id) =>
    apiRequest<OrganiserUserTeamItem[]>(`/api/v1/organiser/teams/${teamId}/user-teams`),
  addMember: (teamId: Id, email: string) =>
    apiRequest<OrganiserUserTeamItem>(`/api/v1/organiser/teams/${teamId}/user-teams`, {
      method: 'POST',
      body: { email }
    }),
  deleteMember: (id: Id) =>
    apiRequest<null>(`/api/v1/organiser/user-teams/${id}`, { method: 'DELETE' }),
  markings: (contestId: Id, params: { teamId?: Id; page?: number; pageSize?: number }) => {
    const search = new URLSearchParams();
    if (params.teamId) search.set('teamId', params.teamId);
    if (params.page) search.set('page', String(params.page));
    if (params.pageSize) search.set('pageSize', String(params.pageSize));
    return apiRequest<PagedResponse<OrganiserMarkingListItem>>(
      `/api/v1/organiser/contests/${contestId}/markings?${search.toString()}`
    );
  },
  marking: (id: Id) => apiRequest<OrganiserMarkingDetails>(`/api/v1/organiser/Markings/${id}`),
  createMarking: (teamId: Id, payload: OrganiserMarkingCreateRequest) =>
    apiRequest<MarkingResponse>(`/api/v1/organiser/teams/${teamId}/markings`, {
      method: 'POST',
      body: payload
    }),
  updateMarking: (id: Id, payload: OrganiserMarkingUpdateRequest) =>
    apiRequest<OrganiserMarkingDetails>(`/api/v1/organiser/Markings/${id}`, {
      method: 'PUT',
      body: payload
    }),
  deleteMarking: (id: Id) =>
    apiRequest<null>(`/api/v1/organiser/Markings/${id}`, { method: 'DELETE' })
};
