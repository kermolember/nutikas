<template>
  <div ref="mapEl" class="map-box" />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import L from 'leaflet';
import { checkpointTypeLabels } from '@/app/config/constants';
import { toNumberCoordinate } from '@/shared/utils/coordinates';

export interface MapPoint {
  lat: string | number | null;
  lon: string | number | null;
  label: string;
  type?: number;
  score?: number;
}

const props = defineProps<{
  checkpoints?: MapPoint[];
  route?: MapPoint[];
  selectedPoint?: MapPoint | null;
}>();
const emit = defineEmits<{ mapClick: [coords: { lat: number; lon: number }] }>();
const mapEl = ref<HTMLElement | null>(null);
let map: L.Map | null = null;
let layer: L.LayerGroup | null = null;

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return entities[char];
  });
}

function makeMarkerIcon(point: MapPoint, selected = false) {
  const label = escapeHtml(point.label.slice(0, 4));
  return L.divIcon({
    className: selected ? 'map-marker map-marker-selected' : 'map-marker',
    html: `<span>${label}</span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18]
  });
}

function addPointMarker(point: MapPoint, bounds: [number, number][], selected = false) {
  const lat = toNumberCoordinate(point.lat);
  const lon = toNumberCoordinate(point.lon);
  if (lat == null || lon == null) return;
  const pointType = point.type ? checkpointTypeLabels[point.type] : '';
  const marker = L.marker([lat, lon], { icon: makeMarkerIcon(point, selected) }).bindPopup(
    `<strong>${escapeHtml(point.label)}</strong><br>${escapeHtml(pointType)}${
      point.score ? `<br>${point.score} points` : ''
    }`
  );
  marker.addTo(layer!);
  bounds.push([lat, lon]);
}

function draw() {
  if (!map) return;
  layer?.remove();
  layer = L.layerGroup().addTo(map);

  const bounds: [number, number][] = [];
  const checkpoints = props.checkpoints ?? [];

  checkpoints.forEach((point) => {
    addPointMarker(point, bounds);
  });

  if (props.selectedPoint) addPointMarker(props.selectedPoint, bounds, true);

  const routePoints = (props.route ?? [])
    .map((point) => [toNumberCoordinate(point.lat), toNumberCoordinate(point.lon)] as const)
    .filter((point): point is [number, number] => point[0] != null && point[1] != null);

  if (routePoints.length > 1) {
    L.polyline(routePoints, { color: '#0f766e', weight: 4 }).addTo(layer);
    bounds.push(...routePoints);
  }

  if (bounds.length) {
    map.fitBounds(bounds, { padding: [26, 26] });
  } else {
    map.setView([58.75, 25.0], 7);
  }
}

function handleMapClick(event: L.LeafletMouseEvent) {
  emit('mapClick', { lat: event.latlng.lat, lon: event.latlng.lng });
}

onMounted(() => {
  if (!mapEl.value) return;
  map = L.map(mapEl.value).setView([58.75, 25.0], 7);
  map.on('click', handleMapClick);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
  draw();
});

watch(() => [props.checkpoints, props.route, props.selectedPoint], draw, { deep: true });

onUnmounted(() => {
  map?.off('click', handleMapClick);
  map?.remove();
});
</script>
