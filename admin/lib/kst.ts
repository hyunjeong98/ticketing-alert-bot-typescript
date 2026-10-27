// KST는 DST 없는 고정 UTC+9. datetime-local input(예: "2026-09-08T14:00")은
// KST 벽시계 시간으로 취급해 UTC로 변환하고, 반대로 표시할 때도 같은 방식으로 되돌린다.

export function kstLocalToUtcDate(kstLocal: string): Date {
  const [datePart, timePart] = kstLocal.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute] = timePart.split(':').map(Number)
  return new Date(Date.UTC(year, month - 1, day, hour - 9, minute))
}

// 서버 로컬 타임존이 UTC일 때 setHours(h)는 KST 기준 시각이 아니라 UTC 기준 시각을
// 설정해버려 최대 하루까지 틀어진다. KST 벽시계 기준으로 시(hour)만 고정한다.
export function setKstHours(utcDate: Date, hours: number): Date {
  const kst = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000)
  kst.setUTCHours(hours)
  return new Date(kst.getTime() - 9 * 60 * 60 * 1000)
}

export function utcDateToKstLocal(utcDate: Date): string {
  const kstMs = utcDate.getTime() + 9 * 60 * 60 * 1000
  const kst = new Date(kstMs)
  const pad = (n: number) => String(n).padStart(2, '0')
  const year = kst.getUTCFullYear()
  const month = pad(kst.getUTCMonth() + 1)
  const day = pad(kst.getUTCDate())
  const hour = pad(kst.getUTCHours())
  const minute = pad(kst.getUTCMinutes())
  return `${year}-${month}-${day}T${hour}:${minute}`
}
