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
  const sitePrint = sites.map(site => site === TICKETING_SITE.NOL_SYNC ? 'NOL' : site).join(', ')
  const content = `[${alertType}] ${musicalName} \n\u{1F352} ${format(time)} \n\u{1F352} ${sitePrint}`

  if (process.env.NODE_ENV === 'qa') {
    console.log(`[QA] 트윗 미발송:\n${content}`)
    return
  }

  await client.v2.tweet(content)
}
