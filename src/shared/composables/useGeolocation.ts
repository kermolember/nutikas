import { ref } from 'vue';

export function useGeolocation() {
  const lat = ref<string | null>(null);
  const lon = ref<string | null>(null);
  const error = ref('');
  const loading = ref(false);

  async function capture(): Promise<{ lat: string | null; lon: string | null }> {
    if (!navigator.geolocation) {
      error.value = 'Geolocation is not available in this browser.';
      return { lat: null, lon: null };
    }

    loading.value = true;
    error.value = '';

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          lat.value = String(position.coords.latitude);
          lon.value = String(position.coords.longitude);
          loading.value = false;
          resolve({ lat: lat.value, lon: lon.value });
        },
        (geoError) => {
          error.value = geoError.message;
          loading.value = false;
          resolve({ lat: null, lon: null });
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
      );
    });
  }

  return { lat, lon, error, loading, capture };
}
