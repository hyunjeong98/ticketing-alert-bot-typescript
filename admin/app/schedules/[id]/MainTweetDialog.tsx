'use client'

import { useMemo, useState } from 'react'
import mainTwit from '../../../lib/mainTwit'
import { TICKETING_SITE } from '../../../constants/ticketingSite'
import Button from '../../../components/Button'
import TextInput from '../../../components/TextInput'
import Field from '../../../components/Field'
import { ScheduleRow } from '../../../lib/schedules'

export default function MainTweetDialog({ schedule, onClose }: { schedule: ScheduleRow; onClose: () => void }) {
  const [ticketingNum, setTicketingNum] = useState('')
  const [copied, setCopied] = useState(false)

  const content = useMemo(() => {
    return mainTwit(schedule.musical_name, ticketingNum, [
      {
        time: new Date(schedule.open_time),
        sites: schedule.sites as TICKETING_SITE[],
        noWaitingService: schedule.no_waiting_service as TICKETING_SITE[],
      },
    ])
  }, [schedule, ticketingNum])

  async function handleCopy() {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">메인 트윗</h2>

        <Field label="티켓 오픈 회차 (예: 4차)">
          <TextInput
            type="text"
            value={ticketingNum}
            onChange={(e) => setTicketingNum(e.target.value)}
            autoFocus
          />
        </Field>

        <textarea
          readOnly
          value={content}
          rows={12}
          className="w-full min-w-0 resize-none rounded-md border border-gray-300 p-3 text-sm"
        />

        <div className="mt-4 flex gap-2">
          <Button onClick={handleCopy}>{copied ? '복사됨!' : '복사'}</Button>
          <Button variant="secondary" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </div>
  )
}
