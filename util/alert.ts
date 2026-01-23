import { TwitterApi } from 'twitter-api-v2'
import { Schedule, TICKETING_SITE } from '../type/types'
import { hasWaitingService, isSameTime } from './common'
import { getCancelAlert, getPayAlert, getTicketingAlert, getTicketingEveAlert, getWaitingAlert, getWaitingEveAlert } from './alertTime'
import writeTweet from './writeTweet'
import { getCancelTicketTime, getPayTime, getTicketWaitingTime } from './ticketingTime'

export default async function alert(musicalName: string, scheduleList: Schedule[], excludeSites: TICKETING_SITE[] = []) {

  const client = new TwitterApi({
    appKey: process.env.APP_KEY!,
    appSecret: process.env.APP_SECRET!,
    accessToken: process.env.ACCESS_TOKEN!,
    accessSecret: process.env.ACCESS_SECRET!,
  })

  const cardPaymentSites = [TICKETING_SITE.META, TICKETING_SITE.BUSAN_BANK, TICKETING_SITE.MON]

  for (const schedule of scheduleList) {
    // 티켓팅 전날 알림
    if (isSameTime(getTicketingEveAlert(schedule.time))) {
      await writeTweet(client, '티켓팅 D-1', schedule.time, schedule.sites, musicalName)
      continue
    }

    // 티켓팅 당일 알림
    if (isSameTime(getTicketingAlert(schedule.time))) {
      await writeTweet(client, '티켓팅', schedule.time, schedule.sites, musicalName)
      continue
    }

    // 카드 결제 사이트, 토핑 선예매 사이트, 제외 사이트는 아래 알림 패스
    const targetSites = schedule.sites.filter(site => 
      !cardPaymentSites.includes(site) && 
      !excludeSites.includes(site) && 
      site !== TICKETING_SITE.TOPING_FIRST
    )
    if (targetSites.length === 0) continue

    // 입금 마감 알림
    const specificSites = [TICKETING_SITE.DREAM_THEATER, TICKETING_SITE.LG_ART_CENTER]
    const scheduleSpecificSites = targetSites.filter(site => specificSites.includes(site))
    if (scheduleSpecificSites.length > 0) {
      const notSpecificSites = targetSites.filter(site => !specificSites.includes(site))
      if (isSameTime(getPayAlert(schedule.time, scheduleSpecificSites[0]))) {
        await writeTweet(client, '입금마감', getPayTime(schedule.time, scheduleSpecificSites[0]), [scheduleSpecificSites[0]], musicalName)
        continue
      }
      if (isSameTime(getPayAlert(schedule.time))) {
        await writeTweet(client, '입금마감', getPayTime(schedule.time), notSpecificSites, musicalName)
        continue
      }
    } else {
      if (isSameTime(getPayAlert(schedule.time))) {
        await writeTweet(client, '입금마감', getPayTime(schedule.time), targetSites, musicalName)
        continue
      }
    }

    for (const site of targetSites) {
      // 취켓팅 알림
      const cancelTime = getCancelTicketTime(schedule.time, site)
      if (cancelTime == null) continue
      if (isSameTime(getCancelAlert(cancelTime))) {
        await writeTweet(client, '취켓팅', cancelTime, [site], musicalName)
        continue
      }

      if (hasWaitingService(site, schedule.noWaitingService)) {
        // 예매대기 전날 알림
        const waitingTime = getTicketWaitingTime(schedule.time, site)
        if (isSameTime(getWaitingEveAlert(schedule.time, site))) {
          await writeTweet(client, '예매대기 D-1', waitingTime!, [site], musicalName)
          continue
        }
        if (isSameTime(getWaitingAlert(schedule.time, site))) {
          await writeTweet(client, '예매대기', waitingTime!, [site], musicalName)
          continue
        }
      }
    }
  }
}