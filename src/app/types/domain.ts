export type Id = string;

export interface ContestListItem {
  id: Id;
  name: string;
  visibleFrom: string;
  openFrom: string;
  openTo: string;
  isOpenForParticipation: boolean;
  hasResults: boolean;
}

export interface ContestClass {
  id: Id;
  name: string;
  orderNr: number;
  duration: number;
  maxDuration: number | null;
  overDurationUnit?: number;
  overDurationPenalty?: number;
}

export interface ContestDetails {
  id: Id;
  name: string;
  openFrom: string;
  openTo: string;
  contestClasses: ContestClass[];
}

export interface ContestResultTeam {
  id: Id;
  name: string;
  memberNames: string;
  contestClassId: Id;
  contestClassName: string;
  contestClassOrderNr: number;
  startDT: string | null;
  finishDT: string | null;
  score: number;
  bonus: number;
  penalty: number;
  finalScore: number;
}

export interface ContestResults {
  contest: ContestListItem;
  teams: ContestResultTeam[];
}

export interface MarkingListItem {
  id: Id;
  dt: string;
  checkPointId: Id;
  checkPointCPID: string;
  checkPointCPCode: string;
  checkPointType: number;
  score: number;
  lat: string | null;
  lon: string | null;
}

export interface TeamResultDetail extends ContestResultTeam {
  markings: MarkingListItem[];
}

export interface UserTeamListItem {
  id: Id;
  teamId: Id;
  teamName: string;
  memberNames: string;
  contestClassId: Id;
  contestClassName: string;
  startDT: string | null;
  finishDT: string | null;
  finalScore: number;
}

export interface UserTeamActivation {
  userTeamId: Id;
  teamName: string;
  contestId: Id;
  contestName: string;
  contestClassName: string;
  startDT: string | null;
  finishDT: string | null;
  score: number;
  bonus: number;
  penalty: number;
  finalScore: number;
  markings: MarkingListItem[];
}

export interface TeamRegistrationRequest {
  teamName: string;
  teamMembers: string;
  contestClassId: Id;
}

export interface MarkingRequest {
  checkPointId: string;
  userTeamId: Id;
  lat?: string | null;
  lon?: string | null;
  dt?: string;
}

export interface MarkingResponse {
  statusOk: boolean;
  statusCode: number;
  message: string;
  result: UserTeamActivation | null;
}

export interface OrganisationItem {
  id: Id;
  organisationName: string;
}

export interface OrganiserContestDetails {
  id: Id;
  name: string;
  visibleFrom: string;
  openFrom: string;
  openTo: string;
  bonusTimeStart: string | null;
  bonusTimeEnd: string | null;
  bonusPerMarking: number;
  organisationId: Id;
  organisationName: string;
}

export type OrganiserContestUpsertRequest = Omit<
  OrganiserContestDetails,
  'id' | 'organisationName'
>;

export interface OrganiserContestClassDetails extends ContestClass {
  contestId: Id;
  overDurationUnit: number;
  overDurationPenalty: number;
}

export type OrganiserContestClassUpsertRequest = Omit<
  OrganiserContestClassDetails,
  'id' | 'contestId'
>;

export interface OrganiserCheckPointDetails {
  id: Id;
  contestId: Id;
  cpid: string;
  cpCode: string;
  checkPointType: number;
  score: number;
  lat: string | null;
  lon: string | null;
}

export type OrganiserCheckPointUpsertRequest = Omit<OrganiserCheckPointDetails, 'id' | 'contestId'>;

export interface OrganiserUserTeamItem {
  id?: Id;
  userTeamId?: Id;
  userId: Id;
  email: string;
  teamId: Id;
}

export interface OrganiserTeamDetails {
  id: Id;
  name: string;
  memberNames: string;
  contestId: Id;
  contestClassId: Id;
  contestClassName: string;
  createdDT: string;
  startDT: string | null;
  finishDT: string | null;
  score: number;
  bonus: number;
  penalty: number;
  finalScore: number;
  members: OrganiserUserTeamItem[];
}

export type OrganiserTeamUpsertRequest = Omit<
  OrganiserTeamDetails,
  'id' | 'contestId' | 'contestClassName' | 'createdDT' | 'members'
>;

export interface OrganiserMarkingListItem extends MarkingListItem {
  markingType: number;
  userTeamId: Id;
  teamId: Id;
  teamName: string;
}

export interface OrganiserMarkingDetails extends OrganiserMarkingListItem {
  contestId: Id;
  contestName: string;
}

export interface OrganiserMarkingCreateRequest {
  checkPointId: Id;
  dt?: string;
  lat?: string | null;
  lon?: string | null;
}

export interface OrganiserMarkingUpdateRequest {
  dt: string;
  lat: string | null;
  lon: string | null;
  markingType: number;
  score: number;
  checkPointId: Id;
  userTeamId: Id;
}
