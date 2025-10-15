export enum TICKETING_SITE {
  CHUNGMU = '충무아트센터',
  INTERPARK = '인터파크',
  MELON = '멜론티켓',
  TICKETLINK = '티켓링크',
  YES24 = '예스24',
  SHOWNOTE = '쇼노트',
  YEDANG = '예술의 전당',
  AUCTION = '옥션',
  LOTTE = '샤롯데씨어터',
  TOPING_FIRST = '인터파크 토핑 선예매',
  DAEJEON = '대전예술의전당',
  MON = 'MON 멤버십',
  META = '메타클럽',
  DREAM_THEATER = '드림씨어터',
  BUSAN_BANK = '부산은행',
  CLIP_SERVEICE = '클립서비스',
  LG_ART_CENTER = 'LG아트센터',
}

export type Schedule = {
  time: Date,
  sites: TICKETING_SITE[]
}