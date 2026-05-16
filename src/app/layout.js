import './globals.css'
import { AuthContextProvider } from '@/src/context/AuthContext'

export const metadata = {
  title: 'Academic Portal — SEIS',
  description: 'Student Enrollment Information System — Manage courses, alerts, and your academic journey.',
}

export default function RootLayout({ children }) {
  return (
    <html lang='en' className='light'>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-academic-gradient min-h-screen text-on-surface">
        <AuthContextProvider>{children}</AuthContextProvider>
      </body>
    </html>
  )
}
