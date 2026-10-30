import { useUiStore } from '@/app/stores/ui.store';

export function useToast() {
  const ui = useUiStore();
  return {
    success: (message: string) => ui.pushToast({ kind: 'success', message }),
    error: (message: string) => ui.pushToast({ kind: 'danger', message }),
    info: (message: string) => ui.pushToast({ kind: 'info', message })
  };
}
