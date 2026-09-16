import { TICKETING_SITE } from '../constants/ticketingSite'
import {
  getCancelAlert,
  getPayAlert,
  getTicketingAlert,
  getTicketingEveAlert,
  getWaitingAlert,
  getWaitingEveAlert,
} from './alertTime'
import { getCancelTicketTime, getPayTime, getTicketWaitingTime } from './ticketingTime'

export type Schedule = {
  time: Date
  sites: TICKETING_SITE[]
  noWaitingService?: TICKETING_SITE[]
}

export type AlertRow = {
  alertType: string
  site: TICKETING_SITE
  fireAt: Date
  displayTime: Date
  expiresAt: Date // 이 시각이 지나면 늦은 알림이라 보내지 않고 건너뛴다 (람다 실행 주기: 매시 40분)
}

const ALERT_GRACE_MS = 60 * 60 * 1000

// 티켓팅 D-1/당일 알림만 제공하는 고정 사이트 (입금마감, 취켓팅, 예매대기 알림 없음)
const TICKETING_ONLY_SITES = [
  TICKETING_SITE.META,
  TICKETING_SITE.BUSAN_BANK,
  TICKETING_SITE.MON,
  TICKETING_SITE.TOPING_FIRST,
]

// 일반과 다른 입금마감 시간을 가진 사이트
const CUSTOM_PAY_SITES = [
  TICKETING_SITE.DREAM_THEATER,
  TICKETING_SITE.LG_ART_CENTER,
]

function hasWaitingService(site: TICKETING_SITE, noWaitingService?: TICKETING_SITE[]) {
  if (noWaitingService?.includes(site)) return false

  switch (site) {
    case TICKETING_SITE.NOL:
    case TICKETING_SITE.TICKETLINK:
      return true
    default:
      return false
  }
}

// schedule 하나를 등록할 때, 발송해야 할 모든 알림(시각 포함)을 한 번에 계산한다.
// fireAt: 이 시각이 되면 트윗을 보낸다 / displayTime: 트윗 문구에 표시할 시각 / expiresAt: 이 시각 넘으면 건너뜀
export function generateScheduleAlerts(schedule: Schedule, ticketingOnlySites: TICKETING_SITE[] = []): AlertRow[] {
  const rows: AlertRow[] = []
  const allTicketingOnlySites = [...TICKETING_ONLY_SITES, ...ticketingOnlySites]

  function push(alertType: string, site: TICKETING_SITE, fireAt: Date, displayTime: Date) {
    rows.push({ alertType, site, fireAt, displayTime, expiresAt: new Date(fireAt.getTime() + ALERT_GRACE_MS) })
  }

  for (const site of schedule.sites) {
    push('티켓팅 D-1', site, getTicketingEveAlert(schedule.time), schedule.time)
    push('티켓팅', site, getTicketingAlert(schedule.time), schedule.time)
  }

  const targetSites = schedule.sites.filter(site => !allTicketingOnlySites.includes(site))

  for (const site of targetSites) {
    if (CUSTOM_PAY_SITES.includes(site)) {
      push('입금마감', site, getPayAlert(schedule.time, site), getPayTime(schedule.time, site))
    } else {
      push('입금마감', site, getPayAlert(schedule.time), getPayTime(schedule.time))
    }

    const cancelTime = getCancelTicketTime(schedule.time, site)
    if (cancelTime) {
      push('취켓팅', site, getCancelAlert(cancelTime), cancelTime)
    }

    if (hasWaitingService(site, schedule.noWaitingService)) {
      const waitingTime = getTicketWaitingTime(schedule.time, site)!
      push('예매대기 D-1', site, getWaitingEveAlert(schedule.time, site)!, waitingTime)
      push('예매대기', site, getWaitingAlert(schedule.time, site)!, waitingTime)
    }
  }

  return rows
}
