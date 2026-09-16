import { NextRequest, NextResponse } from 'next/server'
import { createSchedule, insertScheduleAlerts, listSchedules } from '../../../lib/db'
import { kstLocalToUtcDate } from '../../../lib/kst'
import { generateScheduleAlerts } from '../../../lib/generateScheduleAlerts'
import { TICKETING_SITE } from '../../../constants/ticketingSite'

export async function GET() {
  const rows = await listSchedules()
  return NextResponse.json(rows)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (!body.musicalName || !body.openTime || !Array.isArray(body.sites)) {
    return NextResponse.json({ message: '입력값이 올바르지 않습니다.' }, { status: 400 })
  }

  const openTimeUtc = kstLocalToUtcDate(body.openTime)
  const sites = body.sites as TICKETING_SITE[]
  const noWaitingService = (body.noWaitingService ?? []) as TICKETING_SITE[]

  const row = await createSchedule({
    musicalName: body.musicalName,
    openTimeUtc,
    sites,
    noWaitingService,
  })

  const alerts = generateScheduleAlerts({ time: openTimeUtc, sites, noWaitingService })
  await insertScheduleAlerts(row.id, alerts)

  return NextResponse.json(row, { status: 201 })
}
