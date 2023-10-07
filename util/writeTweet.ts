import { TwitterApi } from 'twitter-api-v2'
import { format } from './common'
import { Schedule } from '../type/types'

export default async function writeTweet(
  client: TwitterApi,
  alertType: string,
  schedule: Schedule,
  musicalName: string
) {
  await client.v2.tweet(
    `[${alertType}] ${musicalName} \n\u{1F352} ${format(
      schedule.time
    )} \n\u{1F352} ${schedule.sites.join(', ')}`
  )
}
