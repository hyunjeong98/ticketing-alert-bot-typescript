import mainTwit from './util/mainTwit';
import { TICKETING_SITE } from './type/types';
import alert from './util/alert'

export async function xia() {

  const scheduleList = [
    { time: new Date(2023, 9, 7, 14), sites: [TICKETING_SITE.LOTTE] },
    { time: new Date(2023, 9, 8, 13), sites: [TICKETING_SITE.TOPING_FIRST] },
    { time: new Date(2023, 9, 8, 14), sites: [TICKETING_SITE.INTERPARK, TICKETING_SITE.TICKETLINK] },
  ]

  console.log(mainTwit('드라큘라', '1st', scheduleList))
  await alert('드라큘라', scheduleList)

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'success',
    }),
  };
  return response
}
