import '../styles/globals.css'

export const metadata = {
  title: 'My Next.js App',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-nice-gray text-nice-white">
        {children}
      </body>
    </html>
  )
}
