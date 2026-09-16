import './globals.css'
import { ReactNode } from 'react'
import Providers from './providers'
import { isQa } from '../lib/env'

export const metadata = {
  title: isQa ? '티켓팅 알람 어드민 (QA)' : '티켓팅 알람 어드민',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
