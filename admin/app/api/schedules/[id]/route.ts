import { NextRequest, NextResponse } from 'next/server'
import { deleteSchedule, getSchedule, insertScheduleAlerts, updateSchedule } from '../../../../lib/db'
import { kstLocalToUtcDate } from '../../../../lib/kst'
import { generateScheduleAlerts } from '../../../../lib/generateScheduleAlerts'
import { TICKETING_SITE } from '../../../../constants/ticketingSite'

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const schedule = await getSchedule(Number(params.id))
  if (!schedule) {
    return NextResponse.json({ message: 'not found' }, { status: 404 })
  }
  return NextResponse.json(schedule)
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json()

  if (!body.musicalName || !body.openTime || !Array.isArray(body.sites)) {
    return NextResponse.json({ message: '입력값이 올바르지 않습니다.' }, { status: 400 })
  }

  const openTimeUtc = kstLocalToUtcDate(body.openTime)
  const sites = body.sites as TICKETING_SITE[]
  const noWaitingService = (body.noWaitingService ?? []) as TICKETING_SITE[]
  const id = Number(params.id)

  // updateSchedule이 기존 schedule_alerts를 먼저 지워두므로, 새 시각 기준으로 다시 계산해서 채운다.
  const row = await updateSchedule(id, {
    musicalName: body.musicalName,
    openTimeUtc,
    sites,
    noWaitingService,
  })

  const alerts = generateScheduleAlerts({ time: openTimeUtc, sites, noWaitingService })
  await insertScheduleAlerts(id, alerts)

  return NextResponse.json(row)
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  await deleteSchedule(Number(params.id))
  return NextResponse.json({ message: 'ok' })
}
