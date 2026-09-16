import { getTicketWaitingTime } from './ticketingTime'
import { TICKETING_SITE } from '../constants/ticketingSite'

// 본 티켓팅 전날 알림 시간 계산
function getTicketingEveAlert(orgTicketingTime: Date) {
  const result = new Date(orgTicketingTime)
  result.setDate(result.getDate() - 1) // 티켓팅 전날
  result.setHours(21) // 오후 9시대
  return result
}

// 본 티켓팅 당일 알림 시간 계산
function getTicketingAlert(orgTicketingTime: Date) {
  const result = new Date(orgTicketingTime)
  result.setHours(result.getHours() - 1) // 티켓팅 당일 그 전시간
  return result
}

// 입금 마감 알림 시간 계산
function getPayAlert(orgTicketingTime: Date, ticketingSite?: TICKETING_SITE) {
  const result = new Date(orgTicketingTime)
  result.setDate(result.getDate() + 1) // 티켓팅 다음날

  switch (ticketingSite) {
    case TICKETING_SITE.DREAM_THEATER:
      result.setHours(10) // 오전 10시대
      break
    case TICKETING_SITE.LG_ART_CENTER:
      result.setHours(result.getHours() - 1)
      break
    default:
      result.setHours(22) // 오후 10시대
  }

  return result
}

// 취켓 알람 시간 계산
function getCancelAlert(cancelTicketTime: Date) {
  const result = new Date(cancelTicketTime)
  result.setHours(result.getHours() - 1)
  return result
}

// 예대 알람 시간 계산
function getWaitingAlert(orgTicketingTime: Date, ticketingSite: TICKETING_SITE) {
  const ticketWaitingTime = getTicketWaitingTime(orgTicketingTime, ticketingSite)
  if (!ticketWaitingTime) return
  const result = new Date(ticketWaitingTime)
  result.setHours(result.getHours() - 1)
  return result
}

// 예대 전날 알람 시간 계산
function getWaitingEveAlert(orgTicketingTime: Date, ticketingSite: TICKETING_SITE) {
  const ticketWaitingTime = getTicketWaitingTime(orgTicketingTime, ticketingSite)
  if (!ticketWaitingTime) return
  const result = new Date(ticketWaitingTime)
  result.setDate(result.getDate() - 1)
  result.setHours(22)
  return result
}

export {
  getTicketingEveAlert,
  getTicketingAlert,
  getPayAlert,
  getCancelAlert,
  getWaitingAlert,
  getWaitingEveAlert,
}
