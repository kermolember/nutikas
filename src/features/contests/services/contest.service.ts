import type {
  ContestDetails,
  ContestListItem,
  ContestResults,
  TeamResultDetail
} from '@/app/types/domain';
import { apiRequest } from '@/shared/api/http';

export function getContests() {
  return apiRequest<ContestListItem[]>('/api/v1/Contests', { auth: false });
}

export function getContest(contestId: string) {
  return apiRequest<ContestDetails>(`/api/v1/Contests/${contestId}`, { auth: false });
}

export function getContestResults(contestId: string) {
  return apiRequest<ContestResults>(`/api/v1/Contests/${contestId}/results`, { auth: false });
}

export function getTeamResult(contestId: string, teamId: string) {
  return apiRequest<TeamResultDetail>(`/api/v1/Contests/${contestId}/teams/${teamId}`, {
    auth: false
  });
}
