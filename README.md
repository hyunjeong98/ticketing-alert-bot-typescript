# 뮤지컬 티켓팅 알림 봇

뮤지컬 티켓팅 일정을 X(Twitter)에 자동으로 트윗해주는 봇입니다. AWS Lambda + Serverless Framework로 배포됩니다.

## 기능

티켓팅 일정에 따라 아래 알림을 자동으로 트윗합니다:

- **티켓팅 D-1** — 전날 오후 9시
- **티켓팅 당일** — 티켓팅 시간 1시간 전
- **입금마감** — 티켓팅 다음날 (사이트별 마감 시간 상이)
- **취켓팅** — 취소표 오픈 시간 1시간 전 (사이트별 상이)
- **예매대기 D-1** — 예매대기 전날 오후 10시
- **예매대기** — 예매대기 시간 1시간 전

또한 `mainTwit` 함수로 본 티켓팅 / 취켓팅 / 예매대기 일정을 한눈에 정리한 트윗 본문을 생성할 수 있습니다.

## 지원 티켓팅 사이트

| 상수 | 사이트명 |
|------|----------|
| `INTERPARK` | 인터파크 |
| `INTERPARK_SYNC` | 인터파크(연동) |
| `MELON` | 멜론티켓 |
| `TICKETLINK` | 티켓링크 |
| `YES24` | 예스24 |
| `SHOWNOTE` | 쇼노트 |
| `CHUNGMU` | 충무아트센터 |
| `AUCTION` | 옥션 |
| `LOTTE` | 샤롯데씨어터 |
| `DREAM_THEATER` | 드림씨어터 |
| `LG_ART_CENTER` | LG아트센터 |
| `DAEJEON` | 대전예술의전당 |
| `YEDANG` | 예술의 전당 |
| `CLIP_SERVEICE` | 클립서비스 |
| `TOPING_FIRST` | 인터파크 토핑 선예매 |
| `MON` | MON 멤버십 |
| `META` | 메타클럽 |
| `BUSAN_BANK` | 부산은행 |

## 설치

```bash
npm install
```

## 환경 변수 설정

`.env` 파일을 생성하고 Twitter API 키를 입력합니다:

```
APP_KEY=
APP_SECRET=
ACCESS_TOKEN=
ACCESS_SECRET=
```

## 사용법

`handler.ts`에서 공연명, 회차명, 티켓팅 일정을 설정합니다:

```ts
import { TICKETING_SITE } from './type/types'
import mainTwit from './util/mainTwit'
import alert from './util/alert'

const scheduleList = [
  {
    time: new Date(2026, 3, 7, 14), // 4월 7일 오후 2시
    sites: [TICKETING_SITE.INTERPARK, TICKETING_SITE.TICKETLINK],
  },
]

// 트윗 본문 미리보기
console.log(mainTwit('공연명', '1차', scheduleList))

// 알림 트윗 발송 (Lambda에서 주기적으로 실행)
await alert('공연명', scheduleList)
```

### `alert` 옵션

특정 사이트를 입금마감/취켓팅/예매대기 알림에서 제외하고 티켓팅 D-1/당일 알림만 받으려면 세 번째 인자로 전달합니다:

```ts
await alert('공연명', scheduleList, [TICKETING_SITE.INTERPARK])
```

특정 회차에서 예매대기 서비스가 없는 사이트는 `noWaitingService`로 지정합니다:

```ts
const scheduleList = [
  {
    time: new Date(2026, 3, 7, 14),
    sites: [TICKETING_SITE.INTERPARK, TICKETING_SITE.TICKETLINK],
    noWaitingService: [TICKETING_SITE.TICKETLINK],
  },
]
```

## 프로젝트 구조

```
handler.ts              # Lambda 진입점 — 공연 일정 설정
type/types.ts           # TICKETING_SITE enum, Schedule 타입
util/
  alert.ts              # 알림 트윗 발송 로직
  alertTime.ts          # 각 알림 발송 시간 계산
  ticketingTime.ts      # 취켓팅 / 예매대기 / 입금마감 시간 계산
  mainTwit.ts           # 트윗 본문 생성
  writeTweet.ts         # Twitter API 호출
  common.ts             # 날짜 포맷 등 공통 유틸
```
