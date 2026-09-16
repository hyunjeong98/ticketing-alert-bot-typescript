import { neon } from '@neondatabase/serverless'
import { DueAlertRow } from './groupDueAlerts'

function getSql() {
  return neon(process.env.DATABASE_URL!)
}

// 등록 시점에 계산해둔 expires_at을 넘긴 알림은 이미 보내는 의미가 없으므로 제외한다.
export async function fetchAlertsToSend(): Promise<DueAlertRow[]> {
  const sql = getSql()
  return sql`
    select sa.id, s.musical_name, sa.alert_type, sa.site, sa.display_time
    from schedule_alerts sa
    join schedules s on s.id = sa.schedule_id
    where sa.sent_at is null
      and sa.fire_at <= now()
      and now() <= sa.expires_at
      and s.is_active = true
    order by sa.fire_at
  ` as unknown as Promise<DueAlertRow[]>
}

export async function markAlertsSent(ids: number[]): Promise<void> {
  if (ids.length === 0) return
  const sql = getSql()
  await sql`update schedule_alerts set sent_at = now() where id = any(${ids})`
}

// 아직 보내지 않았고, 유효기간(expires_at)도 안 지난 알림이 하나도 없으면 완료로 본다.
// (만료돼서 안 보낸 알림은 시간이 지나면서 자연히 이 조건에서 빠진다)
export async function deactivateFinishedSchedules(): Promise<void> {
  const sql = getSql()
  await sql`
    update schedules
    set is_active = false, updated_at = now()
    where is_active = true
      and alerts_generated = true
      and id not in (
        select distinct schedule_id from schedule_alerts where sent_at is null and now() <= expires_at
      )
  `
}
