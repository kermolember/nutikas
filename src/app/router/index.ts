import { createRouter, createWebHistory } from 'vue-router';
import { authGuard } from './guards';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/contests' },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/features/auth/pages/LoginPage.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/features/auth/pages/RegisterPage.vue')
    },
    {
      path: '/contests',
      name: 'contests',
      component: () => import('@/features/contests/pages/ContestListPage.vue')
    },
    {
      path: '/contests/:contestId',
      name: 'contest-details',
      component: () => import('@/features/contests/pages/ContestDetailsPage.vue')
    },
    {
      path: '/contests/:contestId/results',
      name: 'contest-results',
      component: () => import('@/features/contests/pages/ContestResultsPage.vue')
    },
    {
      path: '/contests/:contestId/results/:teamId',
      name: 'team-result',
      component: () => import('@/features/contests/pages/TeamResultPage.vue')
    },
    {
      path: '/contests/:contestId/map',
      name: 'event-map',
      component: () => import('@/features/maps/pages/EventMapPage.vue')
    },
    {
      path: '/contests/:contestId/register-team',
      name: 'register-team',
      meta: { requiresAuth: true },
      component: () => import('@/features/userTeams/pages/RegisterTeamPage.vue')
    },
    {
      path: '/contests/:contestId/my-teams',
      name: 'my-teams',
      meta: { requiresAuth: true },
      component: () => import('@/features/userTeams/pages/MyTeamsPage.vue')
    },
    {
      path: '/user-teams/:userTeamId/live',
      name: 'live-team',
      meta: { requiresAuth: true },
      component: () => import('@/features/userTeams/pages/LiveTeamPage.vue')
    },
    {
      path: '/user-teams/:userTeamId/scan',
      name: 'scan',
      meta: { requiresAuth: true },
      component: () => import('@/features/userTeams/pages/ScanPage.vue')
    },
    {
      path: '/organiser',
      name: 'organiser',
      meta: { requiresAuth: true, requiresOrganiser: true },
      component: () => import('@/features/organiser/pages/OrganiserDashboardPage.vue')
    },
    {
      path: '/organiser/contests',
      name: 'organiser-contests',
      meta: { requiresAuth: true, requiresOrganiser: true },
      component: () => import('@/features/organiser/pages/OrganiserDashboardPage.vue')
    },
    {
      path: '/organiser/contests/new',
      name: 'organiser-contest-new',
      meta: { requiresAuth: true, requiresOrganiser: true },
      component: () => import('@/features/organiser/pages/OrganiserContestEditPage.vue')
    },
    {
      path: '/organiser/contests/:contestId',
      name: 'organiser-contest-detail',
      meta: { requiresAuth: true, requiresOrganiser: true },
      component: () => import('@/features/organiser/pages/OrganiserContestDetailPage.vue')
    },
    {
      path: '/organiser/contests/:contestId/edit',
      name: 'organiser-contest-edit',
      meta: { requiresAuth: true, requiresOrganiser: true },
      component: () => import('@/features/organiser/pages/OrganiserContestEditPage.vue')
    },
    {
      path: '/organiser/contests/:contestId/classes',
      name: 'organiser-classes',
      meta: { requiresAuth: true, requiresOrganiser: true },
      component: () => import('@/features/organiser/pages/OrganiserClassesPage.vue')
    },
    {
      path: '/organiser/contests/:contestId/checkpoints',
      name: 'organiser-checkpoints',
      meta: { requiresAuth: true, requiresOrganiser: true },
      component: () => import('@/features/organiser/pages/OrganiserCheckpointsPage.vue')
    },
    {
      path: '/organiser/contests/:contestId/teams',
      name: 'organiser-teams',
      meta: { requiresAuth: true, requiresOrganiser: true },
      component: () => import('@/features/organiser/pages/OrganiserTeamsPage.vue')
    },
    {
      path: '/organiser/teams/:teamId',
      name: 'organiser-team-detail',
      meta: { requiresAuth: true, requiresOrganiser: true },
      component: () => import('@/features/organiser/pages/OrganiserTeamDetailPage.vue')
    },
    {
      path: '/organiser/contests/:contestId/markings',
      name: 'organiser-markings',
      meta: { requiresAuth: true, requiresOrganiser: true },
      component: () => import('@/features/organiser/pages/OrganiserMarkingsPage.vue')
    },
    {
      path: '/organiser/contests/:contestId/qr-print',
      name: 'organiser-qr-print',
      meta: { requiresAuth: true, requiresOrganiser: true },
      component: () => import('@/features/organiser/pages/OrganiserQrPrintPage.vue')
    }
  ],
  scrollBehavior: () => ({ top: 0 })
});

router.beforeEach(authGuard);
