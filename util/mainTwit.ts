import { getCancelTicketTime, getTicketWaitingTime } from "./ticketingTime"
import { Schedule, TICKETING_SITE } from "../type/types"
import { format, hasWaitingService } from "./common"

export default function mainTwit(musicalName: string, ticketingNum: string, scheduleList: Schedule[]) {
  const ticketingPrint = scheduleList.map(elem => {
    return `${format(elem.time)} ${elem.sites.join(', ')}`
  })

  const cancelList: Schedule[] = []
  scheduleList.forEach(schedule => {
    schedule.sites.forEach(site => {
      if (site === TICKETING_SITE.TOPING_FIRST) return
      cancelList.push({
        time: getCancelTicketTime(schedule.time, site),
        sites: [site],
      })
    })
  })

  const cancelgroup: Schedule[] = []
  cancelList
    .sort((a, b) => +a.time - +b.time)
    .forEach((elem, i) => {
      if (i > 0 && elem.time.getTime() === cancelList[i - 1].time.getTime()) {
        cancelList[i - 1].sites.push(...elem.sites)
      } else {
        cancelgroup.push(elem)
      }
    })

  const cancelPrint = cancelgroup.map(elem => {
    return `${format(elem.time)} ${elem.sites.join(', ')}`
  })

  const waitingList: Schedule[] = []
  scheduleList.forEach(schedule => {
    schedule.sites.forEach(site => {
      if (hasWaitingService(site)) {
        waitingList.push({
          time: getTicketWaitingTime(schedule.time, site) || new Date(0),
          sites: [site],
        })
      }
    })
  })
  const waitingPrint = waitingList
    .sort((a, b) => {
      return +a.time - +b.time
    })
    .map(elem => {
      return `${format(elem.time)} ${elem.sites}`
    })

  const content =
    `<${musicalName}>\n` +
    `${ticketingNum} TICKET OPEN\n\n` +
    `[본 티켓팅]\n` +
    `${ticketingPrint.join('\n')}\n` +
    `\n[취켓팅]\n` +
    `${cancelPrint.join('\n')}\n` +
    `\n[예매대기]\n` +
    `${waitingPrint.join('\n')}`
  console.log(content)
  // await writeTwit(content)
}