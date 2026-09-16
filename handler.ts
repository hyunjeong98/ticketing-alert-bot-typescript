import { TwitterApi } from 'twitter-api-v2'
import { TICKETING_SITE } from './type/types'
import writeTweet from './util/writeTweet'
import { groupDueAlerts } from './util/groupDueAlerts'
import { deactivateFinishedSchedules, fetchAlertsToSend, markAlertsSent } from './util/db'

export async function xia() {
  const dueAlerts = await fetchAlertsToSend()
  const buckets = groupDueAlerts(dueAlerts)

  if (buckets.length > 0) {
    const client = new TwitterApi({
      appKey: process.env.APP_KEY!,
      appSecret: process.env.APP_SECRET!,
      accessToken: process.env.ACCESS_TOKEN!,
      accessSecret: process.env.ACCESS_SECRET!,
    })

    for (const bucket of buckets) {
      await writeTweet(client, bucket.alertType, bucket.displayTime, bucket.sites as TICKETING_SITE[], bucket.musicalName)
      await markAlertsSent(bucket.ids)
    }
  }

  await deactivateFinishedSchedules()

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'success',
    }),
  };
  return response
}
