import { getCancelTicketTime, getTicketWaitingTime } from "./ticketingTime"
import { Schedule, TICKETING_SITE } from "../type/types"
import { format, hasWaitingService } from "./common"

export default function mainTwit(musicalName: string, ticketingNum: string, scheduleList: Schedule[], excludeSites: TICKETING_SITE[] = []) {
  const ticketingPrint = scheduleList.map(elem => {
    const sitePrint = elem.sites.map(site => site === TICKETING_SITE.INTERPARK_SYNC ? '인터파크' : site).join(', ')
    return `${format(elem.time)} ${sitePrint}`
  })

  const cancelList: Schedule[] = []
  const usedSites = new Set<TICKETING_SITE>()
  scheduleList.forEach(schedule => {
    schedule.sites.forEach(site => {
      if (excludeSites.includes(site)) return
      const cancelTime = getCancelTicketTime(schedule.time, site)
      if (cancelTime == null || usedSites.has(site)) return
      usedSites.add(site)
      cancelList.push({
        time: cancelTime,
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
    const sitePrint = elem.sites.map(site => site === TICKETING_SITE.INTERPARK_SYNC ? '인터파크' : site).join(', ')
    return `${format(elem.time)} ${sitePrint}`
  })

  const waitingList: Schedule[] = []
  scheduleList.forEach(schedule => {
    schedule.sites.forEach(site => {
      if (excludeSites.includes(site)) return
      if (hasWaitingService(site, schedule.noWaitingService)) {
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
      const sitePrint = elem.sites.map(site => site === TICKETING_SITE.INTERPARK_SYNC ? '인터파크' : site).join(', ')
      return `${format(elem.time)} ${sitePrint}`
    })

  const content =
    `<${musicalName}>\n` +
    `${ticketingNum} 티켓 오픈\n\n` +
    `[본 티켓팅]\n` +
    `${ticketingPrint.join('\n')}\n` +
    `\n[취켓팅]\n` +
    `${cancelPrint.join('\n')}\n` +
    `\n[예매대기]\n` +
    `${waitingPrint.join('\n')}`
  console.log(content)
  // await writeTwit(content)
}