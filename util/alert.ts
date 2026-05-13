import { TwitterApi } from 'twitter-api-v2'
import { Schedule, TICKETING_SITE } from '../type/types'
import { hasWaitingService, isSameTime } from './common'
import { getCancelAlert, getPayAlert, getTicketingAlert, getTicketingEveAlert, getWaitingAlert, getWaitingEveAlert } from './alertTime'
import writeTweet from './writeTweet'
import { getCancelTicketTime, getPayTime, getTicketWaitingTime } from './ticketingTime'

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

async function handleTicketingEveAlert(client: TwitterApi, schedule: Schedule, musicalName: string): Promise<boolean> {
  if (!isSameTime(getTicketingEveAlert(schedule.time))) return false
  await writeTweet(client, '티켓팅 D-1', schedule.time, schedule.sites, musicalName)
  return true
}

async function handleTicketingAlert(client: TwitterApi, schedule: Schedule, musicalName: string): Promise<boolean> {
  if (!isSameTime(getTicketingAlert(schedule.time))) return false
  await writeTweet(client, '티켓팅', schedule.time, schedule.sites, musicalName)
  return true
}

async function handlePayAlert(client: TwitterApi, schedule: Schedule, targetSites: TICKETING_SITE[], musicalName: string): Promise<void> {
  // 특이 입금마감 시간을 가진 사이트 각각 처리
  for (const site of targetSites.filter(s => CUSTOM_PAY_SITES.includes(s))) {
    if (isSameTime(getPayAlert(schedule.time, site))) {
      await writeTweet(client, '입금마감', getPayTime(schedule.time, site), [site], musicalName)
    }
  }

  // 일반 입금마감 시간 사이트 묶어서 처리
  const generalSites = targetSites.filter(s => !CUSTOM_PAY_SITES.includes(s))
  if (generalSites.length > 0 && isSameTime(getPayAlert(schedule.time))) {
    await writeTweet(client, '입금마감', getPayTime(schedule.time), generalSites, musicalName)
  }
}

async function handleCancelAlert(client: TwitterApi, schedule: Schedule, site: TICKETING_SITE, musicalName: string): Promise<void> {
  const cancelTime = getCancelTicketTime(schedule.time, site)
  if (cancelTime == null) return
  if (isSameTime(getCancelAlert(cancelTime))) {
    await writeTweet(client, '취켓팅', cancelTime, [site], musicalName)
  }
}

async function handleWaitingAlerts(client: TwitterApi, schedule: Schedule, site: TICKETING_SITE, musicalName: string): Promise<void> {
  if (!hasWaitingService(site, schedule.noWaitingService)) return

  const waitingTime = getTicketWaitingTime(schedule.time, site)
  if (isSameTime(getWaitingEveAlert(schedule.time, site))) {
    await writeTweet(client, '예매대기 D-1', waitingTime!, [site], musicalName)
    return
  }
  if (isSameTime(getWaitingAlert(schedule.time, site))) {
    await writeTweet(client, '예매대기', waitingTime!, [site], musicalName)
  }
}

export default async function alert(musicalName: string, scheduleList: Schedule[], ticketingOnlySites: TICKETING_SITE[] = []) {

  const client = new TwitterApi({
    appKey: process.env.APP_KEY!,
    appSecret: process.env.APP_SECRET!,
    accessToken: process.env.ACCESS_TOKEN!,
    accessSecret: process.env.ACCESS_SECRET!,
  })

  const allTicketingOnlySites = [...TICKETING_ONLY_SITES, ...ticketingOnlySites]

  for (const schedule of scheduleList) {
    if (await handleTicketingEveAlert(client, schedule, musicalName)) continue
    if (await handleTicketingAlert(client, schedule, musicalName)) continue

    const targetSites = schedule.sites.filter(s => !allTicketingOnlySites.includes(s))
    if (targetSites.length === 0) continue

    await handlePayAlert(client, schedule, targetSites, musicalName)

    for (const site of targetSites) {
      await handleCancelAlert(client, schedule, site, musicalName)
      await handleWaitingAlerts(client, schedule, site, musicalName)
    }
  }
}
