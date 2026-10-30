import { ref } from 'vue';
import { getErrorMessage } from '@/shared/api/errors';

export function useAsyncState<T>(loader: () => Promise<T>) {
  const data = ref<T | null>(null);
  const loading = ref(false);
  const error = ref('');

  async function execute(): Promise<T | null> {
    loading.value = true;
    error.value = '';
    try {
      const result = await loader();
      data.value = result;
      return result;
    } catch (err) {
      error.value = getErrorMessage(err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  return { data, loading, error, execute };
}
