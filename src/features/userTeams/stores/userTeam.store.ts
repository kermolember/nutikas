import { defineStore } from 'pinia';

export const useUserTeamStore = defineStore('userTeam', {
  state: () => ({
    selectedContestId: localStorage.getItem('nutikas.selectedContestId') || '',
    selectedUserTeamId: localStorage.getItem('nutikas.selectedUserTeamId') || '',
    lastScanMessage: ''
  }),
  actions: {
    selectContest(contestId: string) {
      this.selectedContestId = contestId;
      localStorage.setItem('nutikas.selectedContestId', contestId);
    },
    selectUserTeam(userTeamId: string) {
      this.selectedUserTeamId = userTeamId;
      localStorage.setItem('nutikas.selectedUserTeamId', userTeamId);
    },
    setLastScanMessage(message: string) {
      this.lastScanMessage = message;
    }
  }
});
