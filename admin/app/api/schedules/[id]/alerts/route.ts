import { NextRequest, NextResponse } from 'next/server'
import { listScheduleAlerts } from '../../../../../lib/db'

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const alerts = await listScheduleAlerts(Number(params.id))
  return NextResponse.json(alerts)
}
