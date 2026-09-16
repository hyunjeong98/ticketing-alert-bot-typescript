import { NextRequest, NextResponse } from 'next/server'
import { setScheduleActive } from '../../../../../lib/db'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json()

  if (typeof body.isActive !== 'boolean') {
    return NextResponse.json({ message: '입력값이 올바르지 않습니다.' }, { status: 400 })
  }

  const row = await setScheduleActive(Number(params.id), body.isActive)
  return NextResponse.json(row)
}
