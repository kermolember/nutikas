import { defineStore } from 'pinia';

export interface Toast {
  id: number;
  kind: 'success' | 'danger' | 'info' | 'warning';
  message: string;
}

export const useUiStore = defineStore('ui', {
  state: () => ({
    toasts: [] as Toast[],
    loadingHint: ''
  }),
  actions: {
    pushToast(toast: Omit<Toast, 'id'>) {
      const item = { ...toast, id: Date.now() + Math.random() };
      this.toasts.push(item);
      window.setTimeout(() => this.removeToast(item.id), 4500);
    },
    removeToast(id: number) {
      this.toasts = this.toasts.filter((toast) => toast.id !== id);
    }
  }
});
