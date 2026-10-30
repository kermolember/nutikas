export function toNumberCoordinate(value: string | number | null | undefined): number | null {
  if (value == null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function hasCoordinate(item: {
  lat?: string | number | null;
  lon?: string | number | null;
}): boolean {
  return toNumberCoordinate(item.lat) != null && toNumberCoordinate(item.lon) != null;
}
