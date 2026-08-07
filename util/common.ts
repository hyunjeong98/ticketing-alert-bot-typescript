import { TICKETING_SITE } from "../type/types"

function format(time: Date) {
  const month = (time.getMonth() + 1).toString()
  const date = time.getDate().toString()
  const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토']
  const day = WEEKDAY[time.getDay()]
  const hour = time.getHours().toString().padStart(2, '0')
  const minute = time.getMinutes().toString().padStart(2, '0')

  return `${month}/${date}(${day}) ${hour}:${minute}`
}

function isSameTime(targetTime: Date | undefined) {
  if (!targetTime) return false

  // 현재 시간을 한국시간으로 변환
  const now = new Date()
  const utcNow = now.getTime() + now.getTimezoneOffset() * 60 * 1000
  const koreaNow = new Date(utcNow + 9 * 60 * 60 * 1000)
  const month = koreaNow.getMonth()
  const date = koreaNow.getDate()
  const hour = koreaNow.getHours()

  // 현재 시간이 주어진 시간과 같은지 확인
  if (
    targetTime.getMonth() === month &&
    targetTime.getDate() === date &&
    targetTime.getHours() === hour
  ) {
    return true
  }
  return false
}

function hasWaitingService(site: TICKETING_SITE, noWaitingService?: TICKETING_SITE[]) {
  // 명시적으로 대기 서비스가 없다고 지정된 경우
  if (noWaitingService?.includes(site)) {
    return false
  }

  // 기본 대기 서비스 제공 사이트
  switch (site) {
    case TICKETING_SITE.NOL:
    case TICKETING_SITE.TICKETLINK:
      return true
    default:
      return false
  }
}

export {
  format,
  isSameTime,
  hasWaitingService
}

