import { z } from 'zod'

export const scheduleFormSchema = z.object({
  musicalName: z.string().min(1, '공연명을 입력하세요.'),
  openTime: z.string().min(1, '오픈 일시를 선택하세요.'),
  sites: z.array(z.string()).min(1, '사이트를 하나 이상 선택하세요.'),
  noWaitingService: z.array(z.string()),
})

export type ScheduleFormValue = z.infer<typeof scheduleFormSchema>
