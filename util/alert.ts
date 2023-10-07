import { TwitterApi } from 'twitter-api-v2'
import { Schedule, TICKETING_SITE } from '../type/types'
import { hasWaitingService, isSameTime } from './common'
import { getCancelAlert, getPayAlert, getTicketingAlert, getTicketingEveAlert, getWaitingAlert, getWaitingEveAlert } from './alertTime'
import writeTweet from './writeTweet'

export default async function alert(musicalName: string, scheduleList: Schedule[]) {

  const client = new TwitterApi({
    appKey: process.env.APP_KEY!,
    appSecret: process.env.APP_SECRET!,
    accessToken: process.env.ACCESS_TOKEN!,
    accessSecret: process.env.ACCESS_SECRET!,
  })

  for (const schedule of scheduleList) {
    // 티켓팅 전날 알림
    if (isSameTime(getTicketingEveAlert(schedule.time))) {
      await writeTweet(client, '티켓팅 D-1', schedule, musicalName)
      continue
    }

    // 티켓팅 당일 알림
    if (isSameTime(getTicketingAlert(schedule.time))) {
      await writeTweet(client, '티켓팅', schedule, musicalName)
      continue
    }

    // 토핑 선예매는 아래 알림 패스
    if (schedule.sites.includes(TICKETING_SITE.TOPING_FIRST)) {
      continue
    }

    // 입금 마감 알림
    if (isSameTime(getPayAlert(schedule.time))) {
      await writeTweet(client, '입금마감', schedule, musicalName)
      continue
    }

    for (const site of schedule.sites) {
      // 취켓팅 알림
      if (isSameTime(getCancelAlert(schedule.time, site))) {
        await writeTweet(client, '취켓팅', schedule, musicalName)
        continue
      }

      if (hasWaitingService(site)) {
        // 예매대기 전날 알림
        if (isSameTime(getWaitingEveAlert(schedule.time, site))) {
          await writeTweet(client, '예매대기 D-1', schedule, musicalName)
          continue
        }
        if (isSameTime(getWaitingAlert(schedule.time, site))) {
          await writeTweet(client, '예매대기', schedule, musicalName)
          continue
        }
      }
    }
  }
}