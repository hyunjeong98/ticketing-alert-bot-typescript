import { neon } from '@neondatabase/serverless'
import { AlertRow } from './generateScheduleAlerts'

export type ScheduleRow = {
  id: number
  musical_name: string
  open_time: string
  sites: string[]
  no_waiting_service: string[]
  is_active: boolean
}

export type ScheduleInput = {
  musicalName: string
  openTimeUtc: Date
  sites: string[]
  noWaitingService: string[]
}

export type ScheduleAlertRow = {
  id: number
  alert_type: string
  site: string
  fire_at: string
  display_time: string
  expires_at: string
  sent_at: string | null
}

function getSql() {
  return neon(process.env.DATABASE_URL!)
}

export async function listSchedules(): Promise<ScheduleRow[]> {
  const sql = getSql()
  return sql`
    select id, musical_name, open_time, sites, no_waiting_service, is_active
    from schedules
    order by open_time
  ` as unknown as Promise<ScheduleRow[]>
}

export async function getSchedule(id: number): Promise<ScheduleRow | undefined> {
  const sql = getSql()
  const rows = await sql`
    select id, musical_name, open_time, sites, no_waiting_service, is_active
    from schedules
    where id = ${id}
  ` as unknown as ScheduleRow[]
  return rows[0]
}

export async function listScheduleAlerts(scheduleId: number): Promise<ScheduleAlertRow[]> {
  const sql = getSql()
  return sql`
    select id, alert_type, site, fire_at, display_time, expires_at, sent_at
    from schedule_alerts
    where schedule_id = ${scheduleId}
    order by fire_at
  ` as unknown as Promise<ScheduleAlertRow[]>
}

export async function setScheduleActive(id: number, isActive: boolean): Promise<ScheduleRow> {
  const sql = getSql()
  const rows = await sql`
    update schedules
    set is_active = ${isActive}, updated_at = now()
    where id = ${id}
    returning id, musical_name, open_time, sites, no_waiting_service, is_active
  ` as unknown as ScheduleRow[]
  return rows[0]
}

export async function createSchedule(input: ScheduleInput): Promise<ScheduleRow> {
  const sql = getSql()
  const rows = await sql`
    insert into schedules (musical_name, open_time, sites, no_waiting_service)
    values (${input.musicalName}, ${input.openTimeUtc.toISOString()}, ${input.sites}, ${input.noWaitingService})
    returning id, musical_name, open_time, sites, no_waiting_service, is_active
  ` as unknown as ScheduleRow[]
  return rows[0]
}

// 스케줄 내용이 바뀌면 이미 계산해둔 알림들은 더이상 맞지 않으므로 지우고 다시 생성하게 한다.
export async function updateSchedule(id: number, input: ScheduleInput): Promise<ScheduleRow> {
  const sql = getSql()
  await sql`delete from schedule_alerts where schedule_id = ${id}`
  const rows = await sql`
    update schedules
    set musical_name = ${input.musicalName},
        open_time = ${input.openTimeUtc.toISOString()},
        sites = ${input.sites},
        no_waiting_service = ${input.noWaitingService},
        is_active = true,
        alerts_generated = false,
        updated_at = now()
    where id = ${id}
    returning id, musical_name, open_time, sites, no_waiting_service, is_active
  ` as unknown as ScheduleRow[]
  return rows[0]
}

export async function deleteSchedule(id: number): Promise<void> {
  const sql = getSql()
  await sql`delete from schedules where id = ${id}`
}

export async function insertScheduleAlerts(scheduleId: number, alerts: AlertRow[]): Promise<void> {
  const sql = getSql()
  for (const alert of alerts) {
    await sql`
      insert into schedule_alerts (schedule_id, alert_type, site, fire_at, display_time, expires_at)
      values (${scheduleId}, ${alert.alertType}, ${alert.site}, ${alert.fireAt.toISOString()}, ${alert.displayTime.toISOString()}, ${alert.expiresAt.toISOString()})
    `
  }
  await sql`update schedules set alerts_generated = true, updated_at = now() where id = ${scheduleId}`
}
