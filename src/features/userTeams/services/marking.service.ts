import type { MarkingRequest, MarkingResponse } from '@/app/types/domain';
import { apiRequest } from '@/shared/api/http';

export function submitMarking(payload: MarkingRequest) {
  return apiRequest<MarkingResponse>('/api/v1/Markings', {
    method: 'POST',
    body: payload
  });
}
