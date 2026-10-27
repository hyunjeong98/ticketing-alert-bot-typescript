import { TICKETING_SITE } from '../constants/ticketingSite'
import { setKstHours } from './kst'

// 취켓팅 시간 계산
function getCancelTicketTime(orgTicketingTime: Date, ticketingStie: TICKETING_SITE) {
  const result = new Date(orgTicketingTime)
  switch (ticketingStie) {
    case TICKETING_SITE.DAEJEON:
    case TICKETING_SITE.NOL:
      result.setDate(orgTicketingTime.getDate() + 2)
      result.setMinutes(0)
      return setKstHours(result, 9)
    case TICKETING_SITE.NOL_SYNC:
      result.setDate(orgTicketingTime.getDate() + 2)
      result.setMinutes(0)
      return setKstHours(result, 2)
    case TICKETING_SITE.MELON:
      result.setDate(orgTicketingTime.getDate() + 2)
      result.setMinutes(10)
      return setKstHours(result, 0)
    case TICKETING_SITE.SHOWNOTE:
      result.setDate(orgTicketingTime.getDate() + 2)
      result.setMinutes(10)
      return setKstHours(result, 0)
    case TICKETING_SITE.CHUNGMU:
      result.setDate(orgTicketingTime.getDate() + 2)
      result.setMinutes(10)
      return setKstHours(result, 2)
    case TICKETING_SITE.LOTTE:
    case TICKETING_SITE.TICKETLINK:
    case TICKETING_SITE.YES24:
      result.setDate(orgTicketingTime.getDate() + 2)
      result.setMinutes(0)
      return setKstHours(result, 0)
    case TICKETING_SITE.AUCTION:
      result.setDate(orgTicketingTime.getDate() + 2)
      result.setMinutes(7)
      return setKstHours(result, 0)
    case TICKETING_SITE.DREAM_THEATER:
    case TICKETING_SITE.CLIP_SERVEICE:
      result.setDate(orgTicketingTime.getDate() + 1)
      result.setMinutes(0)
      return setKstHours(result, 17)
    case TICKETING_SITE.LG_ART_CENTER:
      result.setDate(orgTicketingTime.getDate() + 1)
      return result
    default:
      return null
  }
}

// 예매 대기 시간 계산
function getTicketWaitingTime(orgTicketingTime: Date, ticketingSite: TICKETING_SITE) {
  const result = new Date(orgTicketingTime)
  switch (ticketingSite) {
    case TICKETING_SITE.NOL:
      result.setDate(orgTicketingTime.getDate() + 3)
      return setKstHours(result, 8)
    case TICKETING_SITE.TICKETLINK:
      result.setDate(orgTicketingTime.getDate() + 3)
      return setKstHours(result, 14)
    default:
      return null
  }
}

// 입금 마감 시간 계산
function getPayTime(orgTicketingTime: Date, ticketingSite?: TICKETING_SITE) {
  const result = new Date(orgTicketingTime)
  switch (ticketingSite) {
    case TICKETING_SITE.CLIP_SERVEICE:
    case TICKETING_SITE.DREAM_THEATER:
      result.setDate(result.getDate() + 1)
      result.setMinutes(0)
      return setKstHours(result, 17)
    case TICKETING_SITE.LG_ART_CENTER:
      result.setDate(result.getDate() + 1)
      return result
    default:
      result.setDate(result.getDate() + 1) // 티켓팅 다음날
      result.setMinutes(59)
      return setKstHours(result, 23)
  }
}

export {
  getCancelTicketTime,
  getTicketWaitingTime,
  getPayTime,
}
