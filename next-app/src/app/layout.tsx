import { Inter } from 'next/font/google'
import './globals.css'
import { VacancyProvider } from './context/VacancyContext'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className={inter.className}>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" />
      </head>
      <body className="bg-gray-50">
        <VacancyProvider>
          {children}
        </VacancyProvider>
      </body>
    </html>
  )
}