import { ref } from 'vue';
import { Html5Qrcode } from 'html5-qrcode';

export function useQrScanner(elementId: string, onScan: (payload: string) => void) {
  const running = ref(false);
  const error = ref('');
  let scanner: Html5Qrcode | null = null;

  async function start() {
    error.value = '';
    scanner ??= new Html5Qrcode(elementId);
    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => onScan(decodedText),
        undefined
      );
      running.value = true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Could not start the camera.';
    }
  }

  async function stop() {
    if (scanner && running.value) {
      await scanner.stop();
      running.value = false;
    }
  }

  return { running, error, start, stop };
}
