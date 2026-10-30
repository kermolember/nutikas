export interface ParsedQrPayload {
  checkPointId: string;
  lat: string | null;
  lon: string | null;
}

function normalizeCoordinate(value: unknown): string | null {
  if (value == null || value === '') return null;
  const normalized = String(value).trim();
  return normalized ? normalized : null;
}

function parseCheckpointCandidate(candidate: unknown): string {
  if (!candidate) return '';
  return String(candidate).trim();
}

function hasCoordinates(payload: Pick<ParsedQrPayload, 'lat' | 'lon'>): boolean {
  return Boolean(payload.lat && payload.lon);
}

export function buildQrPayload(checkpoint: {
  cpid: string;
  lat?: string | number | null;
  lon?: string | number | null;
}): string {
  const lat = normalizeCoordinate(checkpoint.lat);
  const lon = normalizeCoordinate(checkpoint.lon);

  if (!lat || !lon) return checkpoint.cpid;

  return JSON.stringify({ cpid: checkpoint.cpid, lat, lon });
}

export function parseQrPayload(payload: string): ParsedQrPayload {
  const trimmed = payload.trim();
  const empty: ParsedQrPayload = { checkPointId: '', lat: null, lon: null };
  if (!trimmed) return empty;

  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>;
    const candidate =
      parsed.cpid ?? parsed.cpId ?? parsed.checkPointId ?? parsed.checkpointId ?? parsed.id;
    const checkPointId = parseCheckpointCandidate(candidate);
    if (checkPointId) {
      return {
        checkPointId,
        lat: normalizeCoordinate(parsed.lat ?? parsed.latitude),
        lon: normalizeCoordinate(parsed.lon ?? parsed.lng ?? parsed.longitude)
      };
    }
  } catch {
    // Plain CPID and URL payloads are more common than JSON payloads.
  }

  try {
    const url = new URL(trimmed);
    const candidate =
      url.searchParams.get('cpid') ??
      url.searchParams.get('cpId') ??
      url.searchParams.get('checkPointId') ??
      url.hash.replace(/^#/, '');
    if (candidate) {
      const parsed = {
        checkPointId: candidate.trim(),
        lat: normalizeCoordinate(url.searchParams.get('lat') ?? url.searchParams.get('latitude')),
        lon: normalizeCoordinate(
          url.searchParams.get('lon') ??
            url.searchParams.get('lng') ??
            url.searchParams.get('longitude')
        )
      };
      return hasCoordinates(parsed) ? parsed : { ...parsed, lat: null, lon: null };
    }
  } catch {
    // Not a URL.
  }

  return { checkPointId: trimmed, lat: null, lon: null };
}
