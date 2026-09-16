'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import ScheduleForm from '../ScheduleForm'
import { ScheduleFormValue } from '../scheduleFormSchema'
import { utcDateToKstLocal } from '../../../lib/kst'
import Card from '../../../components/Card'
import Button from '../../../components/Button'
import { ScheduleRow, useDeleteSchedule, useSchedule, useToggleActive, useUpdateSchedule } from '../../../lib/schedules'
import { ScheduleAlertRow, useScheduleAlerts } from '../../../lib/scheduleAlerts'
import MainTweetDialog from './MainTweetDialog'

function rowToFormValue(row: ScheduleRow): ScheduleFormValue {
  return {
    musicalName: row.musical_name,
    openTime: utcDateToKstLocal(new Date(row.open_time)),
    sites: row.sites,
    noWaitingService: row.no_waiting_service,
  }
}

function alertStatus(alert: ScheduleAlertRow): string {
  if (alert.sent_at) return `발송완료 (${utcDateToKstLocal(new Date(alert.sent_at)).replace('T', ' ')})`
  if (new Date() > new Date(alert.expires_at)) return '만료'
  return '대기중'
}

export default function ScheduleDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { data: schedule, isLoading: isScheduleLoading } = useSchedule(params.id)
  const { data: alerts, isLoading: isAlertsLoading } = useScheduleAlerts(params.id)
  const updateSchedule = useUpdateSchedule(params.id)
  const deleteSchedule = useDeleteSchedule()
  const toggleActive = useToggleActive(params.id)
  const [editing, setEditing] = useState(false)
  const [showMainTweet, setShowMainTweet] = useState(false)

  async function handleUpdate(value: ScheduleFormValue) {
    await updateSchedule.mutateAsync(value)
    setEditing(false)
  }

  async function handleDelete() {
    if (!confirm('이 스케줄을 삭제할까요?')) return
    await deleteSchedule.mutateAsync(params.id)
    router.push('/schedules')
  }

  async function handleToggleActive() {
    if (!schedule) return
    await toggleActive.mutateAsync(!schedule.is_active)
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <Link href="/schedules" className="mb-4 inline-block text-sm text-black">
        ← 목록으로
      </Link>

      <Card className="mb-4">
        {isScheduleLoading || !schedule ? (
          <p className="text-sm text-gray-500">불러오는 중...</p>
        ) : editing ? (
          <ScheduleForm
            initial={rowToFormValue(schedule)}
            submitLabel="수정 저장"
            onSubmit={handleUpdate}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <>
            <h1 className="mb-2 text-xl font-semibold">{schedule.musical_name}</h1>
            <dl className="mb-4 space-y-1 text-sm">
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 text-gray-500">오픈 일시</dt>
                <dd>{utcDateToKstLocal(new Date(schedule.open_time)).replace('T', ' ')}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 text-gray-500">사이트</dt>
                <dd>{schedule.sites.join(', ')}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 text-gray-500">상태</dt>
                <dd>{schedule.is_active ? '진행중' : '완료'}</dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => setShowMainTweet(true)}>
                메인 트윗
              </Button>
              <Button variant="secondary" onClick={() => setEditing(true)}>
                수정
              </Button>
              <Button variant="secondary" onClick={handleToggleActive}>
                {schedule.is_active ? '비활성화' : '활성화'}
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                삭제
              </Button>
            </div>
          </>
        )}
      </Card>

      {showMainTweet && schedule && (
        <MainTweetDialog schedule={schedule} onClose={() => setShowMainTweet(false)} />
      )}

      <Card>
        <h2 className="mb-3 text-base font-semibold">세부 알림 일정</h2>
        {isAlertsLoading ? (
          <p className="text-sm text-gray-500">불러오는 중...</p>
        ) : !alerts || alerts.length === 0 ? (
          <p className="text-sm text-gray-500">아직 생성된 알림이 없습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-120 border-collapse text-sm">
              <thead>
                <tr>
                  <th className="whitespace-nowrap border-b border-gray-200 px-1.5 py-2 text-left">알림종류</th>
                  <th className="whitespace-nowrap border-b border-gray-200 px-1.5 py-2 text-left">사이트</th>
                  <th className="whitespace-nowrap border-b border-gray-200 px-1.5 py-2 text-left">알림 시각</th>
                  <th className="whitespace-nowrap border-b border-gray-200 px-1.5 py-2 text-left">표시 시각</th>
                  <th className="whitespace-nowrap border-b border-gray-200 px-1.5 py-2 text-left">상태</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => (
                  <tr key={alert.id}>
                    <td className="whitespace-nowrap border-b border-gray-200 px-1.5 py-2">{alert.alert_type}</td>
                    <td className="whitespace-nowrap border-b border-gray-200 px-1.5 py-2">{alert.site}</td>
                    <td className="whitespace-nowrap border-b border-gray-200 px-1.5 py-2">
                      {utcDateToKstLocal(new Date(alert.fire_at)).replace('T', ' ')}
                    </td>
                    <td className="whitespace-nowrap border-b border-gray-200 px-1.5 py-2">
                      {utcDateToKstLocal(new Date(alert.display_time)).replace('T', ' ')}
                    </td>
                    <td className="whitespace-nowrap border-b border-gray-200 px-1.5 py-2">{alertStatus(alert)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
