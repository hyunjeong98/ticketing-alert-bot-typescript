export type DueAlertRow = {
  id: number
  musical_name: string
  alert_type: string
  site: string
  display_time: string
}

export type AlertBucket = {
  musicalName: string
  alertType: string
  displayTime: Date
  sites: string[]
  ids: number[]
}

// 같은 공연명 + 같은 알림종류 + 같은 표시시각인 행들을 하나의 트윗으로 묶는다.
// (여러 스케줄에서 우연히 같은 알림시각이 나오는 경우 중복 발송 대신 한 번만 보내기 위함)
export function groupDueAlerts(rows: DueAlertRow[]): AlertBucket[] {
  const buckets = new Map<string, AlertBucket>()

  for (const row of rows) {
    const key = `${row.musical_name}|${row.alert_type}|${row.display_time}`
    let bucket = buckets.get(key)
    if (!bucket) {
      bucket = {
        musicalName: row.musical_name,
        alertType: row.alert_type,
        displayTime: new Date(row.display_time),
        sites: [],
        ids: [],
      }
      buckets.set(key, bucket)
    }
    if (!bucket.sites.includes(row.site)) bucket.sites.push(row.site)
    bucket.ids.push(row.id)
  }

  return [...buckets.values()]
}
