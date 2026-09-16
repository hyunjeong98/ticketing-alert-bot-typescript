import { groupDueAlerts, DueAlertRow } from '../util/groupDueAlerts'

describe('groupDueAlerts', () => {
  test('같은 공연명+알림종류+표시시각인 행은 사이트를 합쳐 하나로 묶인다', () => {
    const rows: DueAlertRow[] = [
      { id: 1, musical_name: '드라큘라', alert_type: '입금마감', site: 'NOL', display_time: '2026-05-15T13:59:00.000Z' },
      { id: 2, musical_name: '드라큘라', alert_type: '입금마감', site: '예스24', display_time: '2026-05-15T13:59:00.000Z' },
    ]

    const buckets = groupDueAlerts(rows)

    expect(buckets).toHaveLength(1)
    expect(buckets[0].sites).toEqual(['NOL', '예스24'])
    expect(buckets[0].ids).toEqual([1, 2])
  })

  test('같은 사이트가 여러 스케줄에서 중복으로 들어와도 사이트 목록은 한 번만 표시된다', () => {
    const rows: DueAlertRow[] = [
      { id: 1, musical_name: '드라큘라', alert_type: '취켓팅', site: 'NOL(연동)', display_time: '2026-08-15T02:00:00.000Z' },
      { id: 2, musical_name: '드라큘라', alert_type: '취켓팅', site: 'NOL(연동)', display_time: '2026-08-15T02:00:00.000Z' },
    ]

    const buckets = groupDueAlerts(rows)

    expect(buckets).toHaveLength(1)
    expect(buckets[0].sites).toEqual(['NOL(연동)'])
    expect(buckets[0].ids).toEqual([1, 2])
  })

  test('알림종류나 표시시각이 다르면 별도로 묶인다', () => {
    const rows: DueAlertRow[] = [
      { id: 1, musical_name: '드라큘라', alert_type: '취켓팅', site: 'NOL', display_time: '2026-05-16T09:00:00.000Z' },
      { id: 2, musical_name: '드라큘라', alert_type: '예매대기', site: 'NOL', display_time: '2026-05-16T09:00:00.000Z' },
      { id: 3, musical_name: '엘리자벳', alert_type: '취켓팅', site: 'NOL', display_time: '2026-05-16T09:00:00.000Z' },
    ]

    const buckets = groupDueAlerts(rows)

    expect(buckets).toHaveLength(3)
  })
})
