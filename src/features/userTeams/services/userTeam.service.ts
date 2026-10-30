import type {
  TeamRegistrationRequest,
  UserTeamActivation,
  UserTeamListItem
} from '@/app/types/domain';
import { apiRequest } from '@/shared/api/http';

export function registerTeam(contestId: string, payload: TeamRegistrationRequest) {
  return apiRequest<UserTeamListItem>(`/api/v1/Contests/${contestId}/teams`, {
    method: 'POST',
    body: payload
  });
}

export function getMyTeams(contestId: string) {
  return apiRequest<UserTeamListItem[]>(`/api/v1/Contests/${contestId}/userteams`);
}

export function getUserTeam(userTeamId: string) {
  return apiRequest<UserTeamActivation>(`/api/v1/UserTeams/${userTeamId}`);
}
