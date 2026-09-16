import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchJson } from './http'
import { scheduleAlertKeys } from './scheduleAlerts'
import { ScheduleFormValue } from '../app/schedules/scheduleFormSchema'

export type ScheduleRow = {
  id: number
  musical_name: string
  open_time: string
  sites: string[]
  no_waiting_service: string[]
  is_active: boolean
}

export const scheduleKeys = {
  all: ['schedules'] as const,
  detail: (id: string) => ['schedules', id] as const,
}

export function useSchedules() {
  return useQuery({
    queryKey: scheduleKeys.all,
    queryFn: () => fetchJson<ScheduleRow[]>('/api/schedules'),
  })
}

export function useSchedule(id: string) {
  return useQuery({
    queryKey: scheduleKeys.detail(id),
    queryFn: () => fetchJson<ScheduleRow>(`/api/schedules/${id}`),
  })
}

export function useCreateSchedule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (value: ScheduleFormValue) =>
      fetchJson('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: scheduleKeys.all }),
  })
}

export function useUpdateSchedule(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (value: ScheduleFormValue) =>
      fetchJson(`/api/schedules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all })
      queryClient.invalidateQueries({ queryKey: scheduleKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: scheduleAlertKeys.list(id) })
    },
  })
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fetchJson(`/api/schedules/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: scheduleKeys.all }),
  })
}

export function useToggleActive(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (isActive: boolean) =>
      fetchJson(`/api/schedules/${id}/active`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all })
      queryClient.invalidateQueries({ queryKey: scheduleKeys.detail(id) })
    },
  })
}
