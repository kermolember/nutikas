<template>
  <nav class="navbar navbar-expand-lg bg-white">
    <div class="container-fluid" style="max-width: 1180px">
      <RouterLink class="navbar-brand d-flex align-items-center gap-2" to="/contests">
        <span class="brand-mark">N</span>
        <span>Nutikas</span>
      </RouterLink>
      <button
        class="navbar-toggler"
        type="button"
        aria-label="Toggle navigation"
        @click="open = !open"
      >
        <Menu :size="22" />
      </button>
      <div class="collapse navbar-collapse" :class="{ show: open }">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/contests" @click="open = false">Contests</RouterLink>
          </li>
          <li v-if="auth.isOrganiser" class="nav-item">
            <RouterLink class="nav-link" to="/organiser" @click="open = false"
              >Organiser</RouterLink
            >
          </li>
        </ul>
        <div class="d-flex align-items-lg-center gap-2 flex-column flex-lg-row">
          <span v-if="auth.isAuthenticated" class="text-secondary small">
            {{ auth.displayName }}
          </span>
          <RouterLink
            v-if="!auth.isAuthenticated"
            class="btn btn-outline-primary btn-sm"
            to="/login"
            @click="open = false"
          >
            <LogIn :size="16" />
            Login
          </RouterLink>
          <button v-else class="btn btn-outline-secondary btn-sm" @click="logout">
            <LogOut :size="16" />
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { LogIn, LogOut, Menu } from 'lucide-vue-next';
import { useAuthStore } from '@/app/stores/auth.store';

const open = ref(false);
const auth = useAuthStore();
const router = useRouter();

async function logout() {
  await auth.logoutCurrentUser();
  open.value = false;
  await router.push('/contests');
}
</script>
