import { computed, ref } from 'vue';

export function usePagination(initialPageSize = 25) {
  const page = ref(1);
  const pageSize = ref(initialPageSize);
  const totalPages = ref(1);

  const canPrev = computed(() => page.value > 1);
  const canNext = computed(() => page.value < totalPages.value);

  function setTotal(value: number) {
    totalPages.value = Math.max(1, value);
  }

  function next() {
    if (canNext.value) page.value += 1;
  }

  function prev() {
    if (canPrev.value) page.value -= 1;
  }

  return { page, pageSize, totalPages, canPrev, canNext, setTotal, next, prev };
}
