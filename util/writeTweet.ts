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
  const sitePrint = sites.map(site => site === TICKETING_SITE.INTERPARK_SYNC ? '인터파크' : site).join(', ')
  await client.v2.tweet(
    `[${alertType}] ${musicalName} \n\u{1F352} ${format(
      time
    )} \n\u{1F352} ${sitePrint}`
  )
}
