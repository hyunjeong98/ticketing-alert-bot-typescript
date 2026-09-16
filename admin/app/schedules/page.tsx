'use client'

import { useState } from 'react'
import Link from 'next/link'
import ScheduleForm from './ScheduleForm'
import { ScheduleFormValue } from './scheduleFormSchema'
import { utcDateToKstLocal } from '../../lib/kst'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { useCreateSchedule, useSchedules } from '../../lib/schedules'

export default function SchedulesPage() {
  const { data: schedules, isLoading } = useSchedules()
  const createSchedule = useCreateSchedule()
  const [creating, setCreating] = useState(false)

  async function handleCreate(value: ScheduleFormValue) {
    await createSchedule.mutateAsync(value)
    setCreating(false)
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <h1 className="mb-4 text-xl font-semibold">티켓팅 알람 스케줄</h1>

      <Card className="mb-4">
        {creating ? (
          <ScheduleForm submitLabel="등록" onSubmit={handleCreate} onCancel={() => setCreating(false)} />
        ) : (
          <Button onClick={() => setCreating(true)}>+ 새 스케줄 등록</Button>
        )}
      </Card>

      <Card>
        {isLoading ? (
          <p className="text-sm text-gray-500">불러오는 중...</p>
        ) : !schedules || schedules.length === 0 ? (
          <p className="text-sm text-gray-500">등록된 스케줄이 없습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-120 border-collapse text-sm">
              <thead>
                <tr>
                  <th className="whitespace-nowrap border-b border-gray-200 px-1.5 py-2 text-left">공연명</th>
                  <th className="whitespace-nowrap border-b border-gray-200 px-1.5 py-2 text-left">오픈 일시(KST)</th>
                  <th className="whitespace-nowrap border-b border-gray-200 px-1.5 py-2 text-left">사이트</th>
                  <th className="whitespace-nowrap border-b border-gray-200 px-1.5 py-2 text-left">상태</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((row) => (
                  <tr key={row.id} className="cursor-pointer hover:bg-gray-50">
                    <td className="p-0">
                      <Link href={`/schedules/${row.id}`} className="block whitespace-nowrap border-b border-gray-200 px-1.5 py-2">
                        {row.musical_name}
                      </Link>
                    </td>
                    <td className="p-0">
                      <Link href={`/schedules/${row.id}`} className="block whitespace-nowrap border-b border-gray-200 px-1.5 py-2">
                        {utcDateToKstLocal(new Date(row.open_time)).replace('T', ' ')}
                      </Link>
                    </td>
                    <td className="p-0">
                      <Link href={`/schedules/${row.id}`} className="block whitespace-nowrap border-b border-gray-200 px-1.5 py-2">
                        {row.sites.join(', ')}
                      </Link>
                    </td>
                    <td className="p-0">
                      <Link href={`/schedules/${row.id}`} className="block whitespace-nowrap border-b border-gray-200 px-1.5 py-2">
                        {row.is_active ? '진행중' : '완료'}
                      </Link>
                    </td>
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
