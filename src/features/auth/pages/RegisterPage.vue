<template>
  <section class="mx-auto" style="max-width: 520px">
    <div class="page-header">
      <div>
        <h1 class="page-title">Create Account</h1>
        <p class="page-kicker">Register once, then attach teams to your account.</p>
      </div>
    </div>
    <form class="panel" @submit.prevent="submit">
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div class="form-grid">
        <FormField label="First name">
          <input v-model="form.firstname" class="form-control" autocomplete="given-name" required />
        </FormField>
        <FormField label="Last name">
          <input v-model="form.lastname" class="form-control" autocomplete="family-name" required />
        </FormField>
      </div>
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
          autocomplete="new-password"
          required
        />
      </FormField>
      <button class="btn btn-primary w-100" type="submit" :disabled="loading">
        <UserPlus :size="16" />
        {{ loading ? 'Creating...' : 'Create account' }}
      </button>
    </form>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { UserPlus } from 'lucide-vue-next';
import { useAuthStore } from '@/app/stores/auth.store';
import { getErrorMessage } from '@/shared/api/errors';
import FormField from '@/shared/components/FormField.vue';

const auth = useAuthStore();
const router = useRouter();
const loading = ref(false);
const error = ref('');
const form = reactive({ email: '', password: '', firstname: '', lastname: '' });

async function submit() {
  loading.value = true;
  error.value = '';
  try {
    await auth.registerAccount(form);
    await router.push('/contests');
  } catch (err) {
    error.value = getErrorMessage(err);
  } finally {
    loading.value = false;
  }
}
</script>
