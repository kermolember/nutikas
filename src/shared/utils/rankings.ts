import type { ContestResultTeam } from '@/app/types/domain';

export function groupResultsByClass(
  teams: ContestResultTeam[]
): Record<string, ContestResultTeam[]> {
  return teams.reduce<Record<string, ContestResultTeam[]>>((groups, team) => {
    const key = team.contestClassName || 'Unclassified';
    groups[key] ??= [];
    groups[key].push(team);
    return groups;
  }, {});
}
