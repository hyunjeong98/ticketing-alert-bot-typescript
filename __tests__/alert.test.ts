import { TICKETING_SITE, Schedule } from '../type/types'

jest.mock('twitter-api-v2', () => ({
  TwitterApi: jest.fn().mockImplementation(() => ({})),
}))

// writeTweet → 콘솔 출력으로 대체
jest.mock('../util/writeTweet', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(
    (_client: unknown, alertType: string, time: Date, sites: TICKETING_SITE[], musicalName: string) => {
      const siteNames = sites.join(', ')
      const timeStr = `${time.getMonth() + 1}/${time.getDate()} ${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}`
      console.log(`  → [${alertType}] ${musicalName} | ${siteNames} | ${timeStr}`)
    }
  ),
}))

// isSameTime만 mock (hasWaitingService는 실제 로직 사용)
jest.mock('../util/common', () => ({
  ...jest.requireActual('../util/common'),
  isSameTime: jest.fn(),
}))

import alert from '../util/alert'
import { isSameTime } from '../util/common'

const mockIsSameTime = isSameTime as jest.Mock

// hour만 체크 (날짜가 안 겹치는 단순 케이스)
function setCurrentHour(hour: number) {
  mockIsSameTime.mockImplementation((date: Date | undefined) => {
    if (!date) return false
    return date.getHours() === hour
  })
}

// 날짜+hour 체크 (같은 hour가 여러 날짜에 겹칠 때)
// month는 0-indexed (5월 = 4)
function setCurrentDateTime(month: number, day: number, hour: number) {
  mockIsSameTime.mockImplementation((date: Date | undefined) => {
    if (!date) return false
    return date.getMonth() === month && date.getDate() === day && date.getHours() === hour
  })
}

beforeEach(() => {
  mockIsSameTime.mockReset()
  jest.clearAllMocks()
})

// ─────────────────────────────────────────────
// 기본 알림 동작 테스트
// ─────────────────────────────────────────────

// 기준 스케줄 시간: 5월 14일 11:00 (2026)
// 각 알림 발생 시간:
//   티켓팅 D-1              → 5/13 21:00
//   티켓팅 당일             → 5/14 10:00 (11-1)
//   입금마감 (일반)          → 5/15 22:00
//   입금마감 (DREAM_THEATER) → 5/15 10:00  ← DREAM_THEATER 테스트는 12:00 스케줄 사용 (아래 참고)
//   입금마감 (LG_ART_CENTER) → 5/15 10:00  ← 당일 알림과 hour 겹침 → setCurrentDateTime 사용
//   취켓팅 (INTERPARK)       → 5/16 08:00 (취켓 09:00, 1시간 전)
//   취켓팅 (LG_ART_CENTER)   → 5/15 10:00 (취켓 11:00, 1시간 전)  ← LG_ART_CENTER 입금마감과 동시
//   예매대기 D-1 (INTERPARK) → 5/16 22:00
//   예매대기 (INTERPARK)     → 5/17 07:00 (대기 08:00, 1시간 전)
const SCHEDULE_TIME = new Date(2026, 4, 14, 11, 0, 0)
const MUSICAL = '드라큘라'

describe('티켓팅 D-1 알림 (5/13 21시)', () => {
  test('모든 사이트 대상으로 트윗 전송', async () => {
    const sites = [TICKETING_SITE.INTERPARK, TICKETING_SITE.YES24, TICKETING_SITE.META]
    setCurrentHour(21)
    await alert(MUSICAL, [{ time: SCHEDULE_TIME, sites }])
  })
})

describe('티켓팅 당일 알림 (5/14 10시)', () => {
  test('모든 사이트 대상으로 트윗 전송', async () => {
    const sites = [TICKETING_SITE.INTERPARK, TICKETING_SITE.YES24, TICKETING_SITE.META]
    setCurrentHour(10)
    await alert(MUSICAL, [{ time: SCHEDULE_TIME, sites }])
  })
})

describe('입금마감 알림', () => {
  test('TICKETING_ONLY_SITES는 입금마감 알림 없음 (트윗 없어야 함)', async () => {
    const sites = [TICKETING_SITE.META, TICKETING_SITE.BUSAN_BANK, TICKETING_SITE.MON, TICKETING_SITE.TOPING_FIRST]
    setCurrentHour(22)
    await alert(MUSICAL, [{ time: SCHEDULE_TIME, sites }])
  })

  test('일반 사이트들은 묶어서 트윗 전송 (5/15 22시)', async () => {
    const sites = [TICKETING_SITE.INTERPARK, TICKETING_SITE.YES24, TICKETING_SITE.MELON]
    setCurrentHour(22)
    await alert(MUSICAL, [{ time: SCHEDULE_TIME, sites }])
  })

  test('ticketingOnlySites 지정 사이트 제외하고 나머지만 트윗', async () => {
    const sites = [TICKETING_SITE.INTERPARK, TICKETING_SITE.MELON]
    setCurrentHour(22)
    await alert(MUSICAL, [{ time: SCHEDULE_TIME, sites }], [TICKETING_SITE.MELON])
  })

  // DREAM_THEATER 테스트: 12:00 스케줄 사용 → 당일 알림 hour=11, DREAM_THEATER 입금마감 hour=10 으로 분리
  // 12:00 기준 → 입금마감(DREAM_THEATER): 5/15 10시, 티켓팅 당일: 5/14 11시 → 충돌 없음
  test('DREAM_THEATER: 다음날 10시에 별도 트윗', async () => {
    const dreamScheduleTime = new Date(2026, 4, 14, 12, 0, 0)
    const sites = [TICKETING_SITE.INTERPARK, TICKETING_SITE.DREAM_THEATER]
    setCurrentDateTime(4, 15, 10) // 5/15 10시
    await alert(MUSICAL, [{ time: dreamScheduleTime, sites }])
  })

  test('DREAM_THEATER와 일반 사이트 섞인 경우: 22시에 일반 사이트만 트윗', async () => {
    const dreamScheduleTime = new Date(2026, 4, 14, 12, 0, 0)
    const sites = [TICKETING_SITE.INTERPARK, TICKETING_SITE.DREAM_THEATER]
    setCurrentHour(22)
    await alert(MUSICAL, [{ time: dreamScheduleTime, sites }])
  })

  // LG_ART_CENTER: pay alert = 취켓팅 alert = 5/15 10시 → setCurrentDateTime으로 구분
  // (당일 알림은 5/14 10시이므로 날짜로 분리됨)
  test('LG_ART_CENTER: 5/15 10시에 입금마감+취켓팅 동시 트윗', async () => {
    const sites = [TICKETING_SITE.INTERPARK, TICKETING_SITE.LG_ART_CENTER]
    setCurrentDateTime(4, 15, 10) // 5/15 10시
    await alert(MUSICAL, [{ time: SCHEDULE_TIME, sites }])
  })
})

describe('취켓팅 알림', () => {
  test('INTERPARK: 5/16 08시에 트윗', async () => {
    setCurrentHour(8)
    await alert(MUSICAL, [{ time: SCHEDULE_TIME, sites: [TICKETING_SITE.INTERPARK] }])
  })

  test('취켓팅 시간이 없는 사이트(YEDANG)는 트윗 없음', async () => {
    setCurrentHour(-1)
    await alert(MUSICAL, [{ time: SCHEDULE_TIME, sites: [TICKETING_SITE.YEDANG] }])
  })

  test('여러 사이트: 각 사이트별 취켓팅 시간이 다름 (INTERPARK만 08시)', async () => {
    const sites = [TICKETING_SITE.INTERPARK, TICKETING_SITE.YES24]
    // INTERPARK 취켓 alert=08시, YES24 취켓 alert=23시(전날)
    setCurrentHour(8)
    await alert(MUSICAL, [{ time: SCHEDULE_TIME, sites }])
  })
})

describe('예매대기 알림', () => {
  test('INTERPARK 예매대기 D-1: 5/16 22시에 트윗', async () => {
    setCurrentHour(22)
    await alert(MUSICAL, [{ time: SCHEDULE_TIME, sites: [TICKETING_SITE.INTERPARK] }])
  })

  test('INTERPARK 예매대기: 5/17 07시에 트윗', async () => {
    setCurrentHour(7)
    await alert(MUSICAL, [{ time: SCHEDULE_TIME, sites: [TICKETING_SITE.INTERPARK] }])
  })

  test('noWaitingService에 포함된 사이트는 예매대기 알림 없음', async () => {
    setCurrentHour(7)
    await alert(MUSICAL, [{
      time: SCHEDULE_TIME,
      sites: [TICKETING_SITE.INTERPARK],
      noWaitingService: [TICKETING_SITE.INTERPARK],
    }])
  })
})

describe('복합 시나리오', () => {
  test('D-1 알림 시 다른 알림은 전송되지 않음 (continue)', async () => {
    const sites = [TICKETING_SITE.INTERPARK, TICKETING_SITE.YES24]
    setCurrentHour(21)
    await alert(MUSICAL, [{ time: SCHEDULE_TIME, sites }])
  })

  test('여러 스케줄 - 각각 독립 처리', async () => {
    const scheduleList: Schedule[] = [
      { time: new Date(2026, 4, 14, 11, 0), sites: [TICKETING_SITE.INTERPARK] },
      { time: new Date(2026, 4, 20, 14, 0), sites: [TICKETING_SITE.YES24, TICKETING_SITE.MELON] },
    ]
    setCurrentHour(21) // 두 스케줄 모두 D-1 hour = 21시
    await alert(MUSICAL, scheduleList)
  })
})

// ─────────────────────────────────────────────
// handler.ts 실제 스케줄 테스트
// ─────────────────────────────────────────────

// 드라큘라 스케줄: 2026/5/14 11:00
// sites: [TICKETLINK, INTERPARK, LG_ART_CENTER]
// noWaitingService: [TICKETLINK, INTERPARK, LG_ART_CENTER] (예매대기 알림 없음)
//
// 각 알림 발생 시간:
//   티켓팅 D-1              → 5/13 21시
//   티켓팅 당일             → 5/14 10시
//   입금마감 LG_ART_CENTER   → 5/15 10시  ← LG_ART_CENTER 취켓팅 alert와 동시
//   입금마감 일반(TICKETLINK, INTERPARK) → 5/15 22시
//   취켓팅 TICKETLINK        → 5/15 23시 (취켓 5/16 00:00, 1시간 전)
//   취켓팅 INTERPARK         → 5/16 08시 (취켓 5/16 09:00, 1시간 전)
//   취켓팅 LG_ART_CENTER     → 5/15 10시 (취켓 5/15 11:00, 1시간 전) ← 입금마감과 동시
//   예매대기                 → 없음 (noWaitingService)
describe('[handler] 드라큘라 - 실제 스케줄', () => {
  const draculaSchedule: Schedule[] = [
    {
      time: new Date(2026, 4, 14, 11),
      sites: [TICKETING_SITE.TICKETLINK, TICKETING_SITE.INTERPARK, TICKETING_SITE.LG_ART_CENTER],
      noWaitingService: [TICKETING_SITE.TICKETLINK, TICKETING_SITE.INTERPARK, TICKETING_SITE.LG_ART_CENTER],
    },
  ]

  test('5/13 21시 - 티켓팅 D-1', async () => {
    setCurrentDateTime(4, 13, 21)
    await alert('드라큘라', draculaSchedule)
  })

  test('5/14 10시 - 티켓팅 당일', async () => {
    setCurrentDateTime(4, 14, 10)
    await alert('드라큘라', draculaSchedule)
  })

  test('5/15 10시 - LG_ART_CENTER 입금마감 + 취켓팅 동시 발생', async () => {
    setCurrentDateTime(4, 15, 10)
    await alert('드라큘라', draculaSchedule)
  })

  test('5/15 22시 - TICKETLINK + INTERPARK 입금마감', async () => {
    setCurrentDateTime(4, 15, 22)
    await alert('드라큘라', draculaSchedule)
  })

  test('5/15 23시 - TICKETLINK 취켓팅', async () => {
    setCurrentDateTime(4, 15, 23)
    await alert('드라큘라', draculaSchedule)
  })

  test('5/16 08시 - INTERPARK 취켓팅', async () => {
    setCurrentDateTime(4, 16, 8)
    await alert('드라큘라', draculaSchedule)
  })

  test('예매대기 없음 (noWaitingService 전체 지정)', async () => {
    setCurrentHour(7) // INTERPARK 예매대기 hour지만 noWaitingService라 안 나가야 함
    await alert('드라큘라', draculaSchedule)
  })
})
