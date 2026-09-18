// Stats API — GET /stats

import { apiGet } from './client';
import type { StatsResponse } from '../types/contracts';

export async function getStats(): Promise<StatsResponse> {
  return apiGet<StatsResponse>('/stats');
}
