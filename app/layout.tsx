import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { ChannelsProvider } from '@/lib/channels-context'
import { ProgramsProvider } from '@/lib/programs-context'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Stream TV - Watch Live TV',
  description: 'Stream TV 是一项免费的在线流媒体服务，可让您在电脑、平板电脑或智能手机上观看直播电视频道。',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <ChannelsProvider>
          <ProgramsProvider>
            {children}
          </ProgramsProvider>
        </ChannelsProvider>
        <Analytics />
      </body>
    </html>
  )
}
