<template>
  <section class="mx-auto" style="max-width: 440px">
    <div class="page-header">
      <div>
        <h1 class="page-title">Login</h1>
        <p class="page-kicker">Continue to team scanning and organiser tools.</p>
      </div>
    </div>
    <form class="panel" @submit.prevent="submit">
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <FormField label="Email">
        <input
          v-model="form.email"
          type="email"
          class="form-control"
          autocomplete="email"
          required
        />
      </FormField>
      <FormField label="Password">
        <input
          v-model="form.password"
          type="password"
          class="form-control"
          autocomplete="current-password"
          required
        />
      </FormField>
      <button class="btn btn-primary w-100" type="submit" :disabled="loading">
        <LogIn :size="16" />
        {{ loading ? 'Signing in...' : 'Login' }}
      </button>
      <p class="text-center mt-3 mb-0">
        <RouterLink to="/register">Create an account</RouterLink>
      </p>
    </form>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { LogIn } from 'lucide-vue-next';
import { useAuthStore } from '@/app/stores/auth.store';
import { getErrorMessage } from '@/shared/api/errors';
import FormField from '@/shared/components/FormField.vue';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const loading = ref(false);
const error = ref('');
const form = reactive({ email: '', password: '' });

async function submit() {
  loading.value = true;
  error.value = '';
  try {
    await auth.loginWithPassword(form);
    await router.push(String(route.query.redirect || '/contests'));
  } catch (err) {
    error.value = getErrorMessage(err);
  } finally {
    loading.value = false;
  }
}
</script>
