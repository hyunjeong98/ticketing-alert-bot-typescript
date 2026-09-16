import './globals.css'
import { ReactNode } from 'react'
import Providers from './providers'

export const metadata = {
  title: '티켓팅 알람 어드민',
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
