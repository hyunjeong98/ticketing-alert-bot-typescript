import { useQuery } from '@tanstack/react-query'
import { fetchJson } from './http'

export type ScheduleAlertRow = {
  id: number
  alert_type: string
  site: string
  fire_at: string
  display_time: string
  expires_at: string
  sent_at: string | null
}

export const scheduleAlertKeys = {
  list: (scheduleId: string) => ['schedules', scheduleId, 'alerts'] as const,
}

export function useScheduleAlerts(scheduleId: string) {
  return useQuery({
    queryKey: scheduleAlertKeys.list(scheduleId),
    queryFn: () => fetchJson<ScheduleAlertRow[]>(`/api/schedules/${scheduleId}/alerts`),
  })
}
