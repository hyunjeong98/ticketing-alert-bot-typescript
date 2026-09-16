'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { TICKETING_SITE_LIST } from '../../constants/ticketingSite'
import Field from '../../components/Field'
import TextInput from '../../components/TextInput'
import Button from '../../components/Button'
import { scheduleFormSchema, ScheduleFormValue } from './scheduleFormSchema'

const EMPTY: ScheduleFormValue = {
  musicalName: '',
  openTime: '',
  sites: [],
  noWaitingService: [],
}

export default function ScheduleForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: ScheduleFormValue
  submitLabel: string
  onSubmit: (value: ScheduleFormValue) => Promise<void>
  onCancel?: () => void
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ScheduleFormValue>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: initial ?? EMPTY,
  })

  const sites = watch('sites')
  const noWaitingService = watch('noWaitingService')

  // 사이트 선택 해제 시, 예매대기 제외 목록에 남아있던 값도 같이 지운다.
  useEffect(() => {
    const pruned = noWaitingService.filter((site) => sites.includes(site))
    if (pruned.length !== noWaitingService.length) {
      setValue('noWaitingService', pruned)
    }
  }, [sites, noWaitingService, setValue])

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Field label="공연명">
        <TextInput type="text" {...register('musicalName')} />
        {errors.musicalName && <p className="mt-1 text-sm text-red-500">{errors.musicalName.message}</p>}
      </Field>

      <Field label="오픈 일시 (한국 시간)">
        <TextInput type="datetime-local" {...register('openTime')} />
        {errors.openTime && <p className="mt-1 text-sm text-red-500">{errors.openTime.message}</p>}
      </Field>

      <Field label="대상 사이트">
        <div className="grid grid-cols-2 gap-1.5">
          {TICKETING_SITE_LIST.map((site) => (
            <label key={site} className="flex items-center gap-1.5 text-sm">
              <input type="checkbox" value={site} {...register('sites')} />
              {site}
            </label>
          ))}
        </div>
        {errors.sites && <p className="mt-1 text-sm text-red-500">{errors.sites.message}</p>}
      </Field>

      <Field label="예매대기 알림 제외 사이트">
        <div className="grid grid-cols-2 gap-1.5">
          {sites.map((site) => (
            <label key={site} className="flex items-center gap-1.5 text-sm">
              <input type="checkbox" value={site} {...register('noWaitingService')} />
              {site}
            </label>
          ))}
        </div>
      </Field>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '저장 중...' : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            취소
          </Button>
        )}
      </div>
    </form>
  )
}
