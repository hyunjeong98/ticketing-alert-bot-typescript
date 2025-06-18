import { TICKETING_SITE } from '../type/types'

// 취켓팅 시간 계산
function getCancelTicketTime(orgTicketingTime: Date, ticketingStie: TICKETING_SITE) {
  const result = new Date(orgTicketingTime)
  switch (ticketingStie) {
    case TICKETING_SITE.DAEJEON:
    case TICKETING_SITE.INTERPARK:
      result.setDate(orgTicketingTime.getDate() + 2)
      result.setHours(9)
      result.setMinutes(0)
      return result
    case TICKETING_SITE.MELON:
      result.setDate(orgTicketingTime.getDate() + 2)
      result.setHours(0)
      result.setMinutes(10)
      return result
    case TICKETING_SITE.SHOWNOTE:
      result.setDate(orgTicketingTime.getDate() + 2)
      result.setHours(0)
      result.setMinutes(10)
      return result
    case TICKETING_SITE.CHUNGMU:
      result.setDate(orgTicketingTime.getDate() + 2)
      result.setHours(2)
      result.setMinutes(10)
      return result
    case TICKETING_SITE.LOTTE:
    case TICKETING_SITE.TICKETLINK:
    case TICKETING_SITE.YES24:
      result.setDate(orgTicketingTime.getDate() + 2)
      result.setHours(0)
      result.setMinutes(0)
      return result
    case TICKETING_SITE.AUCTION:
      result.setDate(orgTicketingTime.getDate() + 2)
      result.setHours(0)
      result.setMinutes(7)
      return result
    case TICKETING_SITE.DREAM_THEATER:
    case TICKETING_SITE.CLIP_SERVEICE:
      result.setDate(orgTicketingTime.getDate() + 1)
      result.setHours(17)
      result.setMinutes(0)
      return result
    default:
      return null
  }
}

// 예매 대기 시간 계산
function getTicketWaitingTime(orgTicketingTime: Date, ticketingSite: TICKETING_SITE) {
  const result = new Date(orgTicketingTime)
  switch (ticketingSite) {
    case TICKETING_SITE.INTERPARK:
      result.setDate(orgTicketingTime.getDate() + 3)
      result.setHours(8)
      return result
    case TICKETING_SITE.TICKETLINK:
      result.setDate(orgTicketingTime.getDate() + 3)
      result.setHours(14)
      return result
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
      result.setDate(orgTicketingTime.getDate() + 1)
      result.setHours(11)
      result.setMinutes(59)
      return result
    default:
      result.setDate(result.getDate() + 1) // 티켓팅 다음날
      result.setHours(23)
      result.setMinutes(59)
      return result
  }
}

export {
  getCancelTicketTime,
  getTicketWaitingTime,
  getPayTime,
}