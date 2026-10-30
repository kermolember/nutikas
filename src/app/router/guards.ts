import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '@/app/stores/auth.store';

export async function authGuard(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const auth = useAuthStore();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const requiresOrganiser = to.matched.some((record) => record.meta.requiresOrganiser);

  if (!requiresAuth && !requiresOrganiser) {
    next();
    return;
  }

  const ok = await auth.ensureFreshToken();
  if (!ok) {
    next({ name: 'login', query: { redirect: to.fullPath } });
    return;
  }

  if (requiresOrganiser && !auth.isOrganiser) {
    next({ name: 'contests' });
    return;
  }

  next();
}
