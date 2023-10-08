import { TwitterApi } from 'twitter-api-v2'
import { format } from './common'
import { TICKETING_SITE } from '../type/types'

export default async function writeTweet(
  client: TwitterApi,
  alertType: string,
  time: Date,
  sites: TICKETING_SITE[],
  musicalName: string
) {
  await client.v2.tweet(
    `[${alertType}] ${musicalName} \n\u{1F352} ${format(
      time
    )} \n\u{1F352} ${sites.join(', ')}`
  )
}
